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

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)
  const [progressWidth, setProgressWidth] = useState('0%')
  const [progressStatus, setProgressStatus] = useState('')

  // Fetch stock data when code param changes
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

  // ── Search: debounce + AbortController ──
  const doSearch = useCallback((query: string, page: number = 1) => {
    if (searchTimerRef.current) { clearTimeout(searchTimerRef.current); searchTimerRef.current = null }
    if (searchAbortRef.current) { searchAbortRef.current.abort(); searchAbortRef.current = null }

    if (!query.trim()) { setSearchResults([]); setSearchTotal(0); setShowDropdown(false); return }

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
          if (err.name !== 'AbortError') { setSearchResults([]); setSearchTotal(0) }
        })
        .finally(() => { if (!controller.signal.aborted) setSearchLoading(false) })
    }, 300)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    doSearch(value, 1)
  }, [doSearch])

  const handleSearchPage = useCallback((newPage: number) => {
    doSearch(searchInput, newPage)
  }, [doSearch, searchInput])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.search-container')) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Analysis Stream ──
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
      .catch((err) => {
        if (err.name !== 'AbortError') setAnalysisContent('❌ AI analysis unavailable. Please try again.')
        setIsStreaming(false)
      })
  }, [])

  // ── Modal ──
  const openModal = useCallback(() => {
    const mask = document.getElementById('global-mask')
    if (mask) mask.classList.add('active')
    setModalState('loading')
    setProgressWidth('0%')
    setProgressStatus('INITIALIZING SCAN...')
    setRedirectUrl(null)
    fetch('/api/redirects/assign')
      .then(r => { if (r.ok) return r.json() })
      .then(data => { if (data?.url) setRedirectUrl(data.url) })
      .catch(() => setRedirectUrl(null))
    const seq = [
      { p: '25%', t: 'FETCHING MARKET DATA...' },
      { p: '55%', t: 'CALIBRATING AI MODEL...' },
      { p: '85%', t: 'GENERATING DIAGNOSIS...' },
      { p: '100%', t: 'SCAN COMPLETE.' },
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
    const symbol = stockCode && stockData ? stockCode : searchInput.trim() || 'AAPL'
    // Fetch stock data if we don't have it for the current symbol
    if (symbol && (!stockData || stockData.symbol !== symbol.toUpperCase())) {
      setStockLoading(true)
      getStockQuote(symbol)
        .then(data => setStockData(data))
        .catch(() => setStockData(null))
        .finally(() => setStockLoading(false))
    }
    startAnalysisStream(symbol); openModal()
    isAnalyzingRef.current = false
  }, [openModal, stockCode, stockData, searchInput, startAnalysisStream])

  // Scroll-triggered FAB
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

  const activeSymbol = stockCode && stockData ? stockCode : searchInput.trim() || 'AAPL'

  return (
    <>
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ═══ DIAGNOSTIC MODAL — Glass Overlay ═══ */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl transition-all duration-500" onClick={closeModal}></div>

        <div className="relative w-full max-w-lg glass-card rounded-[2rem] p-10 border border-outline-variant/15 overflow-hidden">
          <button className="absolute top-6 right-6 text-outline hover:text-white transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* LOADING — DNA Scanning Animation */}
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

          {/* RESULT */}
          {modalState === 'result' && (
            <div className="flex flex-col items-center">
              {/* Header */}
              <div className="w-full flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="font-headline text-lg font-bold text-primary">{activeSymbol.slice(0,4)}</span>
                </div>
                <div>
                  <div className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary text-[9px] font-bold w-fit mb-1 rounded-full uppercase tracking-widest">Signal Acquired</div>
                  <h4 className="font-headline text-lg font-bold text-white">
                    {stockData ? `${stockData.name || activeSymbol} — $${formatPrice(stockData.price)}` : activeSymbol}
                  </h4>
                </div>
              </div>

              {/* Stock Data Grid — above diagnosis output */}
              {stockData && (
                <div className="w-full grid grid-cols-3 gap-2 mb-6">
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Change</span>
                    <span className={`font-headline text-sm font-bold ${stockData.change_percent >= 0 ? 'text-secondary' : 'text-error'}`}>
                      {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Volume</span>
                    <span className="text-primary font-headline text-sm font-bold">{formatNumber(stockData.volume)}</span>
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Mkt Cap</span>
                    <span className="text-tertiary font-headline text-sm font-bold">{stockData.market_cap ? formatNumber(stockData.market_cap) : '—'}</span>
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Open</span>
                    <span className="text-on-surface font-headline text-sm font-bold">{stockData.open != null ? '$' + formatPrice(stockData.open) : '—'}</span>
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Day High</span>
                    <span className="text-on-surface font-headline text-sm font-bold">{stockData.day_high != null ? '$' + formatPrice(stockData.day_high) : '—'}</span>
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-outline-variant/15 text-center">
                    <span className="block text-[8px] font-label text-on-surface-variant uppercase tracking-widest mb-1">Day Low</span>
                    <span className="text-on-surface font-headline text-sm font-bold">{stockData.day_low != null ? '$' + formatPrice(stockData.day_low) : '—'}</span>
                  </div>
                </div>
              )}

              {/* Diagnosis Output */}
              <div className="w-full glass-card p-8 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low/40 mb-8 max-h-52 overflow-y-auto hide-scroll">
                <h4 className="text-primary font-headline text-lg mb-4">AI Diagnostic Insights</h4>
                <p className="text-on-surface leading-relaxed font-body whitespace-pre-wrap">
                  {placeholderText || 'AI is preparing your diagnostic report...'}
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    const url = redirectUrl || fallbackUrl
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                      ;(window as any).gtag_report_conversion(url)
                    } else { window.location.href = url }
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

      {/* ═══ NAVIGATION — TopAppBar ═══ */}
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
            <span className="text-[10px] text-on-surface-variant font-label uppercase tracking-tighter hidden md:block">US Markets Open</span>
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#5cfd80]"></div>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-20">
        {/* ═══ HERO — Predictive Prism Central Hub ═══ */}
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

            {/* Interaction Core — Glass Panel with Search */}
            <div className="w-full max-w-2xl search-container">
              <div className="glass-card rounded-[2rem] p-8 md:p-12 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-[2rem]"></div>
                <div className="relative z-10 space-y-8">
                  {/* Search Input */}
                  <div className="space-y-2 relative">
                    <label className="block text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest ml-4">Enter Stock Ticker</label>
                    <div className="relative group/input" id="search-input-wrapper">
                      <input
                        className="w-full bg-surface-container-low border-none rounded-full py-6 px-10 text-2xl font-headline font-medium text-on-background placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                        placeholder="NVDA, AAPL, TSLA..."
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value.toUpperCase())}
                        onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && searchInput.trim()) handlePrimaryClick() }}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="material-symbols-outlined text-on-surface-variant/40 group-focus-within/input:text-primary transition-colors text-3xl">
                          {searchLoading ? 'hourglass_top' : 'search'}
                        </span>
                      </div>
                    </div>

                    {/* Search Results Dropdown — positioned relative to input */}
                    {showDropdown && searchInput.trim() && (
                      <div className="absolute top-full left-0 right-0 mt-1 glass-card rounded-2xl border border-outline-variant/15 shadow-2xl shadow-black/40 overflow-hidden z-[100]">
                        {searchResults.length > 0 ? (
                          <>
                            {searchResults.map((item) => (
                              <button
                                key={item.symbol}
                                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-outline-variant/10 last:border-b-0"
                                onClick={() => {
                                  setSearchInput(item.symbol)
                                  setShowDropdown(false)
                                  setStockLoading(true)
                                  getStockQuote(item.symbol)
                                    .then(data => setStockData(data))
                                    .catch(() => setStockData(null))
                                    .finally(() => setStockLoading(false))
                                  startAnalysisStream(item.symbol)
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

                            {/* Pagination */}
                            {searchTotal > 5 && (
                              <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/15 bg-surface-container-low/40">
                                <span className="text-[10px] text-on-surface-variant">
                                  {(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                                    disabled={searchPage <= 1}
                                    onClick={(e) => { e.stopPropagation(); handleSearchPage(searchPage - 1) }}
                                  >
                                    ← Prev
                                  </button>
                                  <button
                                    className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                                    disabled={searchPage * 5 >= searchTotal}
                                    onClick={(e) => { e.stopPropagation(); handleSearchPage(searchPage + 1) }}
                                  >
                                    Next →
                                  </button>
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
          </div>
        </section>

        {/* ═══ TICKER BAR — Marquee ═══ */}
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

        {/* ═══ STOCK DATA MODULE — When ?code= present ═══ */}
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
                <div className="glass-card p-6 rounded-[2rem] border-l-4 border-primary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">Current Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold text-on-surface">${formatPrice(stockData.price)}</span>
                    <span className={`text-sm font-headline font-bold ${stockData.change >= 0 ? 'text-secondary' : 'text-error'}`}>
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border-l-4 border-secondary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-4">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-headline font-bold text-primary">{stockData.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/15">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Volume</p>
                      <p className="text-sm font-bold text-on-surface font-body">{formatNumber(stockData.volume)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Mkt Cap</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.market_cap ? formatNumber(stockData.market_cap) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Open</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.open != null ? '$' + formatPrice(stockData.open) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Prev Close</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.prev_close != null ? '$' + formatPrice(stockData.prev_close) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Day High</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.day_high != null ? '$' + formatPrice(stockData.day_high) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Day Low</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.day_low != null ? '$' + formatPrice(stockData.day_low) : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/15">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">52W High</p>
                      <p className="text-sm font-bold text-tertiary font-body">{stockData.fifty_two_week_high != null ? '$' + formatPrice(stockData.fifty_two_week_high) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">52W Low</p>
                      <p className="text-sm font-bold text-error font-body">{stockData.fifty_two_week_low != null ? '$' + formatPrice(stockData.fifty_two_week_low) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">P/E</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.pe_ratio != null ? stockData.pe_ratio.toFixed(1) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest">EPS</p>
                      <p className="text-sm font-bold text-on-surface font-body">{stockData.eps != null ? '$' + stockData.eps.toFixed(2) : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ═══ BENTO GRID — AI Capabilities ═══ */}
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

        {/* ═══ STATS — Pulse Metrics ═══ */}
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

        {/* ═══ MARKET MOVERS — Hot Stocks ═══ */}
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

        {/* ═══ CTA SECTION ═══ */}
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

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full border-t border-outline-variant/15 bg-background flex flex-col items-center py-8 px-4 space-y-4">
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/privacy">Privacy</Link>
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/terms">Terms</Link>
          <Link className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em] hover:text-primary transition-colors" href="/contact">Contact</Link>
        </div>
        <p className="text-on-surface-variant/60 font-body text-[10px] uppercase tracking-[0.05em]">&copy; 2026{currentDomain ? ` ${currentDomain} ` : ' '}PREDICTIVE PRISM AI. US MARKETS ONLY.</p>
      </footer>

      {/* ═══ FAB — Scroll-triggered ═══ */}
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
