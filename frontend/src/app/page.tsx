'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStockQuote, getHotStocks, StockQuote } from '../lib/api'

const SYMBOLS = ['$', '↗', '↘', 'AAPL', 'BTC', 'NVDA', 'ETH', 'TSLA']

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

  // Load fallback URL and placeholder text from admin settings
  useEffect(() => {
    fetch('/api/admin/settings/public')
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

  const createFloatingSymbols = useCallback(() => {
    const container = document.getElementById('symbol-container')
    if (!container) return
    container.innerHTML = ''
    for (let i = 0; i < 20; i++) {
      const sym = document.createElement('div')
      sym.innerText = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      sym.className = 'absolute text-primary/30 font-mono text-xs pointer-events-none animate-float-symbol'
      sym.style.left = Math.random() * 100 + '%'
      sym.style.top = Math.random() * 100 + '%'
      sym.style.animationDelay = Math.random() * 4 + 's'
      sym.style.fontSize = (Math.random() * 12 + 8) + 'px'
      container.appendChild(sym)
    }
  }, [])

  const startAnalysisStream = useCallback((symbol: string) => {
    setIsStreaming(true)
    setAnalysisContent('')
    const url = `/api/analyze/${encodeURIComponent(symbol)}`
    const eventSource = new EventSource(url)
    let fullText = ''

    eventSource.onmessage = (event) => {
      fullText += event.data
      setAnalysisContent(fullText)
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
      if (!fullText) {
        setAnalysisContent('❌ AI analysis unavailable. Please try again.')
      }
    }
  }, [])

  const openModal = useCallback(() => {
    const modal = document.getElementById('oracle-modal')
    const eyeL = document.getElementById('eye-l')
    const eyeR = document.getElementById('eye-r')
    const eyeLGlow = document.getElementById('eye-l-glow')
    const eyeRGlow = document.getElementById('eye-r-glow')
    const halo = document.getElementById('modal-halo')
    const submitBtn = document.getElementById('modal-submit-btn')
    if (!modal) return

    modal.classList.add('active')
    setAnalysisContent('')
    setIsStreaming(false)
    setRedirectUrl(null)

    // Pre-fetch redirect link during modal loading
    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))

    if (submitBtn) {
      submitBtn.classList.add('grayscale', 'opacity-30')
      submitBtn.classList.remove('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
    }

    setTimeout(() => {
      if (eyeLGlow) eyeLGlow.style.opacity = '1'
      if (eyeRGlow) eyeRGlow.style.opacity = '1'
      if (eyeL) eyeL.classList.add('eye-glow-active')
      if (eyeR) eyeR.classList.add('eye-glow-active')
      if (halo) halo.classList.add('opacity-100')

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('grayscale', 'opacity-30')
          submitBtn.classList.add('animate-btn-activate', 'bg-primary', 'text-background', 'grayscale-0', 'opacity-100')
        }
      }, 1200)
    }, 300)

    // Start SSE stream if we have a stock code
    if (stockCode) {
      startAnalysisStream(stockCode)
    }
  }, [stockCode, startAnalysisStream])

  const closeModal = useCallback(() => {
    const modal = document.getElementById('oracle-modal')
    const mask = document.getElementById('global-mask')
    const halo = document.getElementById('modal-halo')
    if (modal) modal.classList.remove('active')
    if (mask) mask.classList.remove('active')
    if (halo) halo.classList.remove('opacity-100')
    const container = document.getElementById('symbol-container')
    if (container) container.innerHTML = ''
  }, [])

  const animateBars = useCallback((btn: HTMLElement, originalText: string, icon: HTMLElement | null) => {
    const duration = 2500
    const start = Date.now()

    function update() {
      const now = Date.now()
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      const prog1 = document.getElementById('prog-1')
      const prog1Val = document.getElementById('prog-1-val')
      if (prog1) prog1.style.width = (progress * 100) + '%'
      if (prog1Val) prog1Val.innerText = Math.round(progress * 100) + '%'

      const p2 = Math.min(progress * 1.2, 1)
      const prog2 = document.getElementById('prog-2')
      const prog2Val = document.getElementById('prog-2-val')
      if (prog2) prog2.style.width = (p2 * 100) + '%'
      if (prog2Val) prog2Val.innerText = Math.round(p2 * 100) + '%'

      const p3 = Math.max(0, (progress - 0.2) * 1.25)
      const prog3 = document.getElementById('prog-3')
      const prog3Val = document.getElementById('prog-3-val')
      if (prog3) prog3.style.width = (Math.min(p3, 1) * 100) + '%'
      if (prog3Val) prog3Val.innerText = Math.round(Math.min(p3, 1) * 100) + '%'

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        setTimeout(() => {
          const diagnosticOverlay = document.getElementById('diagnostic-overlay')
          if (diagnosticOverlay) diagnosticOverlay.style.display = 'none'
          btn.classList.remove('primary-btn-centering')
          const textTarget = btn.querySelector('.btn-text') || btn
          textTarget.textContent = originalText
          if (icon) icon.style.opacity = '1'
          openModal()
          isAnalyzingRef.current = false
        }, 400)
      }
    }
    update()
  }, [openModal])

  const handlePrimaryClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true

    const btn = e.currentTarget
    const mask = document.getElementById('global-mask')
    const diagnosticOverlay = document.getElementById('diagnostic-overlay')
    if (mask) mask.classList.add('active')
    createFloatingSymbols()

    btn.classList.add('primary-btn-centering')
    const originalText = btn.querySelector('.btn-text')?.textContent || btn.textContent || ''
    const textTarget = btn.querySelector('.btn-text') || btn
    const icon = btn.querySelector('.btn-icon') as HTMLElement | null

    if (textTarget) textTarget.textContent = 'DIAGNOSING...'
    if (icon) icon.style.opacity = '0'

    setTimeout(() => {
      if (diagnosticOverlay) diagnosticOverlay.style.display = 'flex'
      animateBars(btn, originalText, icon)
    }, 100)
  }, [createFloatingSymbols, animateBars])

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

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Global Overlay Mask */}
      <div className="screen-mask" id="global-mask">
        <div className="absolute inset-0 pointer-events-none" id="symbol-container"></div>
      </div>

      {/* Diagnostic Overlay */}
      <div className="flex flex-col gap-4" id="diagnostic-overlay">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Data Scan</span>
            <span id="prog-1-val">59%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-1" style={{ width: '59.12%' }}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Sentiment Analysis</span>
            <span id="prog-2-val">71%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-2" style={{ width: '70.944%' }}></div></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-primary/70 font-bold">
            <span>Deep Analysis</span>
            <span id="prog-3-val">49%</span>
          </div>
          <div className="progress-bar-container"><div className="progress-bar-fill" id="prog-3" style={{ width: '48.9%' }}></div></div>
        </div>
      </div>

      {/* Interactive Modal */}
      <div className="modal-container" id="oracle-modal">
        <div className="relative pt-24">
          {/* Robot Overlay */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 z-20 pointer-events-none">
            <div className="robot-body-wrapper relative flex flex-col items-center">
              <div className="w-32 h-32 bg-surface-container-highest rounded-full border-2 border-primary/40 relative overflow-hidden z-10 flex items-center justify-center">
                <div className="absolute inset-x-0 top-0 h-8 bg-primary/10"></div>
                <div className="flex gap-10 justify-center">
                  <div className="w-6 h-3 bg-[#0a0f1d] rounded-full relative overflow-hidden transition-all duration-700" id="eye-l">
                    <div className="absolute inset-0 bg-primary/80 blur-sm opacity-0" id="eye-l-glow" style={{ opacity: 0 }}></div>
                  </div>
                  <div className="w-6 h-3 bg-[#0a0f1d] rounded-full relative overflow-hidden transition-all duration-700" id="eye-r">
                    <div className="absolute inset-0 bg-primary/80 blur-sm opacity-0" id="eye-r-glow" style={{ opacity: 0 }}></div>
                  </div>
                </div>
              </div>
              <div className="robot-hands-grip">
                <div className="hand"></div>
                <div className="hand"></div>
              </div>
            </div>
          </div>
          {/* Modal Box */}
          <div className="glass-panel border border-primary/30 rounded-[2.5rem] p-5 shadow-[0_0_50px_rgba(153,247,255,0.15)] relative overflow-hidden bloom-effect">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[40px] opacity-0 transition-opacity duration-1000 z-0" id="modal-halo"></div>
            <div className="relative z-10">
              <div className="flex flex-col items-center mb-4">
                <button className="absolute top-0 right-0 p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={closeModal}>
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
                <span className="text-xs font-headline font-bold text-primary tracking-[0.4em] uppercase text-center w-full mt-2">AI Diagnostic</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-3 tracking-tight text-center">DIAGNOSTIC REPORT</h3>
              <div className="flex flex-col gap-2 mb-4 items-center">
                <div className="flex justify-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                  <span className="material-symbols-outlined text-primary text-[10px] bg-primary/10 p-1 rounded-md border border-primary/20">description</span>
                </div>
                <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest font-bold">2026 Stock Reports Ready</span>
              </div>
              <div className="h-40 overflow-y-auto mb-4 pr-1 bg-black/40 rounded-xl p-3 font-mono text-[10px] leading-snug text-primary/80 border border-primary/10 hide-scroll whitespace-pre-wrap">
                {analysisContent ? (
                  <>
                    {analysisContent}
                    {isStreaming && <span className="animate-pulse text-primary">▌</span>}
                  </>
                ) : (
                  placeholderText || ''
                )}
              </div>
              <button onClick={() => {
                  const url = redirectUrl || fallbackUrl
                  if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                    ;(window as any).gtag_report_conversion(url)
                  } else {
                    window.location.href = url
                  }
                }} className="w-full py-3.5 rounded-full bg-primary/30 text-background/50 font-headline font-black text-[10px] tracking-[0.3em] uppercase border border-primary/20 flex items-center justify-center gap-2 transition-all duration-1000 grayscale opacity-30" id="modal-submit-btn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.031 2c-5.517 0-9.997 4.48-9.997 9.997 0 1.765.459 3.424 1.266 4.872l-1.301 4.745 4.856-1.274c1.404.767 3.007 1.205 4.71 1.205 5.517 0 9.996-4.479 9.996-9.997 0-5.517-4.479-9.997-9.996-9.997zm6.394 14.161c-.266.75-1.547 1.365-2.127 1.458-.58.094-1.121.134-3.15-.658-2.6-1.015-4.275-3.664-4.405-3.837-.13-.173-1.055-1.405-1.055-2.677 0-1.271.65-1.897.881-2.157.231-.26.505-.325.674-.325.169 0 .338.001.485.008.151.007.354-.057.555.43.201.487.688 1.674.748 1.795.061.121.101.261.02.423-.081.162-.121.261-.242.401-.12.14-.253.313-.362.42-.119.117-.243.245-.104.482.139.237.618 1.02 1.327 1.65.912.81 1.682 1.061 1.919 1.179.237.118.376.098.515-.061.139-.159.595-.694.754-.925.159-.231.318-.195.536-.115.218.08 1.385.654 1.623.773.238.118.397.177.456.277.059.1.059.578-.207 1.328z"></path>
                </svg>
                <span className="btn-text">GET FULL REPORT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#070d1f]/60 backdrop-blur-xl border-b border-primary/5">
        <div className="flex justify-between items-center px-6 py-5 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-icon="flare">flare</span>
            <span className="text-xl font-bold tracking-[0.2em] text-primary font-headline">STOCK AI</span>
          </div>
          <button className="primary-trigger bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-primary hover:bg-primary/20 transition-all uppercase" onClick={handlePrimaryClick}>DIAGNOSE</button>
        </div>
      </header>

      <main className="pt-24 pb-0 px-6 cosmic-gradient">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-secondary font-headline text-xs tracking-[0.3em] uppercase">AI Engine: Optimal</span>
              <h1 className="text-4xl font-headline font-bold text-on-surface leading-tight tracking-tighter">
                Deep Analysis of <br /><span className="text-primary">US Stocks.</span>
              </h1>
            </div>
            <div className="relative shrink-0 w-24 h-24 group">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 overflow-hidden shadow-[0_0_20px_rgba(153,247,255,0.2)] bg-surface-container-highest transition-transform duration-500 group-hover:scale-110 group-hover:border-primary/60 animate-eye-pulse">
                <img alt="Futuristic Robot" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb621x0F_AWoLHGgVY45TVoXWwHKXvvglMoG48kgm37_AW1Tx6IyJMlG6ITVLBooN-6_so7OGCA7uQS5U6oePjnXzWAnF_qYVK4DhNFGnsksIjSaADQOAoHWF3j5ZjZhE8kOLGcTmx1rzjVAItQzeOc1hnbH4tcKjqpXjUYzoiFODIxj9lWEJULTtYrnJnqTZRTArSbGUjvfd6Cg9o4x7xOTRprsHUTIWDlkxH-3uWWMa_At6MHSEmIRay43rBQWoUjOivw_WE2oxl" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-40"></div>
              </div>
              <div className="absolute -inset-1 bg-primary/10 rounded-full blur-md -z-10 group-hover:bg-primary/20 transition-all"></div>
            </div>
          </div>
        </section>

        {/* Stock Data Module */}
        {stockCode && (
          <section className="mb-10">
            <div className="glass-panel rounded-3xl border border-primary/20 overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <h3 className="text-xs font-headline font-bold tracking-[0.3em] uppercase text-primary">Stock Diagnosis</h3>
                </div>
                {stockLoading && (
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest animate-pulse">Loading...</span>
                )}
              </div>
              {stockLoading ? (
                <div className="px-5 py-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : stockData ? (
                <div className="px-5 py-4">
                  {/* Stock Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-headline font-bold text-on-surface">{stockData.symbol}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">Live</span>
                      </div>
                      <p className="text-sm text-on-surface-variant">{stockData.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-headline font-bold text-on-surface">${formatPrice(stockData.price)}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className={`text-sm font-bold ${stockData.change >= 0 ? 'text-primary' : 'text-secondary'}`}>
                          {stockData.change >= 0 ? '+' : ''}{formatPrice(stockData.change)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          stockData.change_percent >= 0
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {stockData.change_percent >= 0 ? '▲' : '▼'} {Math.abs(stockData.change_percent).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Stock Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-container-lowest/60 rounded-xl p-3">
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Price</p>
                      <p className="text-sm font-headline font-bold text-on-surface">${formatPrice(stockData.price)}</p>
                    </div>
                    <div className="bg-surface-container-lowest/60 rounded-xl p-3">
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">Volume</p>
                      <p className="text-sm font-headline font-bold text-on-surface">{formatNumber(stockData.volume)}</p>
                    </div>
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

        {/* Prediction CTA */}
        <section className="mb-12">
          <button className="primary-trigger w-full py-5 rounded-full bg-surface-container-lowest border-2 border-primary/50 animate-glow-pulse mb-8 flex items-center justify-center gap-3 group transition-all hover:scale-[1.02] hover:border-primary" id="main-prediction-btn" onClick={handlePrimaryClick}>
            <span className="btn-text text-primary font-headline font-black tracking-[0.3em] uppercase text-sm">START AI DIAGNOSIS</span>
            <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform btn-icon" data-icon="bolt" style={{ opacity: 1 }}>bolt</span>
          </button>
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.3em] px-2">Market Index Overview</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scroll">
              <div className="shrink-0 w-40 glass-panel p-4 rounded-3xl border border-outline-variant/20">
                <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-on-surface">S&amp;P 500</span><span className="text-[10px] text-primary">+12.4%</span></div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 30"><path d="M0,25 L10,22 L20,24 L30,18 L40,20 L50,12 L60,15 L70,8 L80,10 L90,2 L100,5" fill="none" stroke="#99f7ff" strokeWidth="1.5"></path></svg>
                <p className="text-[8px] text-on-surface-variant mt-2 uppercase tracking-tighter text-center">Trend Analysis</p>
              </div>
              <div className="shrink-0 w-40 glass-panel p-4 rounded-3xl border border-outline-variant/20">
                <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-on-surface">NASDAQ</span><span className="text-[10px] text-primary">+18.2%</span></div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 30"><path d="M0,28 L20,20 L40,25 L60,10 L80,15 L100,2" fill="none" stroke="#99f7ff" strokeWidth="1.5"></path></svg>
                <p className="text-[8px] text-on-surface-variant mt-2 uppercase tracking-tighter text-center">Momentum Signal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Insight */}
        <section className="mb-12">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <button className="primary-trigger relative w-full bg-surface-container-lowest py-6 rounded-full flex items-center justify-center gap-3 border border-outline-variant/30" onClick={handlePrimaryClick}>
              <span className="btn-text text-primary font-headline font-bold tracking-[0.2em] uppercase text-sm">Deep Stock Analysis</span>
              <span className="material-symbols-outlined text-primary btn-icon" data-icon="auto_awesome">auto_awesome</span>
            </button>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-[10px] uppercase tracking-widest px-8">AI-powered deep analysis for 500+ US stock entities with real-time diagnostics.</p>
        </section>

        {/* Analysis Chart */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-headline font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              AI Trend Projection
            </h3>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Analysis: Active</span>
          </div>
          <div className="bg-surface-container-low rounded-[2.5rem] p-1 border border-outline-variant/10 mb-6">
            <div className="h-64 relative rounded-[2.3rem] overflow-hidden bg-surface-container-lowest">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#41475b 1px, transparent 1px), linear-gradient(90deg, #41475b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute inset-x-0 bottom-12 h-32">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#99f7ff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#99f7ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10" fill="none" stroke="#99f7ff" strokeWidth="2" />
                  <path d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10 V100 H0 Z" fill="url(#line-gradient)" />
                </svg>
              </div>
              <div className="absolute top-4 left-6 flex flex-col gap-1">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">Trend: Bullish</span>
                <span className="text-xs text-on-surface-variant">AI Confidence: 94.2%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hot Stocks Carousel */}
        <section className="w-full relative overflow-hidden border-t border-primary/10 bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10 h-20 pointer-events-none"></div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="px-5 pt-6 pb-2 relative z-20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <h3 className="text-[10px] font-headline font-bold tracking-[0.3em] uppercase text-on-surface-variant">Hot Stocks</h3>
            </div>
          </div>
          {hotLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : hotStocks.length > 0 ? (
            <div className="hot-stocks-viewport">
              <div className="hot-stocks-track" id="hot-stocks-track">
              {/* Duplicate stocks for infinite loop */}
              {[...hotStocks, ...hotStocks].map((stock, i) => (
                <div key={`${stock.symbol}-${i}`} className="glass-panel rounded-2xl p-4 border border-outline-variant/20 mx-4 mb-4 shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface font-headline">{stock.symbol}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                        stock.change_percent >= 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {stock.change_percent >= 0 ? '▲' : '▼'} {Math.abs(stock.change_percent).toFixed(2)}%
                      </span>
                    </div>
                    <p className={`text-lg font-bold font-headline ${stock.change >= 0 ? 'text-primary' : 'text-secondary'}`}>
                      ${formatPrice(stock.price)}
                    </p>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-label tracking-wider uppercase mb-2">{stock.name}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[8px] text-on-surface-variant uppercase tracking-widest">Change</p>
                        <p className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-primary' : 'text-secondary'}`}>
                          {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-on-surface-variant uppercase tracking-widest">Volume</p>
                        <p className="text-[10px] font-bold text-on-surface">{formatNumber(stock.volume)}</p>
                      </div>
                    </div>
                    <svg className="w-16 h-6 opacity-50" preserveAspectRatio="none" viewBox="0 0 60 20">
                      <path
                        d={stock.change >= 0
                          ? "M0,15 L10,12 L20,14 L30,8 L40,10 L50,4 L60,6"
                          : "M0,5 L10,8 L20,6 L30,12 L40,10 L50,16 L60,14"
                        }
                        fill="none"
                        stroke={stock.change >= 0 ? '#99f7ff' : '#d575ff'}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-on-surface-variant">No hot stocks data available</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background w-full py-12 px-8 border-t border-outline-variant/15 pb-32">
        <div className="flex flex-col items-center gap-8 w-full max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-black text-primary font-headline tracking-tighter text-center">STOCK AI DIAGNOSTICS</span>
            <p className="text-on-background/50 font-body text-[10px] uppercase tracking-[0.2em] text-center">© 2026 ALL RIGHTS OBSERVED.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">DIAGNOSTICS</a>
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">MARKET DATA</a>
            <a className="text-on-background/50 hover:text-primary font-body text-xs uppercase tracking-widest transition-all" href="#">ANALYSIS</a>
          </nav>
        </div>
      </footer>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-8 left-0 right-0 z-[60] px-6" id="sticky-cta">
        <button className="primary-trigger w-full bg-primary text-background py-5 rounded-full font-headline font-black text-sm tracking-[0.3em] uppercase shadow-[0_10px_30px_rgba(153,247,255,0.4)] border border-white/20 transition-transform active:scale-95" onClick={handlePrimaryClick}>
          <span className="btn-text">GET FULL DIAGNOSIS</span>
        </button>
      </div>
    </>
  )
}
