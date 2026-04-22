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
    getStockQuote(tickerParam).then(d => { if (!c) { setStockData(d); setModalStock(d) } }).catch(() => { if (!c) { setStockData(null); setModalStock(null) } })
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
    }, 150)
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

  // ── Stock icon map ──
  const stockIcons = ['devices', 'window', 'memory', 'shopping_cart', 'local_shipping', 'science', 'smart_toy', 'trending_up']

  return (
    <>
      <div className="screen-mask" id="global-mask" onClick={closeModal}></div>

      {/* ── Diagnostic Modal ── */}
      <div className={`modal-container ${modalState !== 'closed' ? 'active' : ''}`}>
        <div className="fixed inset-0 bg-surface-container-lowest/70 backdrop-blur-sm" onClick={closeModal}></div>
        <div className="relative w-full max-w-sm bg-surface-container rounded-[1.5rem] border border-white/5 p-5 shadow-2xl overflow-hidden">
          <button className="absolute top-3 right-3 text-on-surface-variant hover:text-primary-fixed transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[260px] text-center gap-5">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-primary-container/20 animate-ping"></div>
                <div className="absolute inset-3 rounded-full border-2 border-primary-container/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold text-on-surface text-headline-md">AI Diagnosis</h2>
                <div className="text-primary-container text-label-md font-semibold">{progressTxt}</div>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container to-primary-fixed-dim transition-all duration-500 ease-out rounded-full" style={{ width: progressW }}></div>
              </div>
              {/* Trust badges */}
              <div className="flex items-center justify-center gap-3 text-label-md text-on-surface-variant">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">verified</span> 50K+ Users</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">shield</span> Secure</div>
              </div>
            </div>
          )}

          {modalState === 'result' && (
            <div className="flex flex-col gap-3">
              {/* Progress bar */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-primary-container tracking-[0.2em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[10px] font-bold text-on-surface-variant">100%</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container w-full"></div>
                </div>
              </div>

              {/* Stock header */}
              <div className="text-center">
                <h2 className="font-bold text-on-surface text-headline-md">{modalStock?.name || activeSym}</h2>
                {modalStock ? (
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="font-bold text-primary-container text-data-lg">${fmtPrice(modalStock.price)}</span>
                    <span className={`text-label-md font-bold px-3 py-0.5 rounded-full ${modalStock.change_percent >= 0 ? 'text-primary-fixed bg-primary-container/10' : 'text-error bg-error-container/30'}`}>
                      {modalStock.change_percent >= 0 ? '+' : ''}{modalStock.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <div className="w-3 h-3 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></div>
                    <span className="text-label-md text-on-surface-variant">Loading price...</span>
                  </div>
                )}
              </div>

              {/* Key metrics */}
              {modalStock && (
                <div className="bg-surface-container-low rounded-xl p-3">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Change</p><p className={`text-label-md font-bold ${modalStock.change >= 0 ? 'text-primary-fixed' : 'text-error'}`}>{modalStock.change >= 0 ? '+' : ''}{modalStock.change.toFixed(2)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Volume</p><p className="text-label-md font-bold text-on-surface">{fmtNum(modalStock.volume)}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">Mkt Cap</p><p className="text-label-md font-bold text-on-surface">{modalStock.market_cap ? fmtNum(modalStock.market_cap) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">P/E</p><p className="text-label-md font-bold text-on-surface">{modalStock.pe_ratio != null ? modalStock.pe_ratio.toFixed(1) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">52W High</p><p className="text-label-md font-bold text-on-surface">{modalStock.fifty_two_week_high != null ? '$' + fmtPrice(modalStock.fifty_two_week_high) : '—'}</p></div>
                    <div><p className="text-[9px] text-on-surface-variant uppercase tracking-widest">EPS</p><p className="text-label-md font-bold text-on-surface">{modalStock.eps != null ? modalStock.eps.toFixed(2) : '—'}</p></div>
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              <div className="w-full bg-surface-container-low p-3 rounded-xl max-h-32 overflow-y-auto hide-scrollbar">
                <p className="text-label-md text-on-surface leading-relaxed whitespace-pre-wrap">
                  {analysisContent ? <>{analysisContent}{isStreaming && <span className="animate-pulse text-primary-container">▌</span>}</> : placeholderText || '> Initializing diagnosis engine...'}
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-label-md text-on-surface-variant">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">verified</span> 50K+ Users</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">shield</span> Secure</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-primary-container text-sm">block</span> No Spam</div>
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  const url = redirectUrl || fallbackUrl
                  if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') (window as any).gtag_report_conversion(url)
                  else window.location.href = url
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full font-bold text-label-md hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/20"
                id="modal-submit-btn"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                Get the report for free via WhatsApp
              </button>
              <p className="text-center text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.15em]">INSTANT WHATSAPP DELIVERY · COMPREHENSIVE REPORT</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          Page Layout — usa-2 Stitch Design 1:1
          ══════════════════════════════════════════════════ */}

      {/* ── TopAppBar ── */}
      <header className="bg-neutral-950 text-lime-400 sticky top-0 z-50 border-b border-white/10 flex justify-between items-center w-full px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container text-lg">smart_toy</span>
          </div>
          <span className="text-2xl font-black italic text-primary-container tracking-tighter">StockAI</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-neutral-400 hover:text-lime-300 transition-colors">notifications</span>
        </button>
      </header>

      {/* ── Main ── */}
      <main className="px-container-padding py-6 flex flex-col gap-section-margin">

        {/* ── Hero Search Section ── */}
        <section className="flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container mb-2 relative">
            <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-primary-container text-5xl">smart_toy</span>
            </div>
          </div>
          <h1 className="text-headline-lg font-bold text-on-surface">How can I help you<br />invest today?</h1>

          {/* AI Search Bar */}
          <div className="w-full max-w-md relative mt-4 search-portal">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
            </div>
            <input
              autoComplete="off"
              className="w-full bg-surface-container-high text-on-surface border-none rounded-full py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary-container font-body-md placeholder:text-on-surface-variant outline-none"
              placeholder="Ask about stocks, trends, or analysis..."
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onFocus={() => { if (results.length > 0) setDropdown(true) }}
              onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleCTA() }}
            />

            {/* Search Dropdown */}
            {dropdown && query.trim() && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-surface-container-lowest border border-white/5 overflow-hidden shadow-2xl z-20">
                {results.length > 0 ? (
                  <>
                    {results.map(item => (
                      <button key={item.symbol} className="w-full px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors border-b border-white/5 last:border-b-0 text-left"
                        onMouseDown={e => { e.preventDefault(); setQuery(item.symbol); setDropdown(false); startStream(item.symbol); openModal() }}>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary-container text-label-md">{item.symbol}</span>
                          <span className="text-on-surface-variant text-xs">{item.name}</span>
                        </div>
                        <span className="text-xs text-on-surface-variant border border-outline-variant/30 rounded-full px-2.5 py-0.5 bg-surface-container">{item.type}</span>
                      </button>
                    ))}
                    {resultTotal > 5 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                        <span className="text-xs text-on-surface-variant">{(resultPage - 1) * 5 + 1}–{Math.min(resultPage * 5, resultTotal)} of {resultTotal}</span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-fixed transition-all disabled:opacity-30" disabled={resultPage <= 1} onClick={() => onPageChange(resultPage - 1)}>← Prev</button>
                          <button className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-container text-on-surface-variant hover:bg-primary-container/10 hover:text-primary-fixed transition-all disabled:opacity-30" disabled={resultPage * 5 >= resultTotal} onClick={() => onPageChange(resultPage + 1)}>Next →</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : searching ? (
                  <div className="px-4 py-6 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin"></div>
                    <span className="text-label-md text-on-surface-variant">Searching...</span>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl block mb-1">search_off</span>
                    <p className="text-label-md text-on-surface-variant">No results for &quot;{query}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stock Analysis Button */}
          <button className="mt-2 bg-surface-container-high text-on-surface px-6 py-2 rounded-full text-label-md flex items-center gap-2 border border-outline-variant hover:bg-surface-container-highest transition-colors" onClick={handleCTA}>
            <span className="material-symbols-outlined text-primary-container text-lg">monitoring</span>
            Stock Analysis
          </button>
        </section>

        {/* ── Market Trends (2-col grid) ── */}
        <section className="flex flex-col gap-stack-gap">
          <h2 className="text-headline-md font-semibold text-on-surface">Market Trends</h2>
          <div className="grid grid-cols-2 gap-4">
            {!hotLoading && hotStocks.length >= 2 ? (
              hotStocks.slice(0, 2).map((stock, i) => (
                <div key={stock.symbol} className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-2 cursor-pointer hover:bg-surface-container-highest transition-colors"
                  onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}>
                  <div className="flex justify-between items-start">
                    <span className="text-label-md text-on-surface-variant">{stock.symbol}</span>
                    <span className="material-symbols-outlined text-primary-container text-sm">{stock.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                  </div>
                  <div className="text-data-lg font-bold text-on-surface">${fmtPrice(stock.price)}</div>
                  <div className={`text-label-md ${stock.change_percent >= 0 ? 'text-primary-container' : 'text-error'}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-label-md text-on-surface-variant">S&amp;P 500</span>
                    <span className="material-symbols-outlined text-primary-container text-sm">trending_up</span>
                  </div>
                  <div className="text-data-lg font-bold text-on-surface">5,123.41</div>
                  <div className="text-label-md text-primary-container">+1.24%</div>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-label-md text-on-surface-variant">NASDAQ</span>
                    <span className="material-symbols-outlined text-primary-container text-sm">trending_up</span>
                  </div>
                  <div className="text-data-lg font-bold text-on-surface">16,231.85</div>
                  <div className="text-label-md text-primary-container">+1.85%</div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Watchlist / Hot Stocks ── */}
        <section className="flex flex-col gap-stack-gap">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="bg-primary-container/10 text-primary-container px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">YOUR WATCHLIST</span>
            </div>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {!hotLoading && hotStocks.length > 0 ? hotStocks.map((stock, idx) => (
              <div key={stock.symbol}
                className="bg-surface-container rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">{stockIcons[idx % stockIcons.length]}</span>
                  </div>
                  <div>
                    <div className="text-body-lg font-semibold text-on-surface">{stock.symbol}</div>
                    <div className="text-label-md text-on-surface-variant">{stock.name?.split(' ').slice(0, 2).join(' ') || 'Stock'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-data-lg font-bold text-on-surface">${fmtPrice(stock.price)}</div>
                  <div className={`text-label-md ${stock.change_percent >= 0 ? 'text-primary-container' : 'text-error'}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )) : (
              <>
                <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface">devices</span>
                    </div>
                    <div>
                      <div className="text-body-lg font-semibold text-on-surface">AAPL</div>
                      <div className="text-label-md text-on-surface-variant">Apple Inc.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-data-lg font-bold text-on-surface">$173.50</div>
                    <div className="text-label-md text-primary-container">+0.45%</div>
                  </div>
                </div>
                <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface">window</span>
                    </div>
                    <div>
                      <div className="text-body-lg font-semibold text-on-surface">MSFT</div>
                      <div className="text-label-md text-on-surface-variant">Microsoft Corp.</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-data-lg font-bold text-on-surface">$415.10</div>
                    <div className="text-label-md text-primary-container">+1.20%</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Trending Stocks ── */}
        <section className="flex flex-col gap-stack-gap">
          <h2 className="text-headline-md font-semibold text-on-surface">Trending Stocks</h2>
          <div className="flex flex-col gap-3">
            {!hotLoading && hotStocks.length > 2 ? hotStocks.slice(2, 5).map((stock, idx) => (
              <div key={stock.symbol}
                className="bg-surface-container rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer"
                onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">{stockIcons[(idx + 2) % stockIcons.length]}</span>
                  </div>
                  <div>
                    <div className="text-body-lg font-semibold text-on-surface">{stock.symbol}</div>
                    <div className="text-label-md text-on-surface-variant">{stock.sector || stock.name?.split(' ').slice(0, 2).join(' ') || 'Stock'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-data-lg font-bold text-on-surface">${fmtPrice(stock.price)}</div>
                  <div className={`text-label-md ${stock.change_percent >= 0 ? 'text-primary-container' : 'text-error'}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-surface-container rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">memory</span>
                  </div>
                  <div>
                    <div className="text-body-lg font-semibold text-on-surface">NVDA</div>
                    <div className="text-label-md text-on-surface-variant">NVIDIA Corp.</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-data-lg font-bold text-on-surface">$875.28</div>
                  <div className="text-label-md text-primary-container">+4.12%</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Market Insights ── */}
        <section className="flex flex-col gap-stack-gap">
          <h2 className="text-headline-md font-semibold text-on-surface">Market Insights</h2>
          <div className="flex flex-col gap-4">
            {tickerParam && stockData ? (
              <div className="bg-surface-container-high rounded-xl overflow-hidden flex">
                <div className="w-1/3 bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-4xl">analytics</span>
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-center">
                  <h3 className="text-body-md font-semibold mb-1 line-clamp-2">{stockData.name} Analysis</h3>
                  <p className="text-label-md text-on-surface-variant text-xs">AI Diagnosis · {stockData.change_percent >= 0 ? 'Bullish' : 'Bearish'} Outlook</p>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-high rounded-xl overflow-hidden flex">
                <div className="w-1/3 bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-4xl">trending_up</span>
                </div>
                <div className="w-2/3 p-4 flex flex-col justify-center">
                  <h3 className="text-body-md font-semibold mb-1 line-clamp-2">AI-Powered Stock Diagnosis</h3>
                  <p className="text-label-md text-on-surface-variant text-xs">Real-time analysis · Get instant insights</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="py-12 px-container-padding border-t border-white/5 flex flex-col items-center gap-4 text-center">
        <div className="flex gap-6">
          <Link className="text-on-surface-variant hover:text-primary-container transition-colors text-label-md" href="/privacy">Privacy Policy</Link>
          <Link className="text-on-surface-variant hover:text-primary-container transition-colors text-label-md" href="/terms">Terms of Service</Link>
        </div>
        <p className="text-on-surface-variant text-xs opacity-60">
          © 2026 StockAI. All rights reserved.
        </p>
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
