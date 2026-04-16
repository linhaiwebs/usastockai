'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  const [tickerInput, setTickerInput] = useState('')
  const [modalState, setModalState] = useState<'closed' | 'loading' | 'result'>('closed')

  const streamControllerRef = useRef<AbortController | null>(null)
  const [progressWidth, setProgressWidth] = useState('0%')
  const [progressStatus, setProgressStatus] = useState('')

  useEffect(() => {
    if (!stockCode) { setStockData(null); return }
    let cancelled = false
    setStockLoading(true)
    getStockQuote(stockCode)
      .then(data => { if (!cancelled) setStockData(data) })
      .catch(() => { if (!cancelled) setStockData(null) })
      .finally(() => { if (!cancelled) setStockLoading(false) })
    return () => { cancelled = true }
  }, [stockCode])

  useEffect(() => {
    let cancelled = false
    setHotLoading(true)
    getHotStocks()
      .then(data => { if (!cancelled) setHotStocks(data) })
      .catch(() => { if (!cancelled) setHotStocks([]) })
      .finally(() => { if (!cancelled) setHotLoading(false) })
    return () => { cancelled = true }
  }, [])

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

  const startAnalysisStream = useCallback((symbol: string) => {
    if (streamControllerRef.current) streamControllerRef.current.abort()
    const controller = new AbortController()
    streamControllerRef.current = controller
    setIsStreaming(true)
    setAnalysisContent('')
    fetch(`/api/analyze/${encodeURIComponent(symbol)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) { setAnalysisContent('❌ Stock not found or AI service unavailable.'); setIsStreaming(false); return }
        const reader = response.body?.getReader()
        if (!reader) { setAnalysisContent('❌ Stream read error.'); setIsStreaming(false); return }
        const decoder = new TextDecoder()
        let fullText = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) { fullText += line.slice(6); setAnalysisContent(fullText) }
          }
        }
        setIsStreaming(false)
      })
      .catch((err) => { if (err.name !== 'AbortError') setAnalysisContent('❌ AI analysis unavailable.'); setIsStreaming(false) })
  }, [])

  const openModal = useCallback(() => {
    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.add('active')
    setModalState('loading')
    setProgressWidth('0%')
    setProgressStatus('INITIALIZING_SCAN...')
    setRedirectUrl(null)
    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))
    const seq = [
      { p: '25%', t: 'FETCHING_MARKET_DATA...' },
      { p: '55%', t: 'CALIBRATING_AI_MODEL...' },
      { p: '85%', t: 'GENERATING_DIAGNOSIS...' },
      { p: '100%', t: 'SCAN_COMPLETE.' },
    ]
    seq.forEach((s, i) => {
      setTimeout(() => {
        setProgressWidth(s.p); setProgressStatus(s.t)
        if (i === seq.length - 1) setTimeout(() => setModalState('result'), 600)
      }, (i + 1) * 700)
    })
  }, [])

  const closeModal = useCallback(() => {
    if (streamControllerRef.current) { streamControllerRef.current.abort(); streamControllerRef.current = null }
    setIsStreaming(false); setModalState('closed')
    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.remove('active')
  }, [])

  const handlePrimaryClick = useCallback(() => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true
    const symbol = stockCode && stockData ? stockCode : tickerInput.trim() || 'AAPL'
    startAnalysisStream(symbol); openModal()
    isAnalyzingRef.current = false
  }, [openModal, stockCode, stockData, tickerInput, startAnalysisStream])

  useEffect(() => {
    const onScroll = () => {
      const cta = document.getElementById('sticky-cta')
      if (!cta) return
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      cta.classList.toggle('visible', pct > 70)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeSymbol = stockCode && stockData ? stockCode : tickerInput.trim() || 'AAPL'

  return (
    <>
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ═══ COMPACT MODAL ═══ */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>

        <div className="relative w-full max-w-sm brutalist-border bg-black relative overflow-hidden">
          {/* Header bar */}
          <div className="bg-primary text-on-primary px-3 py-1.5 flex justify-between items-center">
            <h3 className="font-headline text-xs font-black tracking-widest">DIAGNOSIS_RESULT.EXE</h3>
            <button className="hover:scale-110 transition-transform" onClick={closeModal}>
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* LOADING */}
          {modalState === 'loading' && (
            <div className="p-5 flex flex-col items-center gap-4 animate-pulse-border">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">sync</span>
              <div className="text-center">
                <h3 className="font-headline text-lg font-black text-primary tracking-tighter uppercase mb-1">SCANNING_MARKET</h3>
                <p className="font-label text-[9px] text-white/60 tracking-widest uppercase">{progressStatus}</p>
              </div>
              <div className="w-full h-0.5 bg-surface-container overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: progressWidth }}></div>
              </div>
            </div>
          )}

          {/* RESULT — Compact */}
          {modalState === 'result' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 brutalist-border border-primary flex items-center justify-center shrink-0">
                  <span className="font-headline text-base font-bold text-primary">{activeSymbol.slice(0,4)}</span>
                </div>
                <div>
                  <div className="px-1.5 py-0.5 bg-primary/10 border border-primary/40 text-primary text-[8px] font-bold w-fit mb-0.5">SIGNAL_ACQUIRED</div>
                  <h4 className="font-headline text-sm font-bold uppercase tracking-tight">{stockData ? (stockData.change_percent >= 0 ? 'BREAKOUT_CONFIRMED' : 'DISTRIBUTION_DETECTED') : 'AI_VERDICT_READY'}</h4>
                </div>
              </div>

              <div className="bg-surface-container p-3 border-l-2 border-primary">
                <p className="font-body text-xs leading-relaxed text-white/90">
                  {analysisContent ? (
                    <>{analysisContent}{isStreaming && <span className="animate-pulse text-primary">▌</span>}</>
                  ) : (
                    placeholderText || 'AI is preparing your diagnosis report...'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-white/10 bg-surface-container-low">
                  <span className="block text-[8px] font-label text-white/40 uppercase">Signal_Strength</span>
                  <span className="text-primary font-headline text-sm font-bold">{stockData ? (stockData.change_percent >= 0 ? 'BULLISH' : 'BEARISH') : 'PENDING'}</span>
                </div>
                <div className="p-2 border border-white/10 bg-surface-container-low">
                  <span className="block text-[8px] font-label text-white/40 uppercase">Timeframe</span>
                  <span className="text-secondary font-headline text-sm font-bold">SHORT_TERM</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const url = redirectUrl || fallbackUrl
                  if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                    ;(window as any).gtag_report_conversion(url)
                  } else { window.location.href = url }
                }}
                className="w-full bg-primary text-on-primary p-3 font-headline font-black text-center uppercase tracking-widest hover:invert transition-all flex items-center justify-center gap-2 text-sm"
                id="modal-submit-btn"
              >
                <span className="material-symbols-outlined text-lg">forum</span>
                CHAT ON WHATSAPP
              </button>
            </div>
          )}
          <div className="scan-line !opacity-10"></div>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <header className="bg-black w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <h1 className="text-xl font-bold text-primary tracking-tighter font-headline uppercase">AVANT_ANALYST</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="font-label text-[10px] uppercase tracking-widest text-primary hover:opacity-80" href="#">Terminal</a>
          <a className="font-label text-[10px] uppercase tracking-widest text-white/40 hover:text-primary" href="#">Markets</a>
          <a className="font-label text-[10px] uppercase tracking-widest text-white/40 hover:text-primary" href="#">Signals</a>
        </nav>
        <button className="text-primary active:scale-95 duration-100">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main className="relative flex-1">
        <div className="noise-overlay fixed inset-0 z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">

          {/* ═══ HERO ═══ */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col items-start">
              <div className="bg-tertiary-container/10 backdrop-blur-xl px-2 py-1 mb-2 border-l-2 border-tertiary">
                <p className="font-label text-tertiary text-[10px] tracking-widest uppercase">SYS: LIVE</p>
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
                RAW_AI <span className="text-primary italic">DIAGNOSIS</span>
              </h2>
            </div>
            <div className="w-full max-w-3xl relative">
              <div className="bg-surface-container-low p-4 brutalist-border flex flex-col md:flex-row items-stretch gap-3">
                <div className="flex-1">
                  <label className="block font-label text-primary/60 text-[10px] uppercase tracking-widest mb-1">INPUT_TICKER</label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-secondary focus:ring-0 text-2xl md:text-4xl font-headline font-bold text-white placeholder:text-white/10 p-0 uppercase outline-none"
                    placeholder="AAPL..."
                    type="text"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === 'Enter' && tickerInput.trim()) handlePrimaryClick() }}
                  />
                </div>
                <button
                  className="bg-primary text-on-primary px-6 py-3 font-headline font-bold text-base uppercase tracking-tighter hover:bg-primary-fixed active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                  onClick={handlePrimaryClick}
                >
                  DIAGNOSE <span className="material-symbols-outlined text-lg">bolt</span>
                </button>
              </div>
            </div>
          </section>

          {/* ═══ TICKER BAR ═══ */}
          <div className="w-full bg-surface-container-lowest py-2 overflow-hidden whitespace-nowrap border-y border-white/5">
            <div className="flex items-center space-x-8 animate-marquee">
              {!hotLoading && hotStocks.length > 0 ? (
                [...hotStocks, ...hotStocks].map((stock, i) => (
                  <span key={`t-${stock.symbol}-${i}`} className="font-label text-[10px] tracking-widest text-white/40 flex items-center gap-1.5 uppercase">
                    <span className="text-on-surface font-bold">{stock.symbol}</span> ${formatPrice(stock.price)} <span className={stock.change_percent >= 0 ? 'text-primary' : 'text-error'}>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                  </span>
                ))
              ) : (
                <>
                  <span className="font-label text-[10px] tracking-widest text-white/40 flex items-center gap-1.5 uppercase"><span className="text-on-surface font-bold">TSLA</span> $172.44 <span className="text-primary">+2.15%</span></span>
                  <span className="font-label text-[10px] tracking-widest text-white/40 flex items-center gap-1.5 uppercase"><span className="text-on-surface font-bold">NVDA</span> $875.21 <span className="text-primary">+4.32%</span></span>
                  <span className="font-label text-[10px] tracking-widest text-white/40 flex items-center gap-1.5 uppercase"><span className="text-on-surface font-bold">MSFT</span> $405.10 <span className="text-primary">+1.12%</span></span>
                </>
              )}
            </div>
          </div>

          {/* ═══ STOCK DATA (when ?code= present) ═══ */}
          {stockCode && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-8 bg-surface-container/60 backdrop-blur-md p-4 brutalist-border border-primary relative overflow-hidden">
                <div className="scan-line"></div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  <h4 className="font-headline text-sm font-bold uppercase tracking-tighter text-primary">REPORT_SUMMARY: {stockData ? (stockData.change_percent >= 0 ? 'BULLISH_EXTREME' : 'BEARISH_PRESSURE') : 'LOADING...'}</h4>
                </div>
                {stockLoading ? (
                  <div className="flex justify-center py-8"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary animate-spin"></div></div>
                ) : stockData ? (
                  <>
                    <p className="font-body text-sm leading-snug mb-3">
                      AI detects <span className="text-primary font-bold">{stockData.change >= 0 ? 'accumulation phase' : 'distribution pressure'}</span> at ${formatPrice(stockData.price)} with target {stockData.change >= 0 ? 'upside' : 'downside'} of {Math.abs(stockData.change_percent).toFixed(1)}%.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-label font-bold uppercase">CONFIDENCE: {(80 + Math.abs(stockData.change_percent) * 2).toFixed(1)}%</div>
                      <div className="px-2 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary text-[9px] font-label font-bold uppercase">HORIZON: 14_DAYS</div>
                      <div className={`px-2 py-0.5 ${stockData.change_percent >= 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-error/10 border-error/20 text-error'} border text-[9px] font-label font-bold uppercase`}>RISK: {stockData.change_percent >= 0 ? 'MODERATE' : 'HIGH'}</div>
                    </div>
                  </>
                ) : null}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className={`p-3 flex gap-3 items-start ${stockData && stockData.change_percent < 0 ? 'bg-error' : 'bg-tertiary'} text-on-tertiary`}>
                  <span className="material-symbols-outlined text-lg">warning</span>
                  <div>
                    <h5 className="font-headline font-extrabold uppercase text-xs">ANOMALY_ALERT</h5>
                    <p className="text-[10px] leading-tight mt-0.5">Options delta suggests {stockData && stockData.change_percent < 0 ? 'downside' : 'upside'} pressure. Monitor closely.</p>
                  </div>
                </div>
                <div className="bg-surface-container-high p-3 border border-white/5 flex-1">
                  <span className="block text-[8px] font-label text-white/40 uppercase mb-1">Price_Data</span>
                  {stockData ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Volume</span><p className="text-xs font-bold text-primary">{formatNumber(stockData.volume)}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Mkt_Cap</span><p className="text-xs font-bold text-secondary">{stockData.market_cap ? formatNumber(stockData.market_cap) : '—'}</p></div>
                    </div>
                  ) : <p className="text-[10px] text-white/30">NO DATA</p>}
                </div>
              </div>
            </section>
          )}

          {/* ═══ HOT STOCKS ═══ */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="font-headline text-xl font-bold uppercase tracking-tighter">Market_Movers</h2>
                <p className="text-primary font-label text-[9px] tracking-widest uppercase">TOP_PERFORMERS</p>
              </div>
            </div>
            {hotLoading ? (
              <div className="flex justify-center py-10"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary animate-spin"></div></div>
            ) : hotStocks.length > 0 ? (
              <div className="space-y-2">
                {hotStocks.slice(0, 6).map((stock, i) => (
                  <div key={stock.symbol} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-high'} hover:bg-primary/5 transition-colors`}>
                    <span className="font-headline font-bold text-on-surface text-sm w-14">{stock.symbol}</span>
                    <span className="font-body text-xs text-white/50 flex-1">${formatPrice(stock.price)}</span>
                    <span className={`text-[10px] font-headline font-bold px-1.5 py-0.5 ${stock.change_percent >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </span>
                    <span className="text-[9px] font-label text-white/30 uppercase">{formatNumber(stock.volume)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 py-10 text-center">NO MARKET DATA AVAILABLE</p>
            )}
          </section>

          {/* ═══ CTA ═══ */}
          <section className="bg-primary p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="max-w-md text-center md:text-left relative z-10">
              <h2 className="font-headline text-2xl md:text-4xl font-extrabold text-on-primary tracking-tighter leading-none mb-2">
                FULL_TERMINAL_ACCESS
              </h2>
              <p className="font-body text-on-primary/80 text-xs">
                Join the closed-beta. Get direct AI stock analysis delivered via WhatsApp.
              </p>
            </div>
            <button
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-black text-primary px-6 py-4 font-headline font-black text-base uppercase tracking-widest hover:bg-surface-container-highest transition-all group shrink-0"
              onClick={handlePrimaryClick}
            >
              WHATSAPP
              <span className="material-symbols-outlined text-lg group-hover:translate-x-2 transition-transform">forum</span>
            </button>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">grid_view</span>
            </div>
          </section>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-black border-t border-white/5 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-primary font-bold font-headline text-xs tracking-tighter uppercase">AVANT_ANALYST_DEPT.</div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="font-headline text-[10px] uppercase tracking-widest text-white/40 hover:text-primary" href="/privacy">Privacy</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest text-white/40 hover:text-primary" href="/terms">Terms</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest text-tertiary hover:text-primary font-bold" href="/contact">WhatsApp</Link>
        </div>
        <p className="font-headline text-[9px] uppercase tracking-widest text-white/20">&copy; 2026{currentDomain ? ` ${currentDomain}` : ''} AVANT_ANALYST</p>
      </footer>

      {/* ═══ FAB ═══ */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-[80]" id="sticky-cta">
        <div className="max-w-xl mx-auto">
          <button
            className="w-full bg-primary text-on-primary py-4 font-headline font-black text-base uppercase tracking-widest hover:bg-primary-fixed active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(156,255,147,0.3)]"
            onClick={handlePrimaryClick}
          >
            DIAGNOSE NOW <span className="material-symbols-outlined text-lg">bolt</span>
          </button>
        </div>
      </div>
    </>
  )
}
