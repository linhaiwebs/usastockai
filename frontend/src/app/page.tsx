'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getStockQuote, getHotStocks, searchStocks, StockQuote, SearchResult, SearchResponse } from '../lib/api'

function fmtNum(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

function fmtPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function HomePage() {
  return <Suspense><HomeContent /></Suspense>
}

function HomeContent() {
  const isAnalyzingRef = useRef(false)
  const searchParams = useSearchParams()
  const tickerParam = searchParams.get('code') || ''

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
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [resultTotal, setResultTotal] = useState(0)
  const [resultPage, setResultPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const [modalState, setModalState] = useState<'closed' | 'loading' | 'result'>('closed')
  const [modalStock, setModalStock] = useState<StockQuote | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const streamRef = useRef<AbortController | null>(null)
  const [progressW, setProgressW] = useState('0%')
  const [progressTxt, setProgressTxt] = useState('')

  // ── Effects ──
  useEffect(() => { if (tickerParam) setQuery(tickerParam.toUpperCase()) }, [tickerParam])

  useEffect(() => {
    if (!tickerParam) { setStockData(null); return }
    let c = false
    setStockLoading(true)
    getStockQuote(tickerParam)
      .then(d => { if (!c) { setStockData(d); setModalStock(d) } })
      .catch(() => { if (!c) { setStockData(null); setModalStock(null) } })
      .finally(() => { if (!c) setStockLoading(false) })
    return () => { c = true }
  }, [tickerParam])

  useEffect(() => {
    let c = false
    setHotLoading(true)
    getHotStocks().then(d => { if (!c) setHotStocks(d) }).catch(() => { if (!c) setHotStocks([]) }).finally(() => { if (!c) setHotLoading(false) })
    return () => { c = true }
  }, [])

  useEffect(() => {
    setCurrentDomain(window.location.hostname)
    fetch('/api/config/public').then(r => r.json()).then(data => {
      const s = data.settings || []
      const fb = s.find((x: { key: string }) => x.key === 'fallback_redirect_url')
      if (fb?.value) setFallbackUrl(fb.value)
      const ph = s.find((x: { key: string }) => x.key === 'diagnostic_placeholder_text')
      if (ph?.value) setPlaceholderText(ph.value)
    }).catch(() => {})
  }, [])

  // ── Search ──
  const doSearch = useCallback((q: string, pg: number = 1) => {
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null }
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
    if (!q.trim()) { setResults([]); setResultTotal(0); setDropdown(false); return }
    debounceRef.current = setTimeout(() => {
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setSearching(true); setResultPage(pg)
      searchStocks(q, pg, 5).then((d: SearchResponse) => {
        if (ctrl.signal.aborted) return
        setResults(d.results || []); setResultTotal(d.total || 0); setDropdown(true)
      }).catch(e => { if (e.name !== 'AbortError') { setResults([]); setResultTotal(0) } })
        .finally(() => { if (!ctrl.signal.aborted) setSearching(false) })
    }, 300)
  }, [])

  const onQueryChange = useCallback((v: string) => { setQuery(v); doSearch(v, 1) }, [doSearch])
  const onPageChange = useCallback((p: number) => { doSearch(query, p) }, [doSearch, query])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.search-portal')) setDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Stream ──
  const startStream = useCallback((symbol: string) => {
    if (streamRef.current) streamRef.current.abort()
    const ctrl = new AbortController()
    streamRef.current = ctrl
    setIsStreaming(true); setAnalysisContent('')
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') (window as any).gtag('event', 'Bdd')
    setModalStock(null)
    getStockQuote(symbol).then(d => setModalStock(d)).catch(() => setModalStock(null))
    fetch(`/api/analyze/${encodeURIComponent(symbol)}`, { signal: ctrl.signal })
      .then(async res => {
        if (!res.ok) { setIsStreaming(false); return }
        const reader = res.body?.getReader()
        if (!reader) { setIsStreaming(false); return }
        const dec = new TextDecoder()
        let txt = '', evt = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const line of dec.decode(value, { stream: true }).split('\n')) {
            if (line.startsWith('event: ')) evt = line.slice(7).trim()
            else if (line.startsWith('data: ')) {
              if (evt === 'error') { txt = ''; setAnalysisContent(''); evt = '' }
              else { txt += line.slice(6); setAnalysisContent(txt) }
            }
          }
        }
        setIsStreaming(false)
      })
      .catch(e => { if (e.name !== 'AbortError') setIsStreaming(false) })
  }, [])

  // ── Modal ──
  const openModal = useCallback(() => {
    const m = document.getElementById('global-mask'); if (m) m.classList.add('active')
    setModalState('loading'); setProgressW('0%'); setProgressTxt('Initializing AI diagnosis...'); setRedirectUrl(null)
    fetch('/api/redirects/assign').then(r => r.ok ? r.json() : null).then(d => d?.url && setRedirectUrl(d.url)).catch(() => {})
    const steps = [
      { p: '25%', t: 'Scanning Market Data...' },
      { p: '55%', t: 'Analyzing Price Patterns...' },
      { p: '85%', t: 'Generating Diagnosis Report...' },
      { p: '100%', t: 'Diagnosis Complete.' },
    ]
    steps.forEach((s, i) => {
      setTimeout(() => {
        setProgressW(s.p); setProgressTxt(s.t)
        if (i === steps.length - 1) setTimeout(() => setModalState('result'), 800)
      }, (i + 1) * 800)
    })
  }, [])

  const closeModal = useCallback(() => {
    if (streamRef.current) { streamRef.current.abort(); streamRef.current = null }
    setIsStreaming(false); setModalState('closed')
    const m = document.getElementById('global-mask'); if (m) m.classList.remove('active')
  }, [])

  const handleCTA = useCallback(() => {
    if (isAnalyzingRef.current) return
    isAnalyzingRef.current = true
    const sym = tickerParam && stockData ? tickerParam : query.trim() || 'AAPL'
    startStream(sym); openModal(); isAnalyzingRef.current = false
  }, [openModal, tickerParam, stockData, query, startStream])

  // ── Sticky CTA on scroll ──
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('sticky-cta')
      if (!el) return
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      el.classList.toggle('visible', pct > 70)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeSym = tickerParam && stockData ? tickerParam : query.trim() || 'AAPL'

  return (
    <>
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ── Diagnostic Modal ── */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-[#2c2a51]/50 backdrop-blur-sm transition-all duration-300" onClick={closeModal}></div>
        <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-[0_20px_60px_rgba(44,42,81,0.15)] p-6 transition-all duration-300 overflow-hidden">
          <button className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-3 rounded-full border-2 border-secondary/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-lg font-bold text-on-surface">AI Diagnosis In Progress</h2>
                <div className="text-primary font-headline text-xs font-semibold">{progressTxt}</div>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out rounded-full" style={{ width: progressW }}></div>
              </div>
            </div>
          )}

          {modalState === 'result' && (
            <div className="flex flex-col">
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-headline font-bold text-primary tracking-[0.2em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[10px] font-headline font-semibold text-secondary">100%</span>
                </div>
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full"></div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">{modalStock?.name || activeSym}</h2>
                {modalStock ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-headline text-3xl font-extrabold text-primary">${fmtPrice(modalStock.price)}</span>
                    <span className={`text-sm font-headline font-bold px-3 py-1 rounded-full ${modalStock.change_percent >= 0 ? 'text-green-600 bg-green-50' : 'text-error bg-red-50'}`}>
                      {modalStock.change_percent >= 0 ? '+' : ''}{modalStock.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant">Loading price...</span>
                  </div>
                )}
              </div>

              {modalStock && (
                <div className="bg-surface-container-low rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Change</p><p className={`text-xs font-bold font-headline ${modalStock.change >= 0 ? 'text-green-600' : 'text-error'}`}>{modalStock.change >= 0 ? '+' : ''}{modalStock.change.toFixed(2)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Volume</p><p className="text-xs font-bold text-on-surface font-headline">{fmtNum(modalStock.volume)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Mkt Cap</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.market_cap ? fmtNum(modalStock.market_cap) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">P/E</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.pe_ratio != null ? modalStock.pe_ratio.toFixed(1) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">52W High</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.fifty_two_week_high != null ? '$' + fmtPrice(modalStock.fifty_two_week_high) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">EPS</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.eps != null ? modalStock.eps.toFixed(2) : '—'}</p></div>
                  </div>
                </div>
              )}

              <div className="w-full bg-surface-container-low p-3 rounded-xl mb-4 max-h-48 overflow-y-auto no-scrollbar">
                <p className="text-sm text-on-surface leading-relaxed font-body whitespace-pre-wrap">
                  {analysisContent ? <>{analysisContent}{isStreaming && <span className="animate-pulse text-primary">▌</span>}</> : placeholderText || '> Initializing diagnosis engine...'}
                </p>
              </div>

              <div className="w-full">
                <button
                  onClick={() => {
                    const url = redirectUrl || fallbackUrl
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') (window as any).gtag_report_conversion(url)
                    else window.location.href = url
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-headline font-bold text-base tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20"
                  id="modal-submit-btn"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Get the report for free via WhatsApp
                </button>
                <p className="mt-2 text-center text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">INSTANT WHATSAPP DELIVERY · COMPREHENSIVE REPORT</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center px-4 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm">
        <button className="p-2 -ml-2 text-primary hover:bg-surface-container transition-colors rounded-full active:scale-95">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline text-lg font-bold tracking-tight text-primary ml-2 flex-grow">Fidex AI</h1>
      </header>

      <main className="flex-grow flex flex-col pt-16 overflow-y-auto px-4 max-w-3xl mx-auto w-full pb-8">
        {/* ── Welcome Section ── */}
        <div className="flex flex-col items-center text-center mt-12 mb-8">
          <div className="w-32 h-32 mb-6 rounded-full bg-surface-container-high flex items-center justify-center shadow-[0_12px_40px_rgba(44,42,81,0.06)]">
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>smart_toy</span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2 tracking-tight">AI Stock Diagnosis 👋</h2>
          <p className="font-body text-on-surface-variant text-lg mb-6">
            How can I help you analyze stocks?
          </p>

          {/* ── Search Input ── */}
          <div className="w-full max-w-lg mx-auto flex items-center gap-3 search-portal">
            <div className="relative flex-grow flex items-center bg-surface-container-lowest rounded-full shadow-[0_8px_30px_rgba(44,42,81,0.05)] border border-outline-variant/15 focus-within:border-primary focus-within:shadow-[0_8px_30px_rgba(38,71,229,0.1)] transition-all duration-300">
              <input
                autoComplete="off"
                className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body text-base px-6 py-4 rounded-full placeholder:text-on-surface-variant/60"
                placeholder="Enter stock code (e.g., AAPL)"
                type="text"
                value={query}
                onChange={e => onQueryChange(e.target.value)}
                onFocus={() => { if (results.length > 0) setDropdown(true) }}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleCTA() }}
              />
            </div>
            <button
              className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary flex items-center justify-center shadow-[0_12px_40px_rgba(38,71,229,0.2)] hover:opacity-90 active:scale-95 transition-all duration-200"
              onClick={handleCTA}
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>send</span>
            </button>
          </div>

          {/* Search Dropdown */}
          {dropdown && query.trim() && (
            <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-full max-w-lg mx-auto mt-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 overflow-hidden shadow-[0_20px_50px_rgba(44,42,81,0.15)] z-20">
              {results.length > 0 ? (
                <>
                  {results.map(item => (
                    <button
                      key={item.symbol}
                      className="w-full px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors border-b border-outline-variant/10 last:border-b-0 text-left"
                      onClick={() => { setQuery(item.symbol); setDropdown(false); startStream(item.symbol); openModal() }}
                    >
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-primary text-sm">{item.symbol}</span>
                        <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                      </div>
                      <span className="font-label text-[10px] text-secondary border border-outline-variant/30 rounded-full px-2.5 py-0.5 bg-surface-container">{item.type}</span>
                    </button>
                  ))}
                  {resultTotal > 5 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10">
                      <span className="text-[10px] text-on-surface-variant">{(resultPage - 1) * 5 + 1}–{Math.min(resultPage * 5, resultTotal)} of {resultTotal}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage <= 1} onClick={() => onPageChange(resultPage - 1)}>← Prev</button>
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage * 5 >= resultTotal} onClick={() => onPageChange(resultPage + 1)}>Next →</button>
                      </div>
                    </div>
                  )}
                </>
              ) : searching ? (
                <div className="px-4 py-6 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-xs text-on-surface-variant">Searching...</span>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl block mb-1">search_off</span>
                  <p className="text-xs text-on-surface-variant">No results for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Trending Stocks Carousel ── */}
        <div className="mt-4 mb-8 w-full">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-headline font-bold text-on-surface text-lg">Trending Stocks</h3>
            <button className="text-primary font-body text-sm font-semibold hover:underline">View all</button>
          </div>
          <div className="carousel-container px-2 pb-4">
            {!hotLoading && hotStocks.length > 0 ? hotStocks.slice(0, 6).map(stock => (
              <div key={stock.symbol} className="carousel-item">
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 h-full flex flex-col justify-between cursor-pointer hover:shadow-[0_8px_30px_rgba(44,42,81,0.12)] transition-all" onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface">{stock.symbol.slice(0, 1)}</div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-base">{stock.symbol}</h4>
                      <p className="font-label text-on-surface-variant text-xs">{stock.name}</p>
                    </div>
                  </div>
                  <div>
                    <div className="font-headline font-extrabold text-2xl text-on-surface mb-1">${fmtPrice(stock.price)}</div>
                    <div className={`flex items-center font-body text-sm font-semibold ${stock.change_percent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      <span className="material-symbols-outlined text-sm mr-1">{stock.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="carousel-item z-[3]">
                  <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface">T</div><div><h4 className="font-headline font-bold text-on-surface text-base">TSLA</h4><p className="font-label text-on-surface-variant text-xs">Tesla Inc.</p></div></div>
                    <div><div className="font-headline font-extrabold text-2xl text-on-surface mb-1">$185.34</div><div className="flex items-center text-green-600 font-body text-sm font-semibold"><span className="material-symbols-outlined text-sm mr-1">trending_up</span>+2.45%</div></div>
                  </div>
                </div>
                <div className="carousel-item z-[2]">
                  <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface">A</div><div><h4 className="font-headline font-bold text-on-surface text-base">AAPL</h4><p className="font-label text-on-surface-variant text-xs">Apple Inc.</p></div></div>
                    <div><div className="font-headline font-extrabold text-2xl text-on-surface mb-1">$173.50</div><div className="flex items-center text-red-500 font-body text-sm font-semibold"><span className="material-symbols-outlined text-sm mr-1">trending_down</span>-0.82%</div></div>
                  </div>
                </div>
                <div className="carousel-item z-[1]">
                  <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface">N</div><div><h4 className="font-headline font-bold text-on-surface text-base">NVDA</h4><p className="font-label text-on-surface-variant text-xs">NVIDIA Corp.</p></div></div>
                    <div><div className="font-headline font-extrabold text-2xl text-on-surface mb-1">$892.81</div><div className="flex items-center text-green-600 font-body text-sm font-semibold"><span className="material-symbols-outlined text-sm mr-1">trending_up</span>+4.12%</div></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Stock Data Module (code param) ── */}
        {tickerParam && (
          <section className="w-full max-w-lg mx-auto mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
              <h2 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">AI Diagnosis Result</h2>
            </div>
            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : stockData ? (
              <div className="flex flex-col gap-3">
                <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 border-l-4 border-l-primary">
                  <p className="text-on-surface-variant font-headline text-xs uppercase tracking-widest mb-2">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-headline font-extrabold text-primary">{stockData.change >= 0 ? 'Positive' : 'Negative'}</span>
                    <span className="text-primary/60 font-headline text-sm">({stockData.change >= 0 ? 'Bullish' : 'Bearish'} Sentiment)</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-[0_4px_20px_rgba(44,42,81,0.08)] border border-outline-variant/20 border-l-4 border-l-secondary">
                  <p className="text-on-surface-variant font-headline text-xs uppercase tracking-widest mb-2">AI Analysis</p>
                  <div className={`${stockData.change_percent >= 0 ? 'bg-green-50' : 'bg-red-50'} inline-block px-4 py-1 rounded-full mb-2`}>
                    <span className={`${stockData.change_percent >= 0 ? 'text-green-600' : 'text-error'} font-headline font-bold text-sm uppercase`}>
                      {stockData.change_percent >= 0 ? 'Positive Outlook' : 'Negative Outlook'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-body">
                    AI analysis observes {stockData.change >= 0 ? 'recent upward momentum' : 'recent downward pressure'} at {fmtPrice(stockData.price)} with recent change of {Math.abs(stockData.change_percent).toFixed(1)}%.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto py-8 text-center">
        <p className="font-body text-sm text-on-surface-variant/60 mb-2">
          © 2024 Fidex AI
        </p>
        <div className="flex justify-center gap-4">
          <Link className="font-body text-xs text-on-surface-variant/40 hover:text-primary transition-colors hover:underline" href="/privacy">Privacy Policy</Link>
          <Link className="font-body text-xs text-on-surface-variant/40 hover:text-primary transition-colors hover:underline" href="/terms">Terms of Service</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-6 left-0 w-full px-4 z-[80]" id="sticky-cta">
        <div className="max-w-lg mx-auto">
          <button
            className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold py-4 rounded-2xl text-base tracking-tight shadow-[0_12px_40px_rgba(38,71,229,0.25)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={handleCTA}
          >
            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
            RUN AI DIAGNOSIS
          </button>
        </div>
      </div>
    </>
  )
}
