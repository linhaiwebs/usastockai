'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchStockQuote, fetchHotStocks, fetchSearchResults, StockInfo, StockSearchResult, StockSearchResponse } from '../lib/api'

function priceStr(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function LandingPage() {
  return <Suspense><LandingContent /></Suspense>
}

function LandingContent() {
  const processingRef = useRef(false)
  const params = useSearchParams()
  const codeParam = params.get('code') || ''

  const [quoteData, setQuoteData] = useState<StockInfo | null>(null)
  const [quoteFetching, setQuoteFetching] = useState(false)
  const [hotList, setHotList] = useState<StockInfo[]>([])
  const [hotFetching, setHotFetching] = useState(true)
  const [streamText, setStreamText] = useState('')
  const [streamActive, setStreamActive] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [defaultLink, setDefaultLink] = useState('https://wa.me/1234567890')
  const [diagnosticHint, setDiagnosticHint] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [searchItems, setSearchItems] = useState<StockSearchResult[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [diagView, setDiagView] = useState<'hidden' | 'analyzing' | 'report'>('hidden')
  const [diagQuote, setDiagQuote] = useState<StockInfo | null>(null)
  const [barWidth, setBarWidth] = useState('0%')
  const [barLabel, setBarLabel] = useState('')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)

  useEffect(() => { if (codeParam) setSearchTerm(codeParam.toUpperCase()) }, [codeParam])

  useEffect(() => {
    if (!codeParam) { setQuoteData(null); return }
    let cancelled = false
    setQuoteFetching(true)
    fetchStockQuote(codeParam)
      .then(d => { if (!cancelled) { setQuoteData(d); setDiagQuote(d) } })
      .catch(() => { if (!cancelled) { setQuoteData(null); setDiagQuote(null) } })
      .finally(() => { if (!cancelled) setQuoteFetching(false) })
    return () => { cancelled = true }
  }, [codeParam])

  useEffect(() => {
    let cancelled = false
    setHotFetching(true)
    fetchHotStocks()
      .then(d => { if (!cancelled) setHotList(d) })
      .catch(() => { if (!cancelled) setHotList([]) })
      .finally(() => { if (!cancelled) setHotFetching(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    fetch('/api/config/public').then(r => r.json()).then(cfg => {
      const items = cfg.settings || []
      const fb = items.find((x: { key: string }) => x.key === 'fallback_redirect_url')
      if (fb?.value) setDefaultLink(fb.value)
      const hint = items.find((x: { key: string }) => x.key === 'diagnostic_placeholder_text')
      if (hint?.value) setDiagnosticHint(hint.value)
    }).catch(() => {})
  }, [])

  const executeSearch = useCallback((q: string, pg: number = 1) => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    if (searchAbortRef.current) { searchAbortRef.current.abort(); searchAbortRef.current = null }
    if (!q.trim()) { setSearchItems([]); setSearchTotal(0); setSearchOpen(false); return }
    timerRef.current = setTimeout(() => {
      const ctrl = new AbortController()
      searchAbortRef.current = ctrl
      setSearchBusy(true); setSearchPage(pg)
      fetchSearchResults(q, pg, 5).then((d: StockSearchResponse) => {
        if (ctrl.signal.aborted) return
        setSearchItems(d.results || []); setSearchTotal(d.total || 0); setSearchOpen(true)
      }).catch(e => {
        if (e.name !== 'AbortError') { setSearchItems([]); setSearchTotal(0) }
      }).finally(() => { if (!ctrl.signal.aborted) setSearchBusy(false) })
    }, 300)
  }, [])

  const onSearchInput = useCallback((v: string) => { setSearchTerm(v); executeSearch(v, 1) }, [executeSearch])
  const onSearchPage = useCallback((p: number) => { executeSearch(searchTerm, p) }, [executeSearch, searchTerm])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.search-box')) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const beginAnalysis = useCallback((ticker: string) => {
    if (streamAbortRef.current) streamAbortRef.current.abort()
    const ctrl = new AbortController()
    streamAbortRef.current = ctrl
    setStreamActive(true); setStreamText('')
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') (window as any).gtag('event', 'Bdd')
    setDiagQuote(null)
    fetchStockQuote(ticker).then(d => setDiagQuote(d)).catch(() => setDiagQuote(null))
    fetch(`/api/analyze/${encodeURIComponent(ticker)}`, { signal: ctrl.signal })
      .then(async resp => {
        if (!resp.ok) { setStreamActive(false); return }
        const reader = resp.body?.getReader()
        if (!reader) { setStreamActive(false); return }
        const dec = new TextDecoder()
        let buf = '', evtType = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          for (const chunk of dec.decode(value, { stream: true }).split('\n')) {
            if (chunk.startsWith('event: ')) evtType = chunk.slice(7).trim()
            else if (chunk.startsWith('data: ')) {
              if (evtType === 'error') { buf = ''; setStreamText(''); evtType = '' }
              else { buf += chunk.slice(6); setStreamText(buf) }
            }
          }
        }
        setStreamActive(false)
      })
      .catch(e => { if (e.name !== 'AbortError') setStreamActive(false) })
  }, [])

  const openDiagPanel = useCallback(() => {
    const mask = document.getElementById('overlay-mask'); if (mask) mask.classList.add('open')
    setDiagView('analyzing'); setBarWidth('0%'); setBarLabel('Initializing AI diagnosis...'); setWhatsappLink(null)
    fetch('/api/redirects/assign').then(r => r.ok ? r.json() : null).then(d => d?.url && setWhatsappLink(d.url)).catch(() => {})
    const phases = [
      { pct: '25%', msg: 'Scanning Market Data...' },
      { pct: '55%', msg: 'Analyzing Price Patterns...' },
      { pct: '85%', msg: 'Generating Diagnosis Report...' },
      { pct: '100%', msg: 'Diagnosis Complete.' },
    ]
    phases.forEach((phase, idx) => {
      setTimeout(() => {
        setBarWidth(phase.pct); setBarLabel(phase.msg)
        if (idx === phases.length - 1) setTimeout(() => setDiagView('report'), 800)
      }, (idx + 1) * 800)
    })
  }, [])

  const closeDiagPanel = useCallback(() => {
    if (streamAbortRef.current) { streamAbortRef.current.abort(); streamAbortRef.current = null }
    setStreamActive(false); setDiagView('hidden')
    const mask = document.getElementById('overlay-mask'); if (mask) mask.classList.remove('open')
  }, [])

  const triggerDiagnosis = useCallback(() => {
    if (processingRef.current) return
    processingRef.current = true
    const sym = codeParam && quoteData ? codeParam : searchTerm.trim() || 'AAPL'
    beginAnalysis(sym); openDiagPanel(); processingRef.current = false
  }, [openDiagPanel, codeParam, quoteData, searchTerm, beginAnalysis])

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById('scroll-cta')
      if (!el) return
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      el.classList.toggle('shown', pct > 70)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeTicker = codeParam && quoteData ? codeParam : searchTerm.trim() || 'AAPL'

  return (
    <>
      <div className="diag-mask" id="overlay-mask" onClick={closeDiagPanel}></div>

      {/* ── Diagnosis Panel ── */}
      <div className={`diag-panel ${diagView !== 'hidden' ? 'open' : ''}`}>
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl transition-all duration-500" onClick={closeDiagPanel}></div>
        <div className="relative w-full max-w-md glass-surface rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.4)] p-2 transition-all duration-500 overflow-hidden">
          <button className="absolute top-2 right-2 text-on-surface-variant hover:text-primary transition-colors z-20" onClick={closeDiagPanel}>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {diagView === 'analyzing' && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6 p-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-secondary/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-gradient">AI Diagnosis In Progress</h2>
                <div className="text-primary font-headline text-xs uppercase tracking-tighter opacity-80">{barLabel}</div>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-dim to-primary transition-all duration-500 ease-out rounded-full" style={{ width: barWidth }}></div>
              </div>
            </div>
          )}

          {diagView === 'report' && (
            <div className="flex flex-col p-4">
              <div className="w-full mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-headline font-bold text-primary tracking-[0.3em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[10px] font-headline text-secondary">100%</span>
                </div>
                <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full glow-primary"></div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">{diagQuote?.name || activeTicker}</h2>
                {diagQuote ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-headline text-3xl font-bold text-primary">${priceStr(diagQuote.price)}</span>
                    <span className={`text-sm font-headline font-bold px-3 py-1 rounded-full ${diagQuote.change_percent >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                      {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant">Loading price...</span>
                  </div>
                )}
              </div>

              {diagQuote && (
                <div className="glass-surface rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-1">Market Cap</p>
                      <p className="text-on-surface font-bold text-sm">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-1">P/E Ratio</p>
                      <p className="text-on-surface font-bold text-sm">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-1">Volume</p>
                      <p className="text-on-surface font-bold text-sm">{diagQuote.volume?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-1">52W Range</p>
                      <p className="text-on-surface font-bold text-sm">
                        {diagQuote.fifty_two_week_low && diagQuote.fifty_two_week_high
                          ? `$${diagQuote.fifty_two_week_low.toFixed(0)}–$${diagQuote.fifty_two_week_high.toFixed(0)}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-surface rounded-xl p-4 mb-4 border-l-4 border-primary-dim/50">
                <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-2">Market Sentiment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-headline font-bold text-primary">{diagQuote?.change !== undefined && diagQuote.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                  <span className="text-primary/60 font-headline text-xs tracking-tighter">({diagQuote?.change !== undefined && diagQuote.change >= 0 ? 'High' : 'Low'} Confidence)</span>
                </div>
              </div>

              {streamText && (
                <div className="glass-surface rounded-xl p-4 mb-4">
                  <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">psychology</span>AI Analysis
                  </p>
                  <div className="text-sm text-on-surface leading-relaxed font-body whitespace-pre-wrap">{streamText}</div>
                  {streamActive && <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin mt-2"></div>}
                </div>
              )}

              <button
                id="whatsapp-cta"
                className={`w-full font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${diagView === 'report' ? 'pulse-active' : 'bg-surface-container-highest text-on-surface-variant'}`}
                onClick={() => {
                  const url = whatsappLink || defaultLink
                  if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                    (window as any).gtag_report_conversion(url)
                  } else {
                    window.location.href = url
                  }
                }}
              >
                <span className="material-symbols-outlined">chat</span>
                Get the report for free via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between px-6 py-2 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container">analytics</span>
            <span className="font-headline font-extrabold text-2xl tracking-tighter text-primary-container drop-shadow-[0_0_8px_rgba(64,207,255,0.4)]">InsightLedger</span>
          </div>
          <button className="material-symbols-outlined text-primary-container hover:text-white transition-all duration-300 scale-95 active:opacity-80" onClick={() => document.getElementById('search-input')?.focus()}>
            search
          </button>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-6 py-6 flex flex-col gap-6 pt-20">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center justify-center text-center mt-2 gap-3 relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(64,207,255,0.15)_0%,rgba(12,19,33,0)_70%)] pointer-events-none"></div>
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl tracking-tighter leading-tight max-w-4xl text-on-surface">
            Predict with <span className="text-gradient">Clarity</span>
          </h1>
          <p className="font-body text-secondary text-lg md:text-xl max-w-2xl">
            Smarter market insights powered by intuitive data analysis for the modern investor.
          </p>
          <div className="w-full max-w-lg mt-2 search-box">
            <div className="relative flex flex-col gap-3 items-stretch">
              <div className="relative glass-panel rounded-xl border border-outline-variant/20 shadow-lg">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  id="search-input"
                  className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant pl-12 pr-4 py-3 rounded-xl focus:ring-0 font-body text-lg outline-none"
                  placeholder={diagnosticHint || 'Search markets, tickers, or trends...'}
                  type="text"
                  value={searchTerm}
                  onChange={e => onSearchInput(e.target.value)}
                  onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
                />
              </div>
              {searchOpen && (
                <div className="absolute top-full mt-16 w-full bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.4)] z-50">
                  {searchItems.length > 0 ? (
                    <>
                      {searchItems.map(item => (
                        <button key={item.symbol} className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-high transition-colors text-left" onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); beginAnalysis(item.symbol); openDiagPanel() }}>
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-primary text-sm tracking-wide">{item.symbol}</span>
                            <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                          </div>
                          <span className="font-label text-[10px] text-secondary border border-outline-variant/20 rounded-full px-2 py-0.5">{item.type}</span>
                        </button>
                      ))}
                      {searchTotal > 5 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
                          <span className="text-[10px] text-on-surface-variant">{(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={searchPage <= 1} onClick={() => onSearchPage(searchPage - 1)}>Prev</button>
                            <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container-highest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={searchPage * 5 >= searchTotal} onClick={() => onSearchPage(searchPage + 1)}>Next</button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : searchBusy ? (
                    <div className="px-4 py-6 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-xs text-on-surface-variant">Searching...</span>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl block mb-1">search_off</span>
                      <p className="text-xs text-on-surface-variant">No results for &quot;{searchTerm}&quot;</p>
                    </div>
                  )}
                </div>
              )}
              <button className="bg-gradient-primary text-on-primary font-bold rounded-xl px-8 py-3 glow-primary whitespace-nowrap hover:opacity-90 transition-opacity w-full" onClick={triggerDiagnosis}>
                Get Smart Analysis
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats Grid ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center text-center gap-1 border border-outline-variant/20">
            <span className="font-headline font-bold text-4xl text-on-surface">5,000+</span>
            <span className="font-label text-sm text-secondary uppercase tracking-wider">Assets Tracked</span>
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center text-center gap-1 border border-outline-variant/20">
            <span className="font-headline font-bold text-4xl text-on-surface">100+</span>
            <span className="font-label text-sm text-secondary uppercase tracking-wider">Data Streams</span>
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center text-center gap-1 border border-outline-variant/20">
            <span className="font-headline font-bold text-4xl text-on-surface">24/7</span>
            <span className="font-label text-sm text-secondary uppercase tracking-wider">Global Pulse</span>
          </div>
          <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col items-center text-center gap-1 border border-outline-variant/20">
            <span className="font-headline font-bold text-4xl text-primary">99.9%</span>
            <span className="font-label text-sm text-secondary uppercase tracking-wider">Reliability</span>
          </div>
        </section>

        {/* ── Hot Stocks (Sector Intelligence) ── */}
        <section className="flex flex-col gap-4">
          <h2 className="font-headline font-bold text-3xl text-on-surface">Sector Intelligence</h2>
          <div className="flex flex-col gap-3">
            {!hotFetching && hotList.length > 0 ? hotList.slice(0, 4).map(stock => (
              <div
                key={stock.symbol}
                className="bg-surface-container-low hover:bg-surface-container transition-colors p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-outline-variant/20 cursor-pointer"
                onClick={() => { setSearchTerm(stock.symbol); beginAnalysis(stock.symbol); openDiagPanel() }}
              >
                <div className="flex items-center gap-4 w-full md:w-1/4">
                  <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center font-bold text-on-surface">{stock.symbol.slice(0, 1)}</div>
                  <div>
                    <h4 className="font-headline font-bold text-lg text-on-surface">{stock.symbol}</h4>
                    <p className="font-label text-xs text-secondary truncate max-w-[160px]">{stock.name}</p>
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-1/6">
                  <span className="font-body font-semibold text-lg text-on-surface">${priceStr(stock.price)}</span>
                  <span className={`font-label text-xs ${stock.change_percent >= 0 ? 'text-primary' : 'text-tertiary-container'}`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between md:justify-end gap-8 w-full md:w-auto font-label text-xs text-secondary">
                  <div className="flex flex-col"><span className="text-on-surface-variant">Vol</span> {stock.volume?.toLocaleString() || '--'}</div>
                  <div className="flex flex-col"><span className="text-on-surface-variant">Cap</span> {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B` : '--'}</div>
                  <div className="flex flex-col"><span className="text-on-surface-variant">P/E</span> {stock.pe_ratio?.toFixed(1) || '--'}</div>
                </div>
              </div>
            )) : (
              ['SPY', 'QQQ', 'AAPL', 'MSFT'].map(sym => (
                <div key={sym} className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-outline-variant/20 animate-pulse">
                  <div className="flex items-center gap-4 w-full md:w-1/4">
                    <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center font-bold text-on-surface">{sym.slice(0, 1)}</div>
                    <div><h4 className="font-headline font-bold text-lg text-on-surface">{sym}</h4><p className="font-label text-xs text-secondary">Loading...</p></div>
                  </div>
                  <div className="flex flex-col w-full md:w-1/6"><span className="font-body font-semibold text-lg text-on-surface-variant">--</span></div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {codeParam && (
          <section className="flex flex-col gap-3">
            <h2 className="font-headline font-bold text-3xl text-on-surface">AI Diagnosis Result</h2>
            {quoteFetching ? (
              <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
            ) : quoteData ? (
              <div className="flex flex-col gap-3">
                <div className="glass-surface rounded-xl p-4 border-l-4 border-primary-dim/50">
                  <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-2">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-headline font-bold text-primary">{quoteData.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                    <span className="text-primary/60 font-headline text-xs tracking-tighter">({quoteData.change >= 0 ? 'High' : 'Low'} Confidence)</span>
                  </div>
                </div>
                <div className="glass-surface rounded-xl p-4 border-l-4 border-tertiary-container/50">
                  <p className="text-on-surface-variant text-[10px] font-headline uppercase tracking-widest mb-2">AI Recommendation</p>
                  <div className={`${quoteData.change_percent >= 0 ? 'bg-primary/10' : 'bg-error/10'} inline-block px-4 py-1 rounded-full mb-2`}>
                    <span className={`${quoteData.change_percent >= 0 ? 'text-primary' : 'text-error'} font-headline font-bold text-sm uppercase tracking-tighter`}>
                      {quoteData.change_percent >= 0 ? 'Strong Buy' : 'Sell Signal'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-body">
                    AI analysis indicates {quoteData.change >= 0 ? 'a primary support bounce' : 'distribution pressure'} at {priceStr(quoteData.price)} with target {quoteData.change >= 0 ? 'upside' : 'downside'} of {Math.abs(quoteData.change_percent).toFixed(1)}%.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ── Smarter Data Processing ── */}
        <section className="flex flex-col">
          <div className="text-center">
            <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-2">Smarter Data Processing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,0,0,0.4)] hover:bg-surface-container transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Human-Centric Trends</h3>
              <p className="font-body text-secondary text-sm leading-relaxed">We process millions of data points to deliver insights that actually make sense to human investors.</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,0,0,0.4)] hover:bg-surface-container transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Real-time Clarity</h3>
              <p className="font-body text-secondary text-sm leading-relaxed">Instant updates ensure you&apos;re never acting on stale data in fast-moving markets.</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl flex flex-col gap-2 border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,0,0,0.4)] hover:bg-surface-container transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined">filter_list</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Curated Selection</h3>
              <p className="font-body text-secondary text-sm leading-relaxed">Noise is filtered out, leaving only the most relevant, high-impact signals for your strategy.</p>
            </div>
          </div>
        </section>

        {/* ── Information Cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl p-6 flex flex-col justify-end min-h-[240px] relative overflow-hidden group border border-outline-variant/20 bg-surface-container-low">
            <div className="absolute inset-0 bg-surface/80 group-hover:bg-surface/60 transition-colors z-0"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">lock</span>
              <h3 className="font-headline font-bold text-2xl text-on-surface">Enterprise Security</h3>
              <p className="font-body text-secondary text-sm">Bank-grade encryption protecting your proprietary analysis and predictive models.</p>
            </div>
          </div>
          <div className="rounded-3xl p-6 flex flex-col justify-end min-h-[240px] relative overflow-hidden group border border-outline-variant/20 bg-surface-container-low">
            <div className="absolute inset-0 bg-surface/80 group-hover:bg-surface/60 transition-colors z-0"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">integration_instructions</span>
              <h3 className="font-headline font-bold text-2xl text-on-surface">Seamless Integration</h3>
              <p className="font-body text-secondary text-sm">Connect your existing brokerages and data feeds with single-click API authorization.</p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-surface-container rounded-3xl text-center flex flex-col items-center justify-center gap-6 border border-outline-variant/20 shadow-[0_24px_48px_rgba(0,0,0,0.4)] relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(64,207,255,0.05)_0%,transparent_100%)]"></div>
          <h2 className="font-headline font-bold text-4xl md:text-5xl text-on-surface">Ready for Smarter Insights?</h2>
          <button className="bg-gradient-primary text-on-primary font-bold text-lg rounded-full px-10 py-3 glow-primary hover:opacity-90 transition-opacity" onClick={triggerDiagnosis}>
            Start Free Analysis
          </button>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-lowest w-full py-8 mt-12 border-t border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <span className="font-headline font-extrabold text-xl tracking-tighter text-primary">InsightLedger</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-body text-sm text-secondary">
              <Link className="hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
              <Link className="hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="/contact">Contact Us</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant/5 text-center md:text-left">
            <p className="font-body text-xs text-on-surface-variant/60">
              &copy; 2026 InsightLedger. Neural-Powered Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="scroll-cta">
        <div className="max-w-lg mx-auto">
          <button className="w-full bg-gradient-primary text-on-primary font-bold py-4 rounded-2xl text-base glow-primary hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" onClick={triggerDiagnosis}>
            <span className="material-symbols-outlined font-bold">auto_awesome</span>
            RUN AI DIAGNOSIS
          </button>
        </div>
      </div>
    </>
  )
}
