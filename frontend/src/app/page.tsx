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
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm transition-all duration-300" onClick={closeModal}></div>
        <div className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl p-6 transition-all duration-300 overflow-hidden">
          <button className="absolute top-3 right-3 text-on-surface-variant hover:text-primary transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-3 rounded-full border-2 border-brand-dark/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-lg text-on-surface">AI Diagnosis In Progress</h2>
                <div className="text-primary text-xs font-semibold">{progressTxt}</div>
              </div>
              <div className="w-full h-1.5 bg-brand-gray rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-[#FF9A6C] transition-all duration-500 ease-out rounded-full" style={{ width: progressW }}></div>
              </div>
            </div>
          )}

          {modalState === 'result' && (
            <div className="flex flex-col">
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[10px] font-bold text-on-surface-variant">100%</span>
                </div>
                <div className="w-full h-1 bg-brand-gray rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full"></div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="font-bold text-2xl text-on-surface mb-2">{modalStock?.name || activeSym}</h2>
                {modalStock ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-bold text-3xl text-primary">${fmtPrice(modalStock.price)}</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${modalStock.change_percent >= 0 ? 'text-green-600 bg-green-50' : 'text-error bg-red-50'}`}>
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
                <div className="bg-brand-gray rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Change</p><p className={`text-xs font-bold ${modalStock.change >= 0 ? 'text-green-600' : 'text-error'}`}>{modalStock.change >= 0 ? '+' : ''}{modalStock.change.toFixed(2)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Volume</p><p className="text-xs font-bold text-on-surface">{fmtNum(modalStock.volume)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Mkt Cap</p><p className="text-xs font-bold text-on-surface">{modalStock.market_cap ? fmtNum(modalStock.market_cap) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">P/E</p><p className="text-xs font-bold text-on-surface">{modalStock.pe_ratio != null ? modalStock.pe_ratio.toFixed(1) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">52W High</p><p className="text-xs font-bold text-on-surface">{modalStock.fifty_two_week_high != null ? '$' + fmtPrice(modalStock.fifty_two_week_high) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">EPS</p><p className="text-xs font-bold text-on-surface">{modalStock.eps != null ? modalStock.eps.toFixed(2) : '—'}</p></div>
                  </div>
                </div>
              )}

              <div className="w-full bg-brand-gray p-3 rounded-2xl mb-4 max-h-48 overflow-y-auto no-scrollbar">
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
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
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-bold text-base tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20"
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

      {/* ── Main Container ── */}
      <div className="w-full max-w-[400px] mx-auto min-h-screen bg-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col border-[8px] border-gray-100">

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-28 px-4 space-y-4 bg-white rounded-t-[32px]">

          {/* ── Header ── */}
          <header className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 overflow-hidden border border-orange-200 p-0.5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>smart_toy</span>
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-on-surface">AI Stock Diagnosis</h1>
                <p className="text-on-surface-variant text-sm">Real-Time Market Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-full bg-white shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-sm font-semibold text-gray-700">AI Online</span>
            </div>
          </header>

          {/* ── Search Bar (Location Selector style) ── */}
          <section className="search-portal">
            <div className="w-full border border-gray-200 rounded-full py-2 px-3 flex items-center justify-between shadow-sm relative">
              <div className="flex items-center gap-3 pl-2 flex-1 min-w-0">
                <span className="material-symbols-outlined text-xl text-gray-700">search</span>
                <input
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-on-surface font-medium text-sm placeholder:text-on-surface-muted outline-none"
                  placeholder="Enter stock code (e.g., AAPL)"
                  type="text"
                  value={query}
                  onChange={e => onQueryChange(e.target.value)}
                  onFocus={() => { if (results.length > 0) setDropdown(true) }}
                  onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleCTA() }}
                />
              </div>
              <button
                className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-white flex-shrink-0 active:scale-95 transition-transform"
                onClick={handleCTA}
              >
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

            {/* Search Dropdown */}
            {dropdown && query.trim() && (
              <div className="absolute left-0 right-0 mt-2 mx-4 rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-lg z-20">
                {results.length > 0 ? (
                  <>
                    {results.map(item => (
                      <button
                        key={item.symbol}
                        className="w-full px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-brand-gray transition-colors border-b border-gray-100 last:border-b-0 text-left"
                        onClick={() => { setQuery(item.symbol); setDropdown(false); startStream(item.symbol); openModal() }}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-primary text-sm">{item.symbol}</span>
                          <span className="text-on-surface-variant text-[10px]">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant border border-gray-200 rounded-full px-2.5 py-0.5 bg-brand-gray">{item.type}</span>
                      </button>
                    ))}
                    {resultTotal > 5 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-[10px] text-on-surface-variant">{(resultPage - 1) * 5 + 1}–{Math.min(resultPage * 5, resultTotal)} of {resultTotal}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-brand-gray text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage <= 1} onClick={() => onPageChange(resultPage - 1)}>← Prev</button>
                          <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-brand-gray text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage * 5 >= resultTotal} onClick={() => onPageChange(resultPage + 1)}>Next →</button>
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
                    <span className="material-symbols-outlined text-on-surface-muted text-2xl block mb-1">search_off</span>
                    <p className="text-xs text-on-surface-variant">No results for &quot;{query}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── AI Stock Analysis Dark Card ── */}
          <section className="bg-brand-dark rounded-[28px] p-5 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F3D59D] flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full border border-orange-300/50 flex items-center justify-center bg-[#EFCA8A]">
                    <span className="material-symbols-outlined text-brand-dark text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>warning_circle</span>
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-xl leading-tight mb-1">AI Stock<br/>Analysis</h2>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors" onClick={handleCTA}>
                <span className="material-symbols-outlined text-lg">arrow_up_right</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-[200px] leading-relaxed relative z-10">
              Real-time market insights and predictive trends for your portfolio.
            </p>
            <div className="flex gap-3 relative z-10">
              <div className="bg-[#EAEAEA] text-gray-800 px-4 py-2.5 rounded-xl font-medium text-sm">
                AI Diagnosis
              </div>
              <button className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all" onClick={handleCTA}>
                Run Now
              </button>
            </div>
          </section>

          {/* ── Market Overview Orange Card ── */}
          <section className="bg-brand-orange rounded-[32px] p-5 text-white relative">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-bold text-2xl leading-tight">Market<br/>Overview</h2>
              <div className="bg-white/20 backdrop-blur-[10px] rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium border border-white/20">
                This week <span className="material-symbols-outlined text-sm">expand_more</span>
              </div>
            </div>

            {/* Stock Circles Row */}
            <div className="flex justify-between items-center mb-8 px-1 overflow-x-auto no-scrollbar">
              {!hotLoading && hotStocks.length > 0 ? hotStocks.slice(0, 7).map((stock, i) => {
                const pct = Math.min(99, Math.max(50, Math.round(70 + stock.change_percent * 3)))
                const isActive = i === 2
                return (
                  <button
                    key={stock.symbol}
                    className={`flex flex-col items-center gap-2 flex-shrink-0 ${isActive ? 'relative' : ''} cursor-pointer`}
                    onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}
                  >
                    {isActive && (
                      <>
                        <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm z-0"></div>
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-12 bg-white/10 rounded-t-full h-32 -z-0"></div>
                      </>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs relative z-10 ${isActive ? 'bg-brand-dark text-white shadow-lg border-2 border-white/20' : 'bg-white text-gray-800'}`}>
                      {pct}
                    </div>
                    <span className={`text-[10px] relative z-10 ${isActive ? 'font-bold text-white' : 'font-medium opacity-80'}`}>{stock.symbol.slice(0, 4)}</span>
                  </button>
                )
              }) : (
                <>
                  {['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META'].map((sym, i) => {
                    const pcts = ['79%', '82%', '90%', '91%', '93%', '79%', '69%']
                    const isActive = i === 2
                    return (
                      <div key={sym} className={`flex flex-col items-center gap-2 ${isActive ? 'relative' : ''}`}>
                        {isActive && <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm z-0"></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs relative z-10 ${isActive ? 'bg-brand-dark text-white shadow-lg border-2 border-white/20' : 'bg-white text-gray-800'}`}>
                          {pcts[i]}
                        </div>
                        <span className={`text-[10px] relative z-10 ${isActive ? 'font-bold text-white' : 'font-medium opacity-80'}`}>{sym}</span>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Chart Area */}
            <div className="relative h-32 mt-6">
              <div className="absolute top-0 left-1/3 -translate-x-1/2 bg-brand-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-20 whitespace-nowrap shadow-xl flex items-center gap-1">
                $22,250.88
              </div>
              <div className="absolute top-5 left-[33%] w-8 h-full bg-gradient-to-t from-white/80 to-white/10 rounded-t-full blur-sm z-10"></div>
              <div className="absolute top-6 left-[37%] w-3 h-3 bg-white rounded-full border-2 border-brand-orange z-20 shadow-md"></div>
              <svg className="absolute bottom-0 w-full h-full text-white drop-shadow-md z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)"></stop>
                    <stop offset="100%" stopColor="rgba(255,255,255,0)"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,70 Q15,85 30,30 T60,60 T90,40 T100,20 L100,100 L0,100 Z" fill="url(#chartGrad)"></path>
                <path d="M0,70 Q15,85 30,30 T60,60 T90,40 T100,20" fill="none" stroke="currentColor" strokeWidth="2"></path>
              </svg>
              <div className="absolute bottom-2 w-full flex justify-between px-2 text-[10px] font-medium opacity-70 z-20">
                <span>Sep</span><span>Oct</span><span>Nov</span>
                <span className="font-bold opacity-100 text-white bg-white/20 px-1.5 rounded-sm">Dec</span>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
            </div>
          </section>

          {/* ── Stock Data Module (code param) ── */}
          {tickerParam && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">analytics</span>
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">AI Diagnosis Result</h2>
              </div>
              {stockLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : stockData ? (
                <div className="flex flex-col gap-3">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-primary">
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">Market Sentiment</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">{stockData.change >= 0 ? 'Positive' : 'Negative'}</span>
                      <span className="text-primary/60 text-sm">({stockData.change >= 0 ? 'Bullish' : 'Bearish'})</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-brand-dark">
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">AI Analysis</p>
                    <div className={`${stockData.change_percent >= 0 ? 'bg-green-50' : 'bg-red-50'} inline-block px-4 py-1 rounded-full mb-2`}>
                      <span className={`${stockData.change_percent >= 0 ? 'text-green-600' : 'text-error'} font-bold text-sm uppercase`}>
                        {stockData.change_percent >= 0 ? 'Positive Outlook' : 'Negative Outlook'}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">
                      AI analysis observes {stockData.change >= 0 ? 'recent upward momentum' : 'recent downward pressure'} at {fmtPrice(stockData.price)} with recent change of {Math.abs(stockData.change_percent).toFixed(1)}%.
                    </p>
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </main>

        {/* ── Bottom Navigation ── */}
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <nav className="bg-brand-dark rounded-3xl p-2 shadow-2xl border border-gray-800">
            <ul className="flex justify-between items-center">
              <li className="flex-1">
                <a className="flex items-center justify-center gap-2 bg-brand-orange text-white py-3 px-4 rounded-2xl w-full" href="#">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>home</span>
                  <span className="font-bold text-sm">Home</span>
                </a>
              </li>
              <li className="flex-1">
                <a className="flex items-center justify-center text-gray-400 py-3 w-full relative" href="#">
                  <span className="material-symbols-outlined text-2xl">monitoring</span>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-700"></div>
                </a>
              </li>
              <li className="flex-1">
                <a className="flex items-center justify-center text-gray-400 py-3 w-full relative bg-gray-800/50 rounded-xl mx-1" href="#">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 h-6 w-px bg-gray-700"></div>
                </a>
              </li>
              <li className="flex-1">
                <a className="flex items-center justify-center text-gray-400 py-3 w-full bg-gray-800/50 rounded-xl" href="#">
                  <span className="material-symbols-outlined text-2xl">settings</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Footer Links */}
          <div className="flex justify-center gap-4 mt-3">
            <Link className="text-[10px] text-gray-400 hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="text-[10px] text-gray-400 hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-6 left-0 w-full px-4 z-[80]" id="sticky-cta">
        <div className="max-w-[400px] mx-auto">
          <button
            className="w-full bg-brand-orange text-white font-bold py-4 rounded-2xl text-base tracking-tight shadow-[0_12px_40px_rgba(240,93,35,0.3)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={handleCTA}
          >
            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
            RUN AI DIAGNOSIS
          </button>
        </div>
      </div>
    </>
  )
}
