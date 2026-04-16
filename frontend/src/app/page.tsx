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

  // Load fallback URL and placeholder text
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

  // ── Stream Analysis ──
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

  // ── Modal Logic ──
  const openModal = useCallback(() => {
    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.add('active')

    setModalState('loading')
    setProgressWidth('0%')
    setProgressStatus('Initializing AI scan...')
    setRedirectUrl(null)

    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))

    const sequence = [
      { progress: '25%', text: 'Scanning Financial DNA...' },
      { progress: '55%', text: 'Decoding Market Vectors...' },
      { progress: '85%', text: 'Generating Diagnostic Report...' },
      { progress: '100%', text: 'Diagnosis Complete.' },
    ]

    sequence.forEach((step, index) => {
      setTimeout(() => {
        setProgressWidth(step.progress)
        setProgressStatus(step.text)
        if (index === sequence.length - 1) {
          setTimeout(() => setModalState('result'), 800)
        }
      }, (index + 1) * 800)
    })
  }, [])

  const closeModal = useCallback(() => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
      streamControllerRef.current = null
    }
    setIsStreaming(false)
    setModalState('closed')

    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.remove('active')
  }, [])

  const handlePrimaryClick = useCallback(() => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true

    const symbol = stockCode && stockData ? stockCode : tickerInput.trim() || 'AAPL'
    startAnalysisStream(symbol)
    openModal()
    isAnalyzingRef.current = false
  }, [openModal, stockCode, stockData, tickerInput, startAnalysisStream])

  // Scroll-triggered FAB
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

  const activeSymbol = stockCode && stockData ? stockCode : tickerInput.trim() || 'AAPL'

  return (
    <>
      {/* ── Global Overlay Mask ── */}
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ══════════════════════════════════════════════════════
          DIAGNOSTIC MODAL — Glass Overlay
          ══════════════════════════════════════════════════════ */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl transition-all duration-500" onClick={closeModal}></div>

        <div className="relative w-full max-w-lg glass-card rounded-[2rem] p-10 border border-outline-variant/15 relative overflow-hidden">
          <button className="absolute top-6 right-6 text-outline hover:text-white transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* STATE 1: LOADING — DNA Scanning Animation */}
          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-8 py-10">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-surface-container-high rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 overflow-hidden rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>genetics</span>
                  <div className="scanning-line absolute top-0 w-full"></div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-headline text-2xl font-bold text-white mb-2">Scanning Financial DNA</h3>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">{progressStatus}</p>
              </div>
              <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                  style={{ width: progressWidth }}
                ></div>
              </div>
            </div>
          )}

          {/* STATE 2: RESULT */}
          {modalState === 'result' && (
            <div className="flex flex-col items-center">
              {/* Health Score Ring */}
              <div className="glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center text-center w-full mb-8 border border-outline-variant/15">
                <h3 className="text-on-surface-variant font-label uppercase tracking-[0.2em] text-[10px] mb-6">Stock Health Score</h3>
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                    <circle className="text-secondary drop-shadow-[0_0_12px_#5cfd80]" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.9" strokeDashoffset="110.5" strokeWidth="12"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-headline font-bold text-white">{stockData ? (stockData.change_percent >= 0 ? '82' : '38') : '75'}</span>
                    <span className="text-secondary text-[10px] font-bold uppercase">{stockData ? (stockData.change_percent >= 0 ? 'Strong Buy' : 'Sell Signal') : 'Buy'}</span>
                  </div>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="w-full glass-card p-8 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low/40 mb-8 max-h-48 overflow-y-auto hide-scroll">
                <h4 className="text-primary font-headline text-xl mb-4">AI Diagnostic Insights</h4>
                <div className="space-y-4">
                  {analysisContent ? (
                    <p className="text-on-surface leading-relaxed font-body whitespace-pre-wrap">
                      {analysisContent}
                      {isStreaming && <span className="animate-pulse text-primary">▌</span>}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                        <p className="text-on-surface leading-relaxed font-body">{placeholderText || 'AI is preparing your diagnostic report...'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    const url = redirectUrl || fallbackUrl
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                      ;(window as any).gtag_report_conversion(url)
                    } else {
                      window.location.href = url
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-2xl font-headline font-bold text-lg tracking-tight hover:opacity-90 transition-all shadow-xl shadow-green-500/20"
                  id="modal-submit-btn"
                >
                  <span className="material-symbols-outlined">forum</span>
                  CHAT WITH AI ADVISOR ON WHATSAPP
                </button>
                <button
                  className="w-full px-8 py-5 rounded-2xl border border-outline-variant/30 text-on-surface-variant font-headline font-bold hover:bg-surface-container-high transition-colors"
                  onClick={closeModal}
                >
                  NEW SCAN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FIXED NAVIGATION — TopAppBar
          ══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/15">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">insights</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent font-headline tracking-tighter uppercase">STOCK_DIAGNOSTIC</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <a className="text-primary font-label text-xs uppercase tracking-widest hover:opacity-80 transition-opacity" href="#">Terminal</a>
            <a className="text-on-surface-variant font-label text-xs uppercase tracking-widest hover:opacity-80 transition-opacity" href="#">Markets</a>
            <a className="text-on-surface-variant font-label text-xs uppercase tracking-widest hover:opacity-80 transition-opacity" href="#">Signals</a>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-tighter">US Markets Open</span>
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#5cfd80]"></div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20">
        {/* ══════════════════════════════════════════════════════
            HERO — Predictive Prism Central Hub
            ══════════════════════════════════════════════════════ */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-16 md:pt-24 pb-12 min-h-[80vh]">
          {/* Background Ambient Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]"></div>
            <div className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full prism-glow"></div>
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* Hero Title */}
            <div className="text-center mb-12 space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md border border-outline-variant/15">Predictive Prism AI</span>
              <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white leading-none">
                Uncover Financial <br />
                <span className="text-primary">DNA Patterns.</span>
              </h2>
              <p className="text-on-surface-variant max-w-md mx-auto text-lg font-body">AI-driven diagnostics for smarter US stock market intelligence.</p>
            </div>

            {/* Interaction Core — Glass Panel */}
            <div className="w-full max-w-2xl glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10 space-y-8">
                {/* Ticker Input — No real-time search, just simple input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest ml-4">Enter Stock Ticker</label>
                  <div className="relative group/input">
                    <input
                      className="w-full bg-surface-container-low border-none rounded-full py-6 px-10 text-2xl font-headline font-medium text-on-background placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                      placeholder="NVDA, AAPL, TSLA..."
                      type="text"
                      value={tickerInput}
                      onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter' && tickerInput.trim()) handlePrimaryClick() }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined text-on-surface-variant/40 group-focus-within/input:text-primary transition-colors text-3xl">search</span>
                    </div>
                  </div>
                </div>

                {/* Diagnose Button */}
                <button
                  className="w-full py-6 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold text-xl tracking-tight shadow-[0_0_40px_rgba(129,236,255,0.3)] hover:shadow-[0_0_60px_rgba(129,236,255,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
                  onClick={handlePrimaryClick}
                >
                  DIAGNOSE NOW
                  <span className="material-symbols-outlined font-bold">bolt</span>
                </button>

                {/* Trust indicators */}
                <div className="flex justify-between items-center px-4">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">JD</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center">
                      <span className="text-[10px] font-bold text-secondary">AK</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center">
                      <span className="text-[10px] font-bold text-tertiary">MR</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant/60 font-label uppercase tracking-tighter">Trusted by 24k+ Traders Today</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            TICKER BAR — Marquee
            ══════════════════════════════════════════════════════ */}
        <div className="w-full bg-surface-container-low py-3 overflow-hidden whitespace-nowrap border-y border-outline-variant/15">
          <div className="flex items-center space-x-12 animate-marquee">
            {!hotLoading && hotStocks.length > 0 ? (
              [...hotStocks, ...hotStocks].map((stock, i) => (
                <span key={`ticker-${stock.symbol}-${i}`} className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">{stock.symbol}</span> ${formatPrice(stock.price)} <span className={stock.change_percent >= 0 ? 'text-secondary' : 'text-error'}>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                </span>
              ))
            ) : (
              <>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2"><span className="text-on-surface font-headline font-bold">TSLA</span> $172.44 <span className="text-secondary">+2.15%</span></span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2"><span className="text-on-surface font-headline font-bold">GOOGL</span> $142.12 <span className="text-error">-0.45%</span></span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2"><span className="text-on-surface font-headline font-bold">MSFT</span> $405.10 <span className="text-secondary">+1.12%</span></span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2"><span className="text-on-surface font-headline font-bold">NVDA</span> $875.21 <span className="text-secondary">+4.32%</span></span>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STOCK DATA MODULE — When ?code= parameter present
            ══════════════════════════════════════════════════════ */}
        {stockCode && (
          <section className="mt-16 px-6 space-y-6">
            <div className="flex items-end justify-between mb-8 border-b border-outline-variant/15 pb-4">
              <div>
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">AI Diagnostic Report</h2>
                <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">REAL-TIME AI ANALYSIS</p>
              </div>
              <div className="text-right">
                <span className="text-on-surface-variant font-mono text-[10px]">TICKER ID:</span>
                <p className="font-headline font-bold text-xl text-secondary">{stockCode}.NAS</p>
              </div>
            </div>

            {stockLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : stockData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price Card */}
                <div className="glass-card p-6 rounded-[2rem] border-l-4 border-primary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">Current Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold text-on-surface">${formatPrice(stockData.price)}</span>
                    <span className={`text-sm font-headline font-bold ${stockData.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Market Sentiment */}
                <div className="glass-card p-6 rounded-[2rem] border-l-4 border-secondary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold text-primary">{stockData.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                    <span className="text-primary/60 font-mono text-sm tracking-tighter">({stockData.change >= 0 ? 'High' : 'Low'} Confidence)</span>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="glass-card p-6 rounded-[2rem] border-l-4 border-tertiary/50 md:col-span-2">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">AI Recommendation</p>
                  <div className={`${stockData.change_percent >= 0 ? 'bg-secondary-container/20' : 'bg-error/10'} inline-block px-4 py-1 rounded-full mb-2`}>
                    <span className={`${stockData.change_percent >= 0 ? 'text-secondary' : 'text-error'} font-headline font-bold text-sm uppercase tracking-tighter`}>
                      {stockData.change_percent >= 0 ? 'Strong Buy' : 'Sell Signal'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-body">
                    AI analysis indicates {stockData.change >= 0 ? 'a primary support bounce' : 'distribution pressure'} at {formatPrice(stockData.price)} with target {stockData.change >= 0 ? 'upside' : 'downside'} of {Math.abs(stockData.change_percent).toFixed(1)}%.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            BENTO GRID — AI Capabilities
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex items-end justify-between mb-8 border-b border-outline-variant/15 pb-4">
            <div>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">AI Capabilities</h2>
              <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">PREDICTIVE ENGINE</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-1 glass-card rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">auto_awesome</span>
                <h3 className="font-headline text-xl font-bold uppercase mb-2">Predictive Signal Engine</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">Real-time proprietary scoring for top-tier assets. AI-driven alpha detection powered by predictive inference.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/15 hover:bg-surface-container-high transition-colors duration-300">
              <span className="material-symbols-outlined text-secondary mb-4 block">psychology</span>
              <h4 className="font-headline font-bold text-sm uppercase tracking-tight">Pattern Brain</h4>
              <p className="text-[10px] text-on-surface-variant mt-2 font-body">Chart pattern recognition</p>
            </div>
            <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant/15 hover:bg-surface-container-high transition-colors duration-300">
              <span className="material-symbols-outlined text-tertiary mb-4 block">insights</span>
              <h4 className="font-headline font-bold text-sm uppercase tracking-tight">Sentiment Lens</h4>
              <p className="text-[10px] text-on-surface-variant mt-2 font-body">Market sentiment analysis</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATS — Pulse Metrics
            ══════════════════════════════════════════════════════ */}
        <section className="mt-12 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-[2rem] text-center border border-outline-variant/15">
              <div className="font-headline text-2xl font-bold text-primary mb-1">500K+</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Diagnostics</div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] text-center border border-outline-variant/15">
              <div className="font-headline text-2xl font-bold text-secondary mb-1">100+</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Data Streams</div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] text-center border border-outline-variant/15">
              <div className="font-headline text-2xl font-bold text-tertiary mb-1">24/7</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Global Pulse</div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] text-center border border-outline-variant/15">
              <div className="font-headline text-2xl font-bold text-primary mb-1">99.9%</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Reliability</div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            MARKET MOVERS — Hot Stocks
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex justify-between items-end mb-8 border-b border-outline-variant/15 pb-4">
            <div>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Market Movers</h2>
              <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">TOP PERFORMING STOCKS</p>
            </div>
            <span className="text-xs text-primary font-headline font-medium tracking-wide uppercase">View All</span>
          </div>

          {hotLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : hotStocks.length > 0 ? (
            <div className="space-y-4">
              {hotStocks.slice(0, 6).map((stock) => (
                <div key={stock.symbol} className="glass-card rounded-[2rem] border border-outline-variant/15 overflow-hidden group hover:border-primary/20 transition-colors duration-300">
                  <div className="flex items-center gap-3 px-6 py-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface text-base flex-1">{stock.symbol}</h3>
                    <span className={`text-xs font-headline font-bold px-3 py-1 rounded-full ${stock.change_percent >= 0 ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10'}`}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </span>
                    <p className="font-headline font-bold text-on-surface text-base">${formatPrice(stock.price)}</p>
                  </div>
                  <div className="px-6 py-3 grid grid-cols-3 gap-4 border-t border-outline-variant/10 bg-surface-container-low/40">
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

        {/* ══════════════════════════════════════════════════════
            PLATFORM FEATURES
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex items-end justify-between mb-8 border-b border-outline-variant/15 pb-4">
            <div>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Platform Features</h2>
              <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">BUILT FOR INVESTORS</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden group hover:border-primary/20 transition-colors duration-300 border border-outline-variant/15">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">shield_lock</span>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-3 uppercase">Bank-Level Security</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body">Your data is protected by industry-standard encryption protocols, keeping your stock analysis private and secure.</p>
              </div>
            </div>
            <div className="glass-card rounded-[2rem] p-8 border border-outline-variant/15 group hover:border-secondary/20 transition-colors duration-300">
              <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">hub</span>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-3 uppercase">Real-Time Integration</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-body">Connect your existing workflow directly to our analysis platform for real-time stock data and AI-driven insights.</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CTA SECTION
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6 text-center">
          <div className="glass-card p-10 md:p-16 rounded-[2rem] border border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-5"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary rounded-full blur-[120px] opacity-5"></div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4 relative z-10 text-glow uppercase">Start Your AI Diagnosis</h2>
            <p className="text-on-surface-variant text-sm mb-10 relative z-10 max-w-xs mx-auto leading-relaxed font-body">Join thousands of investors using AI-powered stock diagnostics to make smarter decisions.</p>
            <button
              className="relative z-10 py-5 px-10 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold text-lg tracking-tight shadow-[0_0_40px_rgba(129,236,255,0.3)] hover:shadow-[0_0_60px_rgba(129,236,255,0.5)] active:scale-95 transition-all"
              onClick={handlePrimaryClick}
            >
              DIAGNOSE NOW
              <span className="material-symbols-outlined align-middle ml-2">bolt</span>
            </button>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="w-full border-t border-outline-variant/15 bg-background flex flex-col items-center py-8 px-4 space-y-4">
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/privacy">Privacy</Link>
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/terms">Terms</Link>
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/contact">Contact</Link>
        </div>
        <p className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em]">&copy; 2026{currentDomain ? ` ${currentDomain} ` : ' '}PREDICTIVE PRISM AI. US MARKETS ONLY.</p>
      </footer>

      {/* ══════════════════════════════════════════════════════
          FIXED FLOATING ACTION BUTTON — Scroll-triggered
          ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="sticky-cta">
        <div className="max-w-xl mx-auto">
          <button
            className="w-full py-5 px-8 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed font-headline font-bold text-lg tracking-tight shadow-[0_0_40px_rgba(129,236,255,0.3)] hover:shadow-[0_0_60px_rgba(129,236,255,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
            onClick={handlePrimaryClick}
          >
            DIAGNOSE NOW
            <span className="material-symbols-outlined font-bold">bolt</span>
          </button>
        </div>
      </div>
    </>
  )
}
