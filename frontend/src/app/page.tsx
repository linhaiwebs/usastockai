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
        <div className="relative w-full max-w-md glass-surface rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 transition-all duration-500 overflow-hidden">
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
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-dim to-secondary transition-all duration-500 ease-out rounded-full" style={{ width: barWidth }}></div>
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
                  <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(163,166,255,0.6)]"></div>
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
                  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') (window as any).gtag('event', 'conversion')
                  window.open(url, '_blank')
                }}
              >
                <span className="material-symbols-outlined">chat</span>
                Get the report for free via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Top App Bar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#0B0E14]/80 backdrop-blur-md border-b border-[#A3A6FF]/15 shadow-[0_32px_64px_-4px_rgba(163,166,255,0.05)] flex justify-between items-center px-6 h-16 max-w-md mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-dim to-secondary tracking-tight">Luminescent Ledger</span>
        </div>
        <button className="hover:bg-primary-dim/10 transition-colors p-2 rounded-full active:scale-95 duration-300 ease-in-out text-primary-dim">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-md mt-16 px-6 py-8 flex flex-col gap-10">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center text-center gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-dim to-secondary pb-1">
              AI-Powered<br />Stock Diagnosis
            </h1>
            <p className="text-sm font-medium text-on-surface-variant tracking-wide mt-2">
              Real-time Quotes · Intelligent Analysis · Investment Decisions
            </p>
          </div>

          {/* ── Search ── */}
          <div className="w-full relative mt-2 group search-box">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input
              className="w-full bg-surface-container-high/40 backdrop-blur-xl border border-outline-variant/15 rounded-full py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-dim focus:border-primary-dim transition-all shadow-[0_0_32px_-4px_rgba(163,166,255,0.05)]"
              placeholder={diagnosticHint || 'Enter stock symbol (e.g., AAPL, TSLA)'}
              type="text"
              value={searchTerm}
              onChange={e => onSearchInput(e.target.value)}
              onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
            />
            {searchOpen && (
              <div className="absolute top-full mt-2 w-full bg-surface-container border border-outline-variant/15 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-50">
                {searchItems.length > 0 ? (
                  <>
                    {searchItems.map(item => (
                      <button key={item.symbol} className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-highest transition-colors text-left" onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); beginAnalysis(item.symbol); openDiagPanel() }}>
                        <div className="flex flex-col">
                          <span className="font-headline font-bold text-primary text-sm tracking-wide">{item.symbol}</span>
                          <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                        </div>
                        <span className="font-label text-[10px] text-secondary border border-outline-variant/15 rounded-full px-2 py-0.5">{item.type}</span>
                      </button>
                    ))}
                    {searchTotal > 5 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15">
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
          </div>

          <button className="w-full mt-2 bg-gradient-to-r from-primary-dim to-secondary text-on-primary-fixed font-bold py-4 rounded-xl shadow-[0_0_32px_-4px_rgba(163,166,255,0.2)] hover:shadow-[0_0_40px_0px_rgba(163,166,255,0.3)] hover:saturate-150 transition-all active:scale-95 text-sm uppercase tracking-wide" onClick={triggerDiagnosis}>
            Start AI Diagnosis
          </button>
        </section>

        {/* ── Hot Stocks ── */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold flex items-center gap-2"><span className="text-error">🔥</span> Hot Stocks</h2>
            <span className="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-full border border-outline-variant/15 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> Auto-rotating
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {!hotFetching && hotList.length > 0 ? hotList.slice(0, 4).map(stock => (
              <div key={stock.symbol} className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-4 flex flex-col gap-2 hover:bg-surface-container-low transition-colors group relative overflow-hidden cursor-pointer" onClick={() => { setSearchTerm(stock.symbol); beginAnalysis(stock.symbol); openDiagPanel() }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-base tracking-tight text-primary">{stock.symbol}</span>
                  <span className={`text-xs material-symbols-outlined ${stock.change_percent >= 0 ? 'text-primary' : 'text-error'}`}>{stock.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">${priceStr(stock.price)}</span>
                  <span className={`text-xs font-medium ${stock.change_percent >= 0 ? 'text-primary' : 'text-error'}`}>{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                </div>
              </div>
            )) : ['SPY', 'QQQ', 'AAPL', 'MSFT'].map(sym => (
              <div key={sym} className="bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-4 flex flex-col gap-2 animate-pulse">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-base tracking-tight text-primary">{sym}</span>
                  <span className="text-primary text-xs material-symbols-outlined">trending_up</span>
                </div>
                <div className="flex items-baseline gap-2"><span className="text-xl font-bold text-on-surface-variant">--</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {codeParam && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
              <h2 className="text-lg font-bold">AI Diagnosis Result</h2>
            </div>
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
                <div className="glass-surface rounded-xl p-4 border-l-4 border-secondary/50">
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

        {/* ── Data Sources ── */}
        <section className="flex flex-col gap-3 items-center">
          <h3 className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Data Sources</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['Nasdaq', 'NYSE', 'S&P 500', 'Dow Jones', 'Yahoo Finance'].map(src => (
              <span key={src} className="px-4 py-1.5 text-xs text-on-surface-variant border border-outline-variant/20 rounded-full bg-surface-container-lowest">{src}</span>
            ))}
          </div>
        </section>

        {/* ── Core Features ── */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-1"><span className="text-secondary">✨</span> Core Features</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 shadow-[0_16px_32px_-4px_rgba(163,166,255,0.02)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-dim/20 to-secondary/20 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary">speed</span>
              </div>
              <div><h4 className="font-bold text-sm text-on-surface mb-1">Real-time Quotes</h4><p className="text-xs text-on-surface-variant leading-relaxed">Millisecond latency, global stock market data</p></div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 shadow-[0_16px_32px_-4px_rgba(163,166,255,0.02)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-tertiary/20 flex items-center justify-center border border-secondary/20">
                <span className="material-symbols-outlined text-secondary">psychology</span>
              </div>
              <div><h4 className="font-bold text-sm text-on-surface mb-1">AI Analysis</h4><p className="text-xs text-on-surface-variant leading-relaxed">Advanced reasoning model, professional investment advice</p></div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 shadow-[0_16px_32px_-4px_rgba(163,166,255,0.02)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-dim/20 to-primary/20 flex items-center justify-center border border-primary-dim/20">
                <span className="material-symbols-outlined text-primary-dim">monitoring</span>
              </div>
              <div><h4 className="font-bold text-sm text-on-surface mb-1">Technical Indicators</h4><p className="text-xs text-on-surface-variant leading-relaxed">MACD, RSI, Bollinger Bands and more</p></div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 shadow-[0_16px_32px_-4px_rgba(163,166,255,0.02)] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-error/20 to-tertiary/20 flex items-center justify-center border border-error/20">
                <span className="material-symbols-outlined text-error">gpp_maybe</span>
              </div>
              <div><h4 className="font-bold text-sm text-on-surface mb-1">Risk Assessment</h4><p className="text-xs text-on-surface-variant leading-relaxed">Smart risk control, investment risk evaluation</p></div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mt-4 flex flex-col items-center gap-3">
          <button className="w-full bg-gradient-to-r from-primary-dim to-secondary text-on-primary-fixed font-bold py-5 rounded-2xl shadow-[0_0_40px_-10px_rgba(163,166,255,0.3)] hover:shadow-[0_0_50px_0px_rgba(163,166,255,0.4)] hover:saturate-150 transition-all active:scale-95 text-lg flex items-center justify-center gap-2" onClick={triggerDiagnosis}>
            Start Analysis <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
          <p className="text-xs text-on-surface-variant font-medium">Start your intelligent investment journey</p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-8 px-6 border-t border-outline-variant/15 flex flex-col items-center gap-2 text-center text-xs text-outline max-w-md mx-auto">
        <p>&copy; 2026 Stock AI Diagnostic System</p>
        <p>For learning and reference only, not investment advice</p>
        <div className="flex gap-2 mt-1">
          <Link className="hover:text-on-surface transition-colors" href="/privacy">Privacy Policy</Link>
          <span>·</span>
          <Link className="hover:text-on-surface transition-colors" href="/terms">Terms of Use</Link>
          <span>·</span>
          <Link className="hover:text-on-surface transition-colors" href="/contact">Contact Us</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="scroll-cta">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-gradient-to-r from-primary-dim to-secondary text-on-primary-fixed font-bold py-4 rounded-2xl text-base shadow-[0_0_30px_rgba(163,166,255,0.2)] hover:shadow-[0_0_40px_rgba(163,166,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2" onClick={triggerDiagnosis}>
            <span className="material-symbols-outlined font-bold">auto_awesome</span>
            RUN AI DIAGNOSIS
          </button>
        </div>
      </div>
    </>
  )
}
