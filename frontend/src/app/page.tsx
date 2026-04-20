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

    // Debounce: wait 300ms after user stops typing
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

  // Close dropdown on outside click
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

  // ── Analysis Stream ──
  const startAnalysisStream = useCallback((symbol: string) => {
    if (streamControllerRef.current) {
      streamControllerRef.current.abort()
    }
    const controller = new AbortController()
    streamControllerRef.current = controller

    setIsStreaming(true)
    setAnalysisContent('')

    fetch(`/api/analyze/${encodeURIComponent(symbol)}`, { signal: controller.signal })
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
          for (const line of chunk.split('\n')) {
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

  // ── Modal ──
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

      {/* ═══ COMPACT MODAL ═══ */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={closeModal}></div>

        <div className="relative w-full max-w-sm brutalist-border bg-black overflow-hidden">
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

          {/* RESULT */}
          {modalState === 'result' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 brutalist-border border-primary flex items-center justify-center shrink-0">
                  <span className="font-headline text-base font-bold text-primary">{activeSymbol.slice(0,4)}</span>
                </div>
                <div>
                  <div className="px-1.5 py-0.5 bg-primary/10 border border-primary/40 text-primary text-[8px] font-bold w-fit mb-0.5">SIGNAL_ACQUIRED</div>
                  <h4 className="font-headline text-sm font-bold uppercase tracking-tight">
                    {stockData ? `${stockData.name || activeSymbol} — $${formatPrice(stockData.price)}` : activeSymbol}
                  </h4>
                </div>
              </div>

              {/* Stock Data Grid — above diagnosis output */}
              {stockData && (
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Change</span>
                    <span className={`font-headline text-xs font-bold ${stockData.change_percent >= 0 ? 'text-primary' : 'text-error'}`}>
                      {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Volume</span>
                    <span className="text-secondary font-headline text-xs font-bold">{formatNumber(stockData.volume)}</span>
                  </div>
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Mkt_Cap</span>
                    <span className="text-tertiary font-headline text-xs font-bold">{stockData.market_cap ? formatNumber(stockData.market_cap) : '—'}</span>
                  </div>
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Open</span>
                    <span className="text-white/80 font-headline text-xs font-bold">{stockData.open != null ? '$' + formatPrice(stockData.open) : '—'}</span>
                  </div>
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Day_High</span>
                    <span className="text-white/80 font-headline text-xs font-bold">{stockData.day_high != null ? '$' + formatPrice(stockData.day_high) : '—'}</span>
                  </div>
                  <div className="p-1.5 border border-white/10 bg-surface-container-low">
                    <span className="block text-[7px] font-label text-white/40 uppercase">Day_Low</span>
                    <span className="text-white/80 font-headline text-xs font-bold">{stockData.day_low != null ? '$' + formatPrice(stockData.day_low) : '—'}</span>
                  </div>
                </div>
              )}

              {/* Diagnosis Output */}
              <div className="bg-surface-container p-3 border-l-2 border-primary max-h-60 overflow-y-auto">
                <p className="font-body text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
                  {analysisContent ? (
                    <>{analysisContent}{isStreaming && <span className="animate-pulse text-primary">▌</span>}</>
                  ) : (
                    placeholderText || 'AI is preparing your diagnosis report...'
                  )}
                </p>
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
            <div className="w-full max-w-3xl relative search-container">
              <div className="bg-surface-container-low p-4 brutalist-border flex flex-col md:flex-row items-stretch gap-3">
                <div className="flex-1 relative">
                  <label className="block font-label text-primary/60 text-[10px] uppercase tracking-widest mb-1">INPUT_TICKER</label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-secondary focus:ring-0 text-2xl md:text-4xl font-headline font-bold text-white placeholder:text-white/10 p-0 uppercase outline-none"
                    placeholder="AAPL..."
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value.toUpperCase())}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && searchInput.trim()) handlePrimaryClick() }}
                  />
                  <span className="absolute right-0 top-1/2 material-symbols-outlined text-white/30 text-lg">
                    {searchLoading ? 'hourglass_top' : 'search'}
                  </span>
                </div>
                <button
                  className="bg-primary text-on-primary px-6 py-3 font-headline font-bold text-base uppercase tracking-tighter hover:bg-primary-fixed active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                  onClick={handlePrimaryClick}
                >
                  DIAGNOSE <span className="material-symbols-outlined text-lg">bolt</span>
                </button>
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && searchInput.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container border border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((item) => (
                        <button
                          key={item.symbol}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-b-0"
                          onClick={() => {
                            setSearchInput(item.symbol)
                            setShowDropdown(false)
                            // Fetch stock data for selected symbol
                            setStockLoading(true)
                            getStockQuote(item.symbol)
                              .then(data => setStockData(data))
                              .catch(() => setStockData(null))
                              .finally(() => setStockLoading(false))
                            startAnalysisStream(item.symbol)
                            openModal()
                          }}
                        >
                          <div className="w-7 h-7 brutalist-border border-primary/30 flex items-center justify-center shrink-0">
                            <span className="font-headline text-[9px] font-bold text-primary">{item.symbol.slice(0, 2)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-bold text-on-surface text-xs">{item.symbol}</span>
                              <span className="text-[8px] px-1 py-0.5 bg-surface-container-high text-white/40 font-label uppercase">{item.type}</span>
                            </div>
                            <p className="text-[10px] text-white/40 truncate mt-0.5 font-body">{item.name}</p>
                          </div>
                          <span className="text-[8px] text-white/30 uppercase tracking-wider shrink-0 font-label">{item.exchange}</span>
                        </button>
                      ))}

                      {/* Pagination */}
                      {searchTotal > 5 && (
                        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-surface-container-low">
                          <span className="text-[9px] text-white/40 font-label">
                            {(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}
                          </span>
                          <div className="flex gap-2">
                            <button
                              className="px-2 py-0.5 text-[9px] font-bold bg-surface-container-high text-white/50 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none font-label uppercase"
                              disabled={searchPage <= 1}
                              onClick={(e) => { e.stopPropagation(); handleSearchPage(searchPage - 1) }}
                            >
                              ← Prev
                            </button>
                            <button
                              className="px-2 py-0.5 text-[9px] font-bold bg-surface-container-high text-white/50 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none font-label uppercase"
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
                    <div className="px-4 py-5 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border border-primary/30 border-t-primary animate-spin"></div>
                      <span className="text-[10px] text-white/40 font-body">Searching...</span>
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center">
                      <span className="material-symbols-outlined text-white/20 text-xl block mb-1">search_off</span>
                      <p className="text-[10px] text-white/30 font-body">No results for &quot;{searchInput}&quot;</p>
                    </div>
                  )}
                </div>
              )}
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
                  <h4 className="font-headline text-sm font-bold uppercase tracking-tighter text-primary">
                    {stockData ? stockData.name || stockData.symbol : stockCode} — ${stockData ? formatPrice(stockData.price) : '...'}
                  </h4>
                </div>
                {stockLoading ? (
                  <div className="flex justify-center py-8"><div className="w-4 h-4 border-2 border-primary/30 border-t-primary animate-spin"></div></div>
                ) : stockData ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="p-2 border border-white/10 bg-surface-container-low">
                      <span className="block text-[8px] font-label text-white/40 uppercase">Price</span>
                      <span className="text-primary font-headline text-sm font-bold">${formatPrice(stockData.price)}</span>
                    </div>
                    <div className="p-2 border border-white/10 bg-surface-container-low">
                      <span className="block text-[8px] font-label text-white/40 uppercase">Change</span>
                      <span className={`font-headline text-sm font-bold ${stockData.change_percent >= 0 ? 'text-primary' : 'text-error'}`}>
                        {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="p-2 border border-white/10 bg-surface-container-low">
                      <span className="block text-[8px] font-label text-white/40 uppercase">Volume</span>
                      <span className="text-secondary font-headline text-sm font-bold">{formatNumber(stockData.volume)}</span>
                    </div>
                    <div className="p-2 border border-white/10 bg-surface-container-low">
                      <span className="block text-[8px] font-label text-white/40 uppercase">Mkt_Cap</span>
                      <span className="text-tertiary font-headline text-sm font-bold">{stockData.market_cap ? formatNumber(stockData.market_cap) : '—'}</span>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="bg-surface-container-high p-3 border border-white/5 flex-1">
                  <span className="block text-[8px] font-label text-white/40 uppercase mb-1">Extended_Data</span>
                  {stockData ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Open</span><p className="text-xs font-bold text-primary">{stockData.open != null ? '$' + formatPrice(stockData.open) : '—'}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Prev_Close</span><p className="text-xs font-bold text-secondary">{stockData.prev_close != null ? '$' + formatPrice(stockData.prev_close) : '—'}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Day_High</span><p className="text-xs font-bold text-white/80">{stockData.day_high != null ? '$' + formatPrice(stockData.day_high) : '—'}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">Day_Low</span><p className="text-xs font-bold text-white/80">{stockData.day_low != null ? '$' + formatPrice(stockData.day_low) : '—'}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">52W_High</span><p className="text-xs font-bold text-tertiary">{stockData.fifty_two_week_high != null ? '$' + formatPrice(stockData.fifty_two_week_high) : '—'}</p></div>
                      <div><span className="text-[8px] font-label text-white/40 uppercase">52W_Low</span><p className="text-xs font-bold text-error">{stockData.fifty_two_week_low != null ? '$' + formatPrice(stockData.fifty_two_week_low) : '—'}</p></div>
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
