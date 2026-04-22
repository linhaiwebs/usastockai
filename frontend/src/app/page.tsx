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
    getStockQuote(tickerParam).then(d => { if (!c) { setStockData(d); setModalStock(d) } }).catch(() => { if (!c) { setStockData(null); setModalStock(null) } }).finally(() => { if (!c) setStockLoading(false) })
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

  // ── Scroll CTA ──
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('scroll-cta')
      if (!el) return
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      el.classList.toggle('visible', pct >= 70)
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
        <div className="fixed inset-0 bg-[#0e0e0e]/70 backdrop-blur-sm" onClick={closeModal}></div>
        <div className="relative w-full max-w-sm bg-surface-container rounded-[1.5rem] border border-white/5 p-6 shadow-2xl overflow-hidden">
          <button className="absolute top-3 right-3 text-on-surface-variant hover:text-primary-fixed transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[280px] text-center space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-primary-container/20 animate-ping"></div>
                <div className="absolute inset-3 rounded-full border-2 border-primary-container/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg text-primary-container animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-lg text-on-surface">AI Diagnosis In Progress</h2>
                <div className="text-primary-container text-xs font-semibold">{progressTxt}</div>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container to-primary-fixed-dim transition-all duration-500 ease-out rounded-full" style={{ width: progressW }}></div>
              </div>
            </div>
          )}

          {modalState === 'result' && (
            <div className="flex flex-col">
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-primary-container tracking-[0.2em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[10px] font-bold text-on-surface-variant">100%</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-full"></div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="font-bold text-xl text-on-surface mb-2">{modalStock?.name || activeSym}</h2>
                {modalStock ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-bold text-2xl text-primary-container">${fmtPrice(modalStock.price)}</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${modalStock.change_percent >= 0 ? 'text-primary-fixed bg-primary-container/10' : 'text-error bg-error-container/30'}`}>
                      {modalStock.change_percent >= 0 ? '+' : ''}{modalStock.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant">Loading price...</span>
                  </div>
                )}
              </div>

              {modalStock && (
                <div className="bg-surface-container-low rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Change</p><p className={`text-xs font-bold ${modalStock.change >= 0 ? 'text-primary-fixed' : 'text-error'}`}>{modalStock.change >= 0 ? '+' : ''}{modalStock.change.toFixed(2)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Volume</p><p className="text-xs font-bold text-on-surface">{fmtNum(modalStock.volume)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Mkt Cap</p><p className="text-xs font-bold text-on-surface">{modalStock.market_cap ? fmtNum(modalStock.market_cap) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">P/E</p><p className="text-xs font-bold text-on-surface">{modalStock.pe_ratio != null ? modalStock.pe_ratio.toFixed(1) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">52W High</p><p className="text-xs font-bold text-on-surface">{modalStock.fifty_two_week_high != null ? '$' + fmtPrice(modalStock.fifty_two_week_high) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">EPS</p><p className="text-xs font-bold text-on-surface">{modalStock.eps != null ? modalStock.eps.toFixed(2) : '—'}</p></div>
                  </div>
                </div>
              )}

              <div className="w-full bg-surface-container-low p-3 rounded-xl mb-4 max-h-40 overflow-y-auto hide-scrollbar">
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                  {analysisContent ? <>{analysisContent}{isStreaming && <span className="animate-pulse text-primary-container">▌</span>}</> : placeholderText || '> Initializing diagnosis engine...'}
                </p>
              </div>

              {/* ── Trust Badges ── */}
              <div className="flex items-center justify-center gap-4 mb-4 text-[10px] text-on-surface-variant">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">verified</span> 50K+ Users</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">shield</span> Secure</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">block</span> No Spam</div>
              </div>

              <div className="w-full">
                <button
                  onClick={() => {
                    const url = redirectUrl || fallbackUrl
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') (window as any).gtag_report_conversion(url)
                    else window.location.href = url
                  }}
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20"
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

      {/* ── Main Layout ── */}
      <main className="max-w-3xl mx-auto w-full">

        {/* ── Hero Section (Lime Container) ── */}
        <section className="bg-primary-container px-5 pt-6 pb-6 rounded-b-[2rem] relative z-10">
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg border-2 border-on-primary-container">
              <span className="material-symbols-outlined text-2xl text-primary-fixed">smart_toy</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-primary-container opacity-80">AI-Powered</p>
              <h1 className="text-xl font-bold text-on-primary">Stock Diagnosis</h1>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="relative w-full shadow-lg rounded-full search-portal">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
            </div>
            <input
              autoComplete="off"
              className="w-full bg-surface-container-lowest text-on-surface rounded-full py-3 pl-12 pr-4 border-none focus:ring-2 focus:ring-primary-container outline-none font-medium text-base placeholder-on-surface/50"
              placeholder="Enter stock code (e.g., AAPL)"
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onFocus={() => { if (results.length > 0) setDropdown(true) }}
              onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleCTA() }}
            />
          </div>

          {/* Search Dropdown */}
          {dropdown && query.trim() && (
            <div className="absolute left-0 right-0 mt-2 mx-5 rounded-2xl bg-surface-container-lowest border border-white/5 overflow-hidden shadow-2xl z-20">
              {results.length > 0 ? (
                <>
                  {results.map(item => (
                    <button key={item.symbol} className="w-full px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors border-b border-white/5 last:border-b-0 text-left"
                      onClick={() => { setQuery(item.symbol); setDropdown(false); setTimeout(() => { startStream(item.symbol); openModal() }, 0) }}>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary-container text-sm">{item.symbol}</span>
                        <span className="text-on-surface-variant text-[10px]">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant border border-outline-variant/30 rounded-full px-2.5 py-0.5 bg-surface-container">{item.type}</span>
                    </button>
                  ))}
                  {resultTotal > 5 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                      <span className="text-[10px] text-on-surface-variant">{(resultPage - 1) * 5 + 1}–{Math.min(resultPage * 5, resultTotal)} of {resultTotal}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-fixed transition-all disabled:opacity-30" disabled={resultPage <= 1} onClick={() => onPageChange(resultPage - 1)}>← Prev</button>
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-fixed transition-all disabled:opacity-30" disabled={resultPage * 5 >= resultTotal} onClick={() => onPageChange(resultPage + 1)}>Next →</button>
                      </div>
                    </div>
                  )}
                </>
              ) : searching ? (
                <div className="px-4 py-6 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></div>
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

          {/* Stock Analysis Button */}
          <div className="mt-3">
            <button className="w-full flex items-center justify-center gap-2 bg-surface-container-lowest text-primary-fixed px-6 py-3 rounded-full font-medium text-base hover:bg-surface-container transition-colors shadow-lg shadow-black/10" onClick={handleCTA}>
              <span className="material-symbols-outlined text-lg">monitoring</span>
              <span>Stock Analysis</span>
            </button>
          </div>
        </section>

        {/* ── AI Stock Analysis Card ── */}
        <section className="px-5 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-on-surface">AI Stock Analysis</h2>
          </div>
          <div className="bg-surface-container border border-white/5 rounded-[1.5rem] p-4 lime-glow w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary-container/10 text-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">psychology</span>
              </div>
              <h3 className="font-bold text-on-surface text-base">Introduction to AI Stock Analysis</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed text-xs">
              Our AI continuously evaluates market trends, analyzes financial health, and assesses growth potential to provide you with intelligent, data-driven recommendations and insights.
            </p>
          </div>
        </section>

        {/* ── Your Stocks Section (Hot Stocks) ── */}
        <section className="px-5 mt-6 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="w-full flex flex-col items-center gap-1">
              <span className="inline-block bg-primary-container/10 border border-primary-container/30 text-primary-fixed text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                Your Watchlist
              </span>
              <div className="flex justify-between items-center w-full mt-1">
                <h2 className="text-lg font-bold text-on-surface">Your Stocks</h2>
                <span className="text-xs font-medium text-primary-fixed hover:text-primary-container transition-colors cursor-pointer">View all</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!hotLoading && hotStocks.length > 0 ? hotStocks.map((stock, idx) => {
              const colors = ['bg-white', 'bg-[#E82127]', 'bg-white', 'bg-[#FF9900]', 'bg-[#4285F4]', 'bg-[#FF0040]', 'bg-[#00A4EF]']
              const textColors = ['text-black', 'text-white', 'text-black', 'text-white', 'text-white', 'text-white', 'text-white']
              return (
                <button key={stock.symbol} className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-white/5 hover:bg-surface-container transition-colors w-full text-left"
                  onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colors[idx % colors.length]} rounded-full flex items-center justify-center p-2`}>
                      <span className={`${textColors[idx % textColors.length]} font-bold text-lg`}>{stock.symbol.slice(0, 1)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-on-surface text-sm">{stock.name?.split(' ').slice(0, 2).join(' ') || stock.symbol}</h4>
                      <p className="text-on-surface-variant text-xs">{stock.symbol} • {stock.sector || 'Stock'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-base">${fmtPrice(stock.price)}</p>
                    <p className={`font-medium text-xs ${stock.change_percent >= 0 ? 'text-primary-fixed' : 'text-error'}`}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(1)}%
                    </p>
                  </div>
                </button>
              )
            }) : (
              <>
                {[
                  { name: 'Apple', sym: 'AAPL', sector: 'Technology', price: '$212.69', change: '+3.5%', up: true, color: 'bg-white', tc: 'text-black' },
                  { name: 'Tesla', sym: 'TSLA', sector: 'Automotive', price: '$185.40', change: '+1.2%', up: true, color: 'bg-[#E82127]', tc: 'text-white' },
                  { name: 'Amazon', sym: 'AMZN', sector: 'Retail', price: '$145.20', change: '-0.8%', up: false, color: 'bg-white', tc: 'text-black' },
                ].map(s => (
                  <div key={s.sym} className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center p-2`}>
                        <span className={`${s.tc} font-bold text-lg`}>{s.sym.slice(0, 1)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-on-surface text-sm">{s.name}</h4>
                        <p className="text-on-surface-variant text-xs">{s.sym} • {s.sector}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-base">{s.price}</p>
                      <p className={`font-medium text-xs ${s.up ? 'text-primary-fixed' : 'text-error'}`}>{s.change}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {tickerParam && stockData && (
          <section className="px-5 mt-4 mb-6">
            <div className="bg-surface-container border border-white/5 rounded-[1.5rem] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary-container/10 text-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">analytics</span>
                </div>
                <h3 className="font-bold text-on-surface">AI Diagnosis Result</h3>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xl font-bold text-primary-container">${fmtPrice(stockData.price)}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${stockData.change_percent >= 0 ? 'text-primary-fixed bg-primary-container/10' : 'text-error bg-error-container/30'}`}>
                  {stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%
                </span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                AI analysis observes {stockData.change >= 0 ? 'recent upward momentum' : 'recent downward pressure'} with a {stockData.change >= 0 ? 'bullish' : 'bearish'} outlook.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full text-on-surface-variant opacity-60 text-center py-4">
        <p className="mb-2 text-xs">© 2026 AI Stock Diagnosis. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-xs">
          <Link className="hover:text-primary-container transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="hover:text-primary-container transition-colors" href="/terms">Terms of Service</Link>
        </div>
      </footer>

      {/* ── Scroll CTA ── */}
      <div className="fixed bottom-6 inset-x-4 z-[80] flex justify-center" id="scroll-cta">
        <div className="w-full max-w-md">
          <button className="w-full bg-primary-container text-on-primary font-bold py-3 px-5 rounded-2xl shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            onClick={handleCTA}>
            <span className="material-symbols-outlined">monitoring</span>
            Run AI Stock Diagnosis
          </button>
        </div>
      </div>
    </>
  )
}
