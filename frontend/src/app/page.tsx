'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStockQuote, getHotStocks, StockQuote } from '../lib/api'

function formatNumber(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/50 rounded-xl p-2.5">
      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[11px] font-headline font-bold text-on-surface leading-tight">{value}</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const isAnalyzingRef = useRef(false)
  const searchParams = useSearchParams()
  const stockCode = searchParams.get('code') || ''

  const [stockData, setStockData] = useState<StockQuote | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [hotStocks, setHotStocks] = useState<StockQuote[]>([])
  const [hotLoading, setHotLoading] = useState(true)
  const [analysisContent, setAnalysisContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [fallbackUrl, setFallbackUrl] = useState('https://wa.me/1234567890')
  const [placeholderText, setPlaceholderText] = useState('')
  const [currentDomain, setCurrentDomain] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Fetch stock data when code param changes
  useEffect(() => {
    if (!stockCode) {
      setStockData(null)
      return
    }
    let cancelled = false
    setStockLoading(true)
    getStockQuote(stockCode)
      .then(data => { if (!cancelled) setStockData(data) })
      .catch(() => { if (!cancelled) setStockData(null) })
      .finally(() => { if (!cancelled) setStockLoading(false) })
    return () => { cancelled = true }
  }, [stockCode])

  // Fetch hot stocks on mount
  useEffect(() => {
    let cancelled = false
    setHotLoading(true)
    getHotStocks()
      .then(data => { if (!cancelled) setHotStocks(data) })
      .catch(() => { if (!cancelled) setHotStocks([]) })
      .finally(() => { if (!cancelled) setHotLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Load fallback URL and placeholder text from public config
  useEffect(() => {
    setCurrentDomain(window.location.hostname)
    fetch('/api/config/public')
      .then(r => r.json())
      .then(data => {
        const settings = data.settings || []
        const fallback = settings.find((s: { key: string }) => s.key === 'fallback_redirect_url')
        if (fallback?.value) setFallbackUrl(fallback.value)
        const placeholder = settings.find((s: { key: string }) => s.key === 'diagnostic_placeholder_text')
        if (placeholder?.value) setPlaceholderText(placeholder.value)
      })
      .catch(() => {})
  }, [])

  // Ref to track active stream for abort
  const streamControllerRef = useRef<AbortController | null>(null)

  const startAnalysisStream = useCallback((symbol: string) => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
    }
    const controller = new AbortController()
    streamControllerRef.current = controller

    setIsStreaming(true)
    setAnalysisContent('')

    const url = `/api/analyze/${encodeURIComponent(symbol)}`

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAnalysisContent('❌ Stock not found or AI service unavailable.')
          setIsStreaming(false)
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          setAnalysisContent('❌ Stream read error.')
          setIsStreaming(false)
          return
        }
        const decoder = new TextDecoder()
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              fullText += line.slice(6)
              setAnalysisContent(fullText)
            }
          }
        }
        setIsStreaming(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setAnalysisContent('❌ AI analysis unavailable. Please try again.')
        }
        setIsStreaming(false)
      })
  }, [])

  const openModal = useCallback(() => {
    const modal = document.getElementById('diagnostic-modal')
    const submitBtn = document.getElementById('modal-submit-btn')
    if (!modal) return

    modal.classList.add('active')
    setRedirectUrl(null)

    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))

    if (submitBtn) {
      submitBtn.classList.add('grayscale', 'opacity-30')
      submitBtn.classList.remove('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.classList.remove('grayscale', 'opacity-30')
        submitBtn.classList.add('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
      }
    }, 1500)
  }, [])

  const closeModal = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
      streamControllerRef.current = null
    }
    setIsStreaming(false)

    const modal = document.getElementById('diagnostic-modal')
    const mask = document.getElementById('global-mask')
    if (modal) modal.classList.remove('active')
    if (mask) mask.classList.remove('active')
  }, [])

  const handlePrimaryClick = useCallback(() => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true

    const symbol = stockCode && stockData ? stockCode : searchInput.trim() || 'AAPL'
    startAnalysisStream(symbol)

    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.add('active')

    openModal()
    isAnalyzingRef.current = false
  }, [openModal, stockCode, stockData, searchInput, startAnalysisStream])

  useEffect(() => {
    const handleScroll = () => {
      const cta = document.getElementById('sticky-cta')
      if (!cta) return
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      if (scrollPercent > 70) {
        cta.classList.add('visible')
      } else {
        cta.classList.remove('visible')
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('scroll', handleScroll) }
  }, [])

  return (
    <>
      {/* Global Overlay Mask */}
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* Diagnostic Modal */}
      <div className="modal-container" id="diagnostic-modal">
        <div className="bg-surface rounded-3xl border border-white/5 p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <button className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={closeModal}>
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
            </div>
            <h2 className="font-headline text-2xl font-bold text-primary text-center">Market Intelligence</h2>
          </div>
          <div className="bg-background/50 rounded-2xl p-4 h-48 overflow-y-auto mb-6 border border-white/5 hide-scroll">
            <pre className="font-body text-sm text-on-surface-variant leading-loose whitespace-pre-wrap">
              {analysisContent ? (
                <>
                  {analysisContent}
                  {isStreaming && <span className="animate-pulse text-primary">▌</span>}
                </>
              ) : (
                placeholderText || '> Initializing analysis engine...'
              )}
            </pre>
          </div>
          <button
            onClick={() => {
              const url = redirectUrl || fallbackUrl
              if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                ;(window as any).gtag_report_conversion(url)
              } else {
                window.location.href = url
              }
            }}
            className="w-full py-3.5 rounded-full bg-primary/30 text-on-surface-variant font-headline font-bold text-[10px] tracking-[0.2em] uppercase border border-primary/20 flex items-center justify-center gap-2 transition-all duration-1000 grayscale opacity-30"
            id="modal-submit-btn"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 2c-5.517 0-9.997 4.48-9.997 9.997 0 1.765.459 3.424 1.266 4.872l-1.301 4.745 4.856-1.274c1.404.767 3.007 1.205 4.71 1.205 5.517 0 9.996-4.479 9.996-9.997 0-5.517-4.479-9.997-9.996-9.997zm6.394 14.161c-.266.75-1.547 1.365-2.127 1.458-.58.094-1.121.134-3.15-.658-2.6-1.015-4.275-3.664-4.405-3.837-.13-.173-1.055-1.405-1.055-2.677 0-1.271.65-1.897.881-2.157.231-.26.505-.325.674-.325.169 0 .338.001.485.008.151.007.354-.057.555.43.201.487.688 1.674.748 1.795.061.121.101.261.02.423-.081.162-.121.261-.242.401-.12.14-.253.313-.362.42-.119.117-.243.245-.104.482.139.237.618 1.02 1.327 1.65.912.81 1.682 1.061 1.919 1.179.237.118.376.098.515-.061.139-.159.595-.694.754-.925.159-.231.318-.195.536-.115.218.08 1.385.654 1.623.773.238.118.397.177.456.277.059.1.059.578-.207 1.328z"></path>
            </svg>
            <span className="btn-text">GET FULL REPORT</span>
          </button>
        </div>
      </div>

      {/* Top Ticker Bar */}
      <div className="w-full bg-slate-900/50 py-3 overflow-hidden whitespace-nowrap border-b border-white/5 z-[60] relative">
        <div className="flex items-center space-x-12 animate-marquee">
          {!hotLoading && hotStocks.length > 0 ? (
            [...hotStocks, ...hotStocks].map((stock, i) => (
              <span key={`ticker-${stock.symbol}-${i}`} className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                <span className="text-on-surface">{stock.symbol}</span> ${formatPrice(stock.price)} <span className={stock.change_percent >= 0 ? 'text-primary' : 'text-error'}>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
              </span>
            ))
          ) : (
            <>
              <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                <span className="text-on-surface">TSLA</span> $172.44 <span className="text-primary">+2.15%</span>
              </span>
              <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                <span className="text-on-surface">GOOGL</span> $142.12 <span className="text-error">-0.45%</span>
              </span>
              <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                <span className="text-on-surface">MSFT</span> $405.10 <span className="text-primary">+1.12%</span>
              </span>
              <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                <span className="text-on-surface">NVDA</span> $875.21 <span className="text-primary">+4.32%</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Top AppBar */}
      <nav className="fixed top-12 w-full z-50 px-6 py-4 flex justify-between items-center glass-nav border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          <span className="font-headline font-semibold text-on-surface tracking-tight text-lg">InsightLedger</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-widest text-primary hover:bg-primary/20 transition-all uppercase" onClick={handlePrimaryClick}>DIAGNOSE</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 flex flex-col items-center text-center relative overflow-hidden cosmic-gradient">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="w-20 h-20 rounded-3xl bg-surface border border-white/10 flex items-center justify-center mb-8 relative">
          <span className="material-symbols-outlined text-primary text-4xl">lightbulb_outline</span>
        </div>
        <h1 className="font-headline text-4xl font-semibold tracking-tight mb-4 text-on-surface">
          Predict with <span className="text-primary">Clarity</span>
        </h1>
        <p className="font-body text-on-surface-variant text-base max-w-xs mb-10 leading-relaxed">
          Smarter market insights powered by intuitive data analysis for the modern investor.
        </p>
        <div className="w-full max-w-sm space-y-4">
          <div className="relative">
            <input
              className="w-full bg-surface border border-white/10 rounded-2xl px-6 py-4 text-on-surface font-body focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm placeholder:text-on-surface-variant/50 shadow-inner"
              placeholder="Search market symbols..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePrimaryClick() }}
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
          </div>
          <button className="w-full bg-primary hover:bg-primary-dim text-background font-headline font-semibold py-4 rounded-2xl tracking-wide shadow-xl shadow-primary/10 transition-all active:scale-[0.98]" onClick={handlePrimaryClick}>
            Get Smart Analysis
          </button>
        </div>
      </section>

      {/* Stock Data Module - shows when ?code= parameter present */}
      {stockCode && (
        <section className="px-6 mb-10">
          <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h3 className="text-xs font-headline font-bold tracking-[0.3em] uppercase text-primary">Stock Data</h3>
              </div>
              {stockLoading ? (
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest animate-pulse">Loading...</span>
              ) : stockData ? (
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{stockData.exchange || stockData.currency || 'USD'}</span>
              ) : null}
            </div>

            {stockLoading ? (
              <div className="px-5 py-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : stockData ? (
              <div className="px-5 py-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-headline font-bold text-on-surface">{stockData.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Live</span>
                      {stockData.sector && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider truncate">{stockData.sector}</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant truncate">{stockData.name}{stockData.industry ? ` · ${stockData.industry}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-2xl font-headline font-bold text-on-surface">${formatPrice(stockData.price)}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className={`text-sm font-bold ${stockData.change >= 0 ? 'text-primary' : 'text-error'}`}>
                        {stockData.change >= 0 ? '+' : ''}{formatPrice(stockData.change)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        stockData.change_percent >= 0 ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                      }`}>
                        {stockData.change_percent >= 0 ? '▲' : '▼'} {Math.abs(stockData.change_percent).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <DataCell label="Open" value={stockData.open != null ? `$${formatPrice(stockData.open)}` : '—'} />
                  <DataCell label="Prev Close" value={stockData.prev_close != null ? `$${formatPrice(stockData.prev_close)}` : '—'} />
                  <DataCell label="Day Range" value={stockData.day_low != null && stockData.day_high != null ? `${formatPrice(stockData.day_low)}–${formatPrice(stockData.day_high)}` : '—'} />
                  <DataCell label="52W Range" value={stockData.fifty_two_week_low != null && stockData.fifty_two_week_high != null ? `${formatPrice(stockData.fifty_two_week_low)}–${formatPrice(stockData.fifty_two_week_high)}` : '—'} />
                  <DataCell label="Volume" value={formatNumber(stockData.volume)} />
                  <DataCell label="Avg Volume" value={stockData.avg_volume ? formatNumber(stockData.avg_volume) : '—'} />
                  <DataCell label="Market Cap" value={stockData.market_cap ? formatNumber(stockData.market_cap) : '—'} />
                  <DataCell label="P/E Ratio" value={stockData.pe_ratio != null ? stockData.pe_ratio.toFixed(2) : '—'} />
                  <DataCell label="EPS" value={stockData.eps != null ? `$${stockData.eps.toFixed(2)}` : '—'} />
                  <DataCell label="Div Yield" value={stockData.dividend_yield != null ? `${(stockData.dividend_yield * 100).toFixed(2)}%` : '—'} />
                  <DataCell label="Beta" value={stockData.beta != null ? stockData.beta.toFixed(2) : '—'} />
                  <DataCell label="Target Price" value={stockData.target_mean_price != null ? `$${formatPrice(stockData.target_mean_price)}` : '—'} />
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-on-surface-variant">Stock data unavailable for <span className="text-primary font-bold">{stockCode}</span></p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-14 px-6 bg-slate-900/40">
        <div className="mb-10 text-center">
          <h2 className="font-headline text-xl font-semibold text-on-surface tracking-tight mb-2">Smarter Data Processing</h2>
          <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="space-y-4">
          <div className="p-6 bg-surface rounded-3xl border border-white/5 flex items-start gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">neurology</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-on-surface text-base mb-1">Human-Centric Trends</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">Detecting meaningful market shifts across global sectors with ease.</p>
            </div>
          </div>
          <div className="p-6 bg-surface rounded-3xl border border-white/5 flex items-start gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary">speed</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-on-surface text-base mb-1">Real-time Clarity</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">Immediate processing of complex data into simple, actionable insights.</p>
            </div>
          </div>
          <div className="p-6 bg-surface rounded-3xl border border-white/5 flex items-start gap-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary">filter_list</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-on-surface text-base mb-1">Curated Selection</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">Precise stock screening based on quality fundamental indicators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 px-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-surface rounded-3xl text-center border border-white/5">
            <div className="font-headline text-2xl font-semibold text-primary mb-1">5,000+</div>
            <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Assets Tracked</div>
          </div>
          <div className="p-6 bg-surface rounded-3xl text-center border border-white/5">
            <div className="font-headline text-2xl font-semibold text-secondary mb-1">100+</div>
            <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Data Streams</div>
          </div>
          <div className="p-6 bg-surface rounded-3xl text-center border border-white/5">
            <div className="font-headline text-2xl font-semibold text-tertiary mb-1">24/7</div>
            <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Global Pulse</div>
          </div>
          <div className="p-6 bg-surface rounded-3xl text-center border border-white/5">
            <div className="font-headline text-2xl font-semibold text-primary mb-1">99.9%</div>
            <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Reliability</div>
          </div>
        </div>
      </section>

      {/* Hot Stocks / Sector Intelligence */}
      <section className="py-14 px-6 bg-slate-900/40">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-headline text-xl font-semibold text-on-surface tracking-tight">Sector Intelligence</h2>
            <p className="text-xs text-on-surface-variant font-body mt-1">Leading performers by score</p>
          </div>
          <span className="text-xs text-primary font-medium tracking-wide uppercase">View All</span>
        </div>

        {hotLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : hotStocks.length > 0 ? (
          <div className="space-y-4">
            {hotStocks.slice(0, 6).map((stock) => (
              <div key={stock.symbol} className="w-full bg-surface p-2 rounded-3xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-base">trending_up</span>
                  </div>
                  <h3 className="font-headline font-semibold text-on-surface text-sm flex-1">{stock.symbol}</h3>
                  <span className={`text-xs font-bold ${stock.change_percent >= 0 ? 'text-primary' : 'text-error'}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </span>
                  <p className="font-headline font-semibold text-on-surface text-sm">${formatPrice(stock.price)}</p>
                </div>
                <div className="px-4 py-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Volume</p>
                    <p className="text-xs font-bold text-on-surface font-body">{formatNumber(stock.volume)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Mkt Cap</p>
                    <p className="text-xs font-bold text-on-surface font-body">{stock.market_cap ? formatNumber(stock.market_cap) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">P/E</p>
                    <p className="text-xs font-bold text-on-surface font-body">{stock.pe_ratio != null ? stock.pe_ratio.toFixed(1) : '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-on-surface-variant">No hot stocks data available</p>
          </div>
        )}
      </section>

      {/* Capabilities Bento */}
      <section className="py-16 px-6">
        <div className="grid grid-cols-1 gap-5">
          <div className="p-8 bg-surface rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-4xl mb-6 block">shield_lock</span>
              <h3 className="font-headline text-lg font-semibold text-on-surface mb-3">Enterprise Security</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">Your data is protected by industry-standard encryption protocols, keeping your insights private.</p>
            </div>
          </div>
          <div className="p-8 bg-surface rounded-3xl border border-white/5">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">hub</span>
            <h3 className="font-headline text-lg font-semibold text-on-surface mb-3">Seamless Integration</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed font-body">Connect your existing workflow directly to our analysis mesh for real-time decision support.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 text-center">
        <div className="p-10 bg-gradient-to-br from-surface to-slate-900 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.05)_0%,transparent_60%)]"></div>
          <h2 className="font-headline text-2xl font-semibold text-on-surface mb-4 relative z-10">Ready for Smarter Insights?</h2>
          <p className="text-on-surface-variant text-sm mb-10 relative z-10 max-w-xs mx-auto leading-relaxed font-body">Join thousands of investors using human-centric data to navigate the markets.</p>
          <button className="w-full bg-primary hover:bg-primary-dim text-background font-headline font-semibold py-4 rounded-2xl tracking-wide shadow-lg transition-all active:scale-[0.98] relative z-10" onClick={handlePrimaryClick}>
            Start Free Analysis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background pt-16 pb-32 px-8 flex flex-col items-center border-t border-white/5">
        <div className="flex items-center gap-3 mb-10">
          <span className="material-symbols-outlined text-primary text-2xl">insights</span>
          <span className="font-headline font-semibold text-on-surface tracking-tight text-base">InsightLedger</span>
        </div>
        <div className="w-full max-w-xs mb-12">
          <button className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-headline font-semibold py-4 rounded-2xl tracking-wide transition-all flex items-center justify-center gap-3" onClick={handlePrimaryClick}>
            <span className="material-symbols-outlined">query_stats</span>
            Run Market Scan
          </button>
        </div>
        <div className="pt-10 border-t border-white/5 w-full text-center">
          <p className="font-body text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em]">&copy; 2026{currentDomain ? ` ${currentDomain} ` : ' '}INSIGHTLEDGER. DESIGNED FOR CLARITY.</p>
        </div>
      </footer>

      {/* Fixed Floating Action Button */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="sticky-cta">
        <button className="w-full bg-primary hover:bg-primary-dim text-background font-headline font-bold py-5 rounded-3xl tracking-wide shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-[0.98] transition-all" onClick={handlePrimaryClick}>
          <span className="material-symbols-outlined text-2xl animate-pulse">search_spark</span>
          Run Diagnostic Scan
        </button>
      </div>
    </>
  )
}
