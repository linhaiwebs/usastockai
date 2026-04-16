'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getStockQuote, getHotStocks, searchStocks, StockQuote, SearchResult, SearchResponse } from '../lib/api'

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
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [modalState, setModalState] = useState<'closed' | 'loading' | 'result'>('closed')
  const [modalStockData, setModalStockData] = useState<StockQuote | null>(null)

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)
  const [progressWidth, setProgressWidth] = useState('0%')
  const [progressStatus, setProgressStatus] = useState('')

  // Auto-fill search input from code= URL param
  useEffect(() => {
    if (stockCode) {
      setSearchInput(stockCode.toUpperCase())
    }
  }, [stockCode])

  // Fetch stock data when code param changes
  useEffect(() => {
    if (!stockCode) {
      setStockData(null)
      return
    }
    let cancelled = false
    setStockLoading(true)
    getStockQuote(stockCode)
      .then(data => { if (!cancelled) { setStockData(data); setModalStockData(data) } })
      .catch(() => { if (!cancelled) { setStockData(null); setModalStockData(null) } })
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

  // ── Search: debounce + AbortController ──
  const doSearch = useCallback((query: string, page: number = 1) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
      searchTimerRef.current = null
    }
    if (searchAbortRef.current) {
      searchAbortRef.current.abort()
      searchAbortRef.current = null
    }
    if (!query.trim()) {
      setSearchResults([])
      setSearchTotal(0)
      setShowDropdown(false)
      return
    }
    searchTimerRef.current = setTimeout(() => {
      const controller = new AbortController()
      searchAbortRef.current = controller
      setSearchLoading(true)
      setSearchPage(page)
      searchStocks(query, page, 5)
        .then((data: SearchResponse) => {
          if (controller.signal.aborted) return
          setSearchResults(data.results || [])
          setSearchTotal(data.total || 0)
          setShowDropdown(true)
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setSearchResults([])
            setSearchTotal(0)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchLoading(false)
        })
    }, 300)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    doSearch(value, 1)
  }, [doSearch])

  const handleSearchPage = useCallback((newPage: number) => {
    doSearch(searchInput, newPage)
  }, [doSearch, searchInput])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

    // Google Analytics: track diagnosis event
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('event', 'Bdd')
    }

    // Async fetch stock data alongside analysis stream
    setModalStockData(null)
    getStockQuote(symbol)
      .then(data => setModalStockData(data))
      .catch(() => setModalStockData(null))

    const url = `/api/analyze/${encodeURIComponent(symbol)}`

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setIsStreaming(false)
          return
        }
        const reader = response.body?.getReader()
        if (!reader) {
          setIsStreaming(false)
          return
        }
        const decoder = new TextDecoder()
        let fullText = ''
        let currentEvent = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim()
            } else if (line.startsWith('data: ')) {
              if (currentEvent === 'error') {
                fullText = ''
                setAnalysisContent('')
                currentEvent = ''
              } else {
                fullText += line.slice(6)
                setAnalysisContent(fullText)
              }
            }
          }
        }
        setIsStreaming(false)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setIsStreaming(false)
        }
      })
  }, [])

  // ── Modal Logic ──
  const openModal = useCallback(() => {
    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.add('active')

    setModalState('loading')
    setProgressWidth('0%')
    setProgressStatus('Initializing AI analysis...')
    setRedirectUrl(null)

    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))

    const sequence = [
      { progress: '25%', text: 'Scanning Market Data...' },
      { progress: '55%', text: 'Analyzing Price Patterns...' },
      { progress: '85%', text: 'Generating Stock Report...' },
      { progress: '100%', text: 'Analysis Complete.' },
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

    const symbol = stockCode && stockData ? stockCode : searchInput.trim() || 'AAPL'
    startAnalysisStream(symbol)
    openModal()
    isAnalyzingRef.current = false
  }, [openModal, stockCode, stockData, searchInput, startAnalysisStream])

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

  const activeSymbol = stockCode && stockData ? stockCode : searchInput.trim() || 'AAPL'

  return (
    <>
      {/* ── Global Overlay Mask ── */}
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ══════════════════════════════════════════════════════
          DIAGNOSTIC MODAL — Full-Screen Glass Overlay
          ══════════════════════════════════════════════════════ */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl transition-all duration-500" onClick={closeModal}></div>

        {/* Modal Content */}
        <div className="relative w-full max-w-xl glass-card border border-primary/20 rounded-[2rem] shadow-2xl p-2 transition-all duration-500 overflow-hidden">
          <button className="absolute top-2 right-2 text-outline hover:text-white transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* STATE 1: LOADING SEQUENCE */}
          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6 p-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-secondary/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">bolt</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-glow">AI Analysis In Progress</h2>
                <div className="text-primary font-mono text-xs uppercase tracking-tighter opacity-80">{progressStatus}</div>
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
            <div className="flex flex-col p-2">
              {/* AI Status Indicator */}
              <div className="w-full mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-headline font-bold text-primary tracking-[0.3em] uppercase">AI Analysis Complete</span>
                  <span className="text-[9px] font-mono text-secondary">100%</span>
                </div>
                <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(161,250,255,1)]"></div>
                </div>
              </div>

              {/* Symbol + Real-time Price */}
              <div className="text-center mb-3">
                <h2 className="font-headline text-2xl font-bold text-white mb-2">{modalStockData?.name || activeSymbol}</h2>
                {modalStockData ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-headline text-3xl font-bold text-primary">${formatPrice(modalStockData.price)}</span>
                    <span className={`text-sm font-headline font-bold px-2.5 py-1 rounded-full ${modalStockData.change_percent >= 0 ? 'text-secondary bg-secondary/10' : 'text-error bg-error/10'}`}>
                      {modalStockData.change_percent >= 0 ? '+' : ''}{modalStockData.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant">Loading price...</span>
                  </div>
                )}
              </div>

              {/* Key Data Card */}
              {modalStockData && (
                <div className="bg-surface-container-high/50 rounded-xl p-3 mb-3 border border-outline-variant/10">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Change</p>
                      <p className={`text-xs font-bold font-headline ${modalStockData.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                        {modalStockData.change >= 0 ? '+' : ''}{modalStockData.change.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Volume</p>
                      <p className="text-xs font-bold text-on-surface font-headline">{formatNumber(modalStockData.volume)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Mkt Cap</p>
                      <p className="text-xs font-bold text-on-surface font-headline">{modalStockData.market_cap ? formatNumber(modalStockData.market_cap) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">P/E</p>
                      <p className="text-xs font-bold text-on-surface font-headline">{modalStockData.pe_ratio != null ? modalStockData.pe_ratio.toFixed(1) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">52W High</p>
                      <p className="text-xs font-bold text-on-surface font-headline">{modalStockData.fifty_two_week_high != null ? '$' + formatPrice(modalStockData.fifty_two_week_high) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">EPS</p>
                      <p className="text-xs font-bold text-on-surface font-headline">{modalStockData.eps != null ? modalStockData.eps.toFixed(2) : '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Content */}
              <div className="w-full glass-card p-2 rounded-xl border border-outline-variant/10 bg-surface-container-low/40 mb-3 max-h-48 overflow-y-auto hide-scroll">
                <p className="text-sm text-on-surface leading-relaxed font-body whitespace-pre-wrap">
                  {analysisContent ? (
                    <>
                      {analysisContent}
                      {isStreaming && <span className="animate-pulse text-primary">▌</span>}
                    </>
                  ) : (
                    placeholderText || '> Initializing analysis engine...'
                  )}
                </p>
              </div>

              {/* WhatsApp CTA */}
              <div className="w-full">
                <button
                  onClick={() => {
                    const url = redirectUrl || fallbackUrl
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                      ;(window as any).gtag_report_conversion(url)
                    } else {
                      window.location.href = url
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-headline font-black text-base tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20"
                  id="modal-submit-btn"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  GET FULL AI REPORT
                </button>
                <p className="mt-2 text-center text-[8px] text-outline font-bold uppercase tracking-[0.2em]">INSTANT WHATSAPP DELIVERY • COMPREHENSIVE REPORT</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FIXED NAVIGATION — TopAppBar
          ══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="text-xl font-bold tracking-[0.2em] text-primary font-headline uppercase">STOCK_INTEL</span>
          </div>
          <div className="hidden md:flex gap-8 items-center font-headline tracking-tighter uppercase text-sm">
            <a className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200" href="#">Markets</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Watchlist</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Alerts</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">search</span>
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">notifications</span>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20 overflow-hidden">
        {/* ══════════════════════════════════════════════════════
            TICKER BAR — Marquee
            ══════════════════════════════════════════════════════ */}
        <div className="w-full bg-surface-container-low py-3 overflow-hidden whitespace-nowrap border-b border-outline-variant/10">
          <div className="flex items-center space-x-12 animate-marquee">
            {!hotLoading && hotStocks.length > 0 ? (
              [...hotStocks, ...hotStocks].map((stock, i) => (
                <span key={`ticker-${stock.symbol}-${i}`} className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">{stock.symbol}</span> ${formatPrice(stock.price)} <span className={stock.change_percent >= 0 ? 'text-secondary' : 'text-error'}>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                </span>
              ))
            ) : (
              <>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">TSLA</span> $172.44 <span className="text-secondary">+2.15%</span>
                </span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">GOOGL</span> $142.12 <span className="text-error">-0.45%</span>
                </span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">MSFT</span> $405.10 <span className="text-secondary">+1.12%</span>
                </span>
                <span className="font-body text-[11px] font-medium tracking-wide text-on-surface-variant flex items-center gap-2">
                  <span className="text-on-surface font-headline font-bold">NVDA</span> $875.21 <span className="text-secondary">+4.32%</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            HERO SECTION — Tilted Perspective
            ══════════════════════════════════════════════════════ */}
        <section className="relative px-6 pt-12 md:pt-24">
          <div className="max-w-md mx-auto text-center">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight mb-4 text-glow leading-[1.1]">
              AI <span className="text-primary italic">STOCK</span> ANALYSIS.
            </h1>
            <p className="text-on-surface-variant font-body text-sm mb-12 tracking-wide uppercase">Professional-grade stock analysis powered by AI.</p>
          </div>

          {/* Central Ticker Input */}
          <div className="max-w-xl mx-auto relative group search-container">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-surface-container-low rounded-xl p-2 border border-outline-variant/10">
              <div className="flex flex-col md:flex-row items-stretch gap-2">
                <div className="flex-grow relative">
                  <input
                    className="w-full bg-surface-container-lowest border-none text-on-background placeholder:text-outline font-headline font-medium p-6 rounded-lg focus:ring-1 focus:ring-primary/50 text-xl tracking-widest uppercase"
                    placeholder="ENTER TICKER... TSLA, AAPL"
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && searchInput.trim()) handlePrimaryClick() }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>circle</span>
                    <span className="text-[10px] text-secondary font-headline font-bold uppercase tracking-[0.2em]">LIVE</span>
                  </div>

                  {/* Search Results Dropdown */}
                  {showDropdown && searchInput.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container rounded-2xl border border-outline-variant/10 shadow-2xl shadow-black/40 overflow-hidden z-50">
                      {searchResults.length > 0 ? (
                        <>
                          {searchResults.map((item) => (
                            <button
                              key={item.symbol}
                              className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-surface-container-high transition-colors text-left border-b border-outline-variant/10 last:border-b-0"
                              onClick={() => {
                                const sym = item.symbol
                                setSearchInput(sym)
                                setShowDropdown(false)
                                startAnalysisStream(sym)
                                openModal()
                              }}
                            >
                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="font-headline text-xs font-bold text-primary">{item.symbol.slice(0, 2)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-headline font-semibold text-on-surface text-sm">{item.symbol}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-medium uppercase">{item.type}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant truncate mt-0.5">{item.name}</p>
                              </div>
                              <span className="text-[9px] text-on-surface-variant/70 uppercase tracking-wider shrink-0">{item.exchange}</span>
                            </button>
                          ))}
                          {searchTotal > 5 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/10 bg-surface-container-low">
                              <span className="text-[10px] text-on-surface-variant">
                                {(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}
                              </span>
                              <div className="flex gap-2">
                                <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none" disabled={searchPage <= 1} onClick={() => handleSearchPage(searchPage - 1)}>← Prev</button>
                                <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none" disabled={searchPage * 5 >= searchTotal} onClick={() => handleSearchPage(searchPage + 1)}>Next →</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : searchLoading ? (
                        <div className="px-5 py-6 flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-xs text-on-surface-variant">Searching...</span>
                        </div>
                      ) : (
                        <div className="px-5 py-6 text-center">
                          <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl block mb-1">search_off</span>
                          <p className="text-xs text-on-surface-variant">No results for &quot;{searchInput}&quot;</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="bg-primary text-on-primary-fixed font-headline font-black px-8 py-4 rounded-lg text-lg tracking-[0.1em] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(161,250,255,0.3)]"
                  onClick={handlePrimaryClick}
                >
                  ANALYZE
                  <span className="material-symbols-outlined font-bold">bolt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Glow Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] -z-10 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px]"></div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STOCK DATA MODULE — When ?code= parameter present
            ══════════════════════════════════════════════════════ */}
        {stockCode && (
          <section className="mt-24 px-6 space-y-6">
            <div className="flex items-end justify-between mb-8 border-b border-outline-variant/10 pb-4">
              <div>
                <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">AI Stock Analysis</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Market Sentiment */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-primary/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl">trending_up</span>
                  </div>
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold text-primary">{stockData.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                    <span className="text-primary/60 font-mono text-sm tracking-tighter">({stockData.change >= 0 ? 'High' : 'Low'} Confidence)</span>
                  </div>
                </div>
                {/* AI Recommendation */}
                <div className="glass-card p-6 rounded-2xl border-l-4 border-secondary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">AI Recommendation</p>
                  <div className={`${stockData.change_percent >= 0 ? 'bg-secondary/10' : 'bg-error/10'} inline-block px-4 py-1 rounded-full mb-2`}>
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
            BENTO GRID — Core Intelligence Modules
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex items-end justify-between mb-8 border-b border-outline-variant/10 pb-4">
            <div>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">AI Capabilities</h2>
              <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">AI PROCESSING UNITS</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-1 bg-surface-container-high rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl mb-4 block">auto_awesome</span>
                <h3 className="font-headline text-xl font-bold uppercase mb-2">AI Signal Engine</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">Real-time proprietary scoring for top-tier assets. Professional-grade stock analysis powered by AI inference.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10 hover:bg-surface-container-high transition-colors duration-300">
              <span className="material-symbols-outlined text-secondary mb-4 block">psychology</span>
              <h4 className="font-headline font-bold text-sm uppercase tracking-tight">Pattern Recognition</h4>
              <p className="text-[10px] text-on-surface-variant mt-2 font-body">Chart pattern recognition</p>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10 hover:bg-surface-container-high transition-colors duration-300">
              <span className="material-symbols-outlined text-primary mb-4 block">history_edu</span>
              <h4 className="font-headline font-bold text-sm uppercase tracking-tight">Historical Data</h4>
              <p className="text-[10px] text-on-surface-variant mt-2 font-body">Historical data vault</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATS — Pulse Metrics
            ══════════════════════════════════════════════════════ */}
        <section className="mt-12 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-3xl text-center border border-outline-variant/10">
              <div className="font-headline text-2xl font-bold text-primary mb-1">500K+</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">AI Analyses</div>
            </div>
            <div className="glass-card p-6 rounded-3xl text-center border border-outline-variant/10">
              <div className="font-headline text-2xl font-bold text-secondary mb-1">100+</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Data Streams</div>
            </div>
            <div className="glass-card p-6 rounded-3xl text-center border border-outline-variant/10">
              <div className="font-headline text-2xl font-bold text-tertiary mb-1">24/7</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Global Pulse</div>
            </div>
            <div className="glass-card p-6 rounded-3xl text-center border border-outline-variant/10">
              <div className="font-headline text-2xl font-bold text-primary mb-1">99.9%</div>
              <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Reliability</div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTOR INTELLIGENCE — Hot Stocks
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex justify-between items-end mb-8 border-b border-outline-variant/10 pb-4">
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
                <div key={stock.symbol} className="glass-card rounded-3xl border border-outline-variant/10 overflow-hidden group hover:border-primary/20 transition-colors duration-300">
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
            CAPABILITIES — Bento Grid
            ══════════════════════════════════════════════════════ */}
        <section className="mt-24 px-6">
          <div className="flex items-end justify-between mb-8 border-b border-outline-variant/10 pb-4">
            <div>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tight">Platform Features</h2>
              <p className="text-primary font-headline text-xs tracking-[0.3em] font-medium">BUILT FOR INVESTORS</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container-high rounded-3xl p-8 relative overflow-hidden group hover:border-primary/20 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary text-4xl mb-6 block">shield_lock</span>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-3 uppercase">Bank-Level Security</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body">Your data is protected by industry-standard encryption protocols, keeping your stock analysis private and secure.</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 group hover:border-secondary/20 transition-colors duration-300">
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
          <div className="glass-card p-10 md:p-16 rounded-3xl border border-primary/10 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-[120px] opacity-5"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary rounded-full blur-[120px] opacity-5"></div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4 relative z-10 text-glow uppercase">Start Your AI Analysis</h2>
            <p className="text-on-surface-variant text-sm mb-10 relative z-10 max-w-xs mx-auto leading-relaxed font-body">Join thousands of investors using AI-powered stock analysis to make smarter decisions.</p>
            <button className="bg-primary text-on-primary-fixed font-headline font-black px-10 py-5 rounded-2xl text-lg tracking-[0.1em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(161,250,255,0.3)] relative z-10" onClick={handlePrimaryClick}>
              ANALYZE NOW
              <span className="material-symbols-outlined align-middle ml-2">bolt</span>
            </button>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="bg-surface-container-low border-t border-outline-variant/10 px-6 pt-12 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="text-lg font-bold tracking-[0.2em] text-primary font-headline uppercase">STOCK_INTEL</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-8 font-headline text-xs tracking-widest uppercase">
            <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/contact">Contact</Link>
          </div>
          <p className="text-[10px] text-outline uppercase tracking-[0.3em] font-medium">&copy; 2026{currentDomain ? ` ${currentDomain} ` : ' '}STOCK_INTEL AI ANALYSIS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════
          FIXED FLOATING ACTION BUTTON — Scroll-triggered
          ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="sticky-cta">
        <div className="max-w-xl mx-auto">
          <button
            className="w-full bg-background border-2 border-primary text-primary font-headline font-black py-5 rounded-2xl text-xl tracking-[0.2em] shadow-[0_0_30px_rgba(161,250,255,0.2)] hover:bg-primary hover:text-on-primary-fixed transition-all active:scale-95 flex items-center justify-center gap-4"
            onClick={handlePrimaryClick}
          >
            ANALYZE NOW
            <span className="material-symbols-outlined font-bold">bolt</span>
          </button>
        </div>
      </div>
    </>
  )
}
