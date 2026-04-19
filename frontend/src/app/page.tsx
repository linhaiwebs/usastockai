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

  const [carouselIdx, setCarouselIdx] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)
  const carouselRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const testimonials = [
    { text: '"Sovereign found a risk factor in a mid-cap tech play that my regular brokerage report completely missed."', name: 'Marcus T.', role: 'Portfolio Manager' },
    { text: '"The WhatsApp delivery is genius. I can scan market insights between meetings without complex logins."', name: 'Elena R.', role: 'Private Investor' },
    { text: '"Clean, professional, and brutally honest. The grading system cut through all the analyst hold jargon."', name: 'James L.', role: 'Equity Strategist' },
  ]

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

  // Carousel auto-play
  useEffect(() => {
    carouselRef.current = setInterval(() => setCarouselIdx(i => (i + 1) % testimonials.length), 5000)
    return () => { if (carouselRef.current) clearInterval(carouselRef.current) }
  }, [testimonials.length])

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
    setDiagView('analyzing'); setBarWidth('0%'); setBarLabel('Scanning filings, sentiment, and technicals...'); setWhatsappLink(null)
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

  const triggerDiagnosis = useCallback((ticker?: string) => {
    if (processingRef.current) return
    processingRef.current = true
    const sym = ticker || (codeParam && quoteData ? codeParam : searchTerm.trim() || 'AAPL')
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

      {/* ── Diagnosis Panel (Sovereign Modal Style) ── */}
      <div className={`diag-panel ${diagView !== 'hidden' ? 'open' : ''}`}>
        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={closeDiagPanel}></div>
        <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-[0px_24px_48px_rgba(25,28,30,0.1)] overflow-hidden">

          {diagView === 'analyzing' && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 border-4 border-surface-container-high border-t-tertiary-fixed rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-primary">Synthesizing Alpha...</h3>
              <p className="text-sm text-on-surface-variant mt-1">{barLabel}</p>
              <div className="w-full mt-4 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed transition-all duration-500 ease-out rounded-full" style={{ width: barWidth }}></div>
              </div>
            </div>
          )}

          {diagView === 'report' && (
            <>
              <div className="bg-primary p-6 text-on-primary relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black mb-1">{diagQuote?.symbol || activeTicker}</h2>
                    <p className="text-tertiary-fixed font-semibold tracking-widest text-[10px] uppercase">
                      {diagQuote?.name || 'Stock'} | Diagnosis Complete
                    </p>
                  </div>
                  {diagQuote && (
                    <div className="bg-tertiary-fixed text-on-tertiary-fixed w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg">
                      {diagQuote.change_percent >= 0 ? 'A+' : 'C-'}
                    </div>
                  )}
                </div>
                <button className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors" onClick={closeDiagPanel}>
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <div className="p-6">
                {diagQuote && (
                  <>
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">AI Executive Summary</h4>
                      <p className="text-on-surface text-sm font-medium leading-relaxed">
                        {diagQuote.change >= 0
                          ? `Strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI-integration in the ecosystem provides significant medium-term tailwinds. Valuation justified by cash flow stability.`
                          : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Consider protective positioning.`}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-surface-container-low p-3 rounded-lg text-center">
                        <span className="text-[9px] font-bold text-outline uppercase block mb-1">Valuation</span>
                        <span className="text-primary font-bold text-sm">{diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}</span>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg text-center">
                        <span className="text-[9px] font-bold text-outline uppercase block mb-1">Sentiment</span>
                        <span className="text-tertiary-fixed-dim font-bold text-sm">{diagQuote.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                      </div>
                      <div className="bg-surface-container-low p-3 rounded-lg text-center">
                        <span className="text-[9px] font-bold text-outline uppercase block mb-1">Risk</span>
                        <span className="text-primary font-bold text-sm">{diagQuote.change_percent >= -2 ? 'Low' : 'High'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div><span className="text-[9px] font-bold text-outline uppercase">Price</span><p className="font-bold text-sm">${priceStr(diagQuote.price)}</p></div>
                      <div><span className="text-[9px] font-bold text-outline uppercase">Market Cap</span><p className="font-bold text-sm">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p></div>
                      <div><span className="text-[9px] font-bold text-outline uppercase">Volume</span><p className="font-bold text-sm">{diagQuote.volume?.toLocaleString() || 'N/A'}</p></div>
                      <div><span className="text-[9px] font-bold text-outline uppercase">P/E</span><p className="font-bold text-sm">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</p></div>
                    </div>
                  </>
                )}

                {streamText && (
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">psychology</span>AI Analysis
                    </h4>
                    <div className="text-sm text-on-surface font-medium leading-relaxed whitespace-pre-wrap">{streamText}</div>
                    {streamActive && <div className="w-3 h-3 border-2 border-surface-container-high border-t-tertiary-fixed rounded-full animate-spin mt-2"></div>}
                  </div>
                )}

                <button
                  id="whatsapp-cta"
                  className={`flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-base transition-all shadow-md active:scale-95 w-full ${diagView === 'report' ? 'pulse-active' : 'bg-surface-container-high text-on-surface-variant'}`}
                  onClick={() => {
                    const url = whatsappLink || defaultLink
                    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                      (window as any).gtag_report_conversion(url)
                    } else {
                      window.open(url, '_blank')
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  Get the report for free via WhatsApp
                </button>
                <button className="w-full text-center mt-5 text-xs font-semibold text-outline hover:text-primary transition-colors" onClick={closeDiagPanel}>
                  Close Analysis
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-outline-variant/10">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">insights</span>
            <span className="text-primary font-black tracking-tighter text-xl font-headline">SOVEREIGN</span>
          </div>
          <button className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold active:scale-95 duration-200 hover:opacity-90" onClick={() => triggerDiagnosis()}>
            Analyze Now
          </button>
        </div>
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className="relative pt-10 pb-10 md:pb-16">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <span className="bg-tertiary-fixed/20 text-on-tertiary-fixed-variant px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest mb-4 uppercase">AI-Powered Alpha</span>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary leading-tight mb-4 font-headline">
                Precision Stock Diagnostics for the <span className="text-on-tertiary-container">Sovereign Investor</span>
              </h1>
              <p className="text-base md:text-lg text-on-surface-variant mb-8 max-w-2xl font-body">
                Bypass the noise. Our proprietary AI scans thousands of data points to deliver institutional-grade analysis in seconds.
              </p>
              <div className="w-full max-w-xl relative search-box">
                <div className="bg-surface-container-lowest p-1.5 rounded-full shadow-xl flex items-center gap-2 border border-outline-variant/10">
                  <div className="flex-1 px-4">
                    <input
                      className="w-full bg-transparent border-none focus:ring-0 text-base font-medium text-primary placeholder:text-outline-variant outline-none font-body"
                      placeholder={diagnosticHint || 'Enter Stock Ticker (e.g. AAPL, NVDA)'}
                      type="text"
                      value={searchTerm}
                      onChange={e => onSearchInput(e.target.value)}
                      onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
                    />
                  </div>
                  <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-base hover:bg-primary-container transition-all active:scale-95" onClick={() => triggerDiagnosis()}>
                    Analyze
                  </button>
                </div>
                {searchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden shadow-xl z-[60]">
                    {searchItems.length > 0 ? (
                      <>
                        {searchItems.map(item => (
                          <button key={item.symbol} className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left" onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); triggerDiagnosis(item.symbol) }}>
                            <div className="flex flex-col">
                              <span className="font-headline font-bold text-primary text-sm">{item.symbol}</span>
                              <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                            </div>
                            <span className="font-label text-[10px] text-secondary border border-outline-variant/20 rounded-full px-2 py-0.5">{item.type}</span>
                          </button>
                        ))}
                        {searchTotal > 5 && (
                          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/10">
                            <span className="text-[10px] text-on-surface-variant">{(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}</span>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={searchPage <= 1} onClick={() => onSearchPage(searchPage - 1)}>Prev</button>
                              <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={searchPage * 5 >= searchTotal} onClick={() => onSearchPage(searchPage + 1)}>Next</button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : searchBusy ? (
                      <div className="px-4 py-6 flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-surface-container-high border-t-tertiary-fixed rounded-full animate-spin"></div>
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
              <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
                <span className="text-xs font-semibold text-outline">Trending:</span>
                {(hotFetching || hotList.length === 0 ? ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'] : hotList.slice(0, 5).map(s => s.symbol)).map(sym => (
                  <button key={sym} className="bg-surface-container px-3 py-1.5 rounded-full text-xs font-bold text-primary hover:bg-surface-container-high transition-colors" onClick={() => { setSearchTerm(sym); triggerDiagnosis(sym) }}>{sym}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Grid Insights ── */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm relative overflow-hidden group border border-outline-variant/5">
                <div className="relative z-10">
                  <div className="bg-primary-container text-tertiary-fixed w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-xl">speed</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-headline">Sub-Second Processing</h3>
                  <p className="text-on-surface-variant text-base font-body">While human analysts take weeks to digest quarterly filings, Sovereign AI scans 10-Ks, earnings transcripts, and real-time sentiment in under 800ms.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-48 h-48 -mb-12 -mr-12 bg-tertiary-fixed/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
              </div>
              <div className="bg-primary text-on-primary p-8 rounded-xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-tertiary-fixed text-xl">security</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-headline">Risk Shield™</h3>
                  <p className="opacity-80 text-sm font-body">Identify hidden structural risks and downside exposure before they hit the headlines.</p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary-fixed text-sm">check_circle</span>
                    <span className="text-xs font-medium">99.8% Backtested Accuracy</span>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-t-4 border-tertiary-fixed border-l border-r border-b border-outline-variant/5">
                <span className="material-symbols-outlined text-primary mb-4 block">biotech</span>
                <h3 className="text-xl font-bold mb-2 font-headline">Neural Sentiment</h3>
                <p className="text-on-surface-variant text-sm font-body">We decode the tone of the room. Our AI understands the nuance between cautious optimism and strategic uncertainty.</p>
              </div>
              <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm relative overflow-hidden border border-outline-variant/5">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 font-headline">Global Coverage</h3>
                    <p className="text-on-surface-variant mb-4 text-sm font-body">Access analysis for over 45,000 global equities across 70+ international exchanges. Never miss an opportunity.</p>
                    <div className="flex flex-wrap gap-2">
                      {['NASDAQ', 'NYSE', 'LSE', 'HKEX'].map(ex => (
                        <div key={ex} className="bg-surface-container px-3 py-1 rounded-lg text-[10px] font-bold text-primary">{ex}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight font-headline">Three Steps to Insight</h2>
              <div className="w-12 h-1 bg-tertiary-fixed mx-auto"></div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-8">
              {[
                { n: '1', title: 'Search', desc: 'Enter any stock ticker from any global exchange.' },
                { n: '2', title: 'Scan', desc: 'Our AI cross-references data instantly.' },
                { n: '3', title: 'Receive', desc: 'Get the full Alpha Report via WhatsApp.' },
              ].map((step, i) => (
                <div key={step.n} className="text-center">
                  <div className={`w-8 h-8 md:w-12 md:h-12 ${i === 2 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-primary'} rounded-full flex items-center justify-center mx-auto mb-3 text-sm md:text-lg font-black`}>
                    {step.n}
                  </div>
                  <h4 className="text-[10px] md:text-lg font-bold mb-1 md:mb-2 uppercase tracking-tight md:tracking-wider font-headline">{step.title}</h4>
                  <p className="text-on-surface-variant text-[9px] md:text-sm px-1 md:px-4 leading-tight font-body">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {codeParam && (
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-primary tracking-tight font-headline mb-6">AI Diagnosis Result</h2>
              {quoteFetching ? (
                <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-surface-container-high border-t-tertiary-fixed rounded-full animate-spin"></div></div>
              ) : quoteData ? (
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-t-4 border-tertiary-fixed">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-primary font-headline">{quoteData.symbol}</h3>
                      <p className="text-sm text-on-surface-variant">{quoteData.name}</p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${quoteData.change_percent >= 0 ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                      {quoteData.change_percent >= 0 ? '+' : ''}{quoteData.change_percent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-on-surface text-sm font-medium leading-relaxed font-body">
                    {quoteData.change >= 0
                      ? `Strong fundamental resilience with ${quoteData.change_percent.toFixed(1)}% momentum. Valuation justified by cash flow stability.`
                      : `Distribution pressure detected with ${Math.abs(quoteData.change_percent).toFixed(1)}% decline. Consider protective positioning.`}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* ── Testimonials Carousel ── */}
        <section className="py-16 bg-primary text-on-primary overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative">
              <div className="overflow-hidden">
                <div className="carousel-track" style={{ transform: `translateX(-${carouselIdx * 100}%)` }}>
                  {testimonials.map((t, i) => (
                    <div key={i} className="carousel-item flex justify-center">
                      <div className="max-w-3xl mx-auto text-center space-y-6 px-4">
                        <div className="flex justify-center text-tertiary-fixed">
                          {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                        </div>
                        <p className="text-xl md:text-2xl italic opacity-90 leading-relaxed font-headline">{t.text}</p>
                        <div>
                          <p className="font-bold text-base">{t.name}</p>
                          <p className="text-xs opacity-60 uppercase tracking-widest">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button key={i} className={`w-2 h-2 rounded-full bg-white transition-all ${i === carouselIdx ? 'opacity-100' : 'opacity-30'}`} onClick={() => setCarouselIdx(i)}></button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-low py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-base font-bold text-primary uppercase tracking-tighter font-headline">SOVEREIGN</span>
            <p className="text-on-surface-variant/70 text-[10px] tracking-wide">&copy; 2026 Sovereign Insight. Precision AI Diagnostics.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="text-on-surface-variant/70 hover:text-on-tertiary-container transition-all text-[10px] tracking-wide" href="/privacy">Privacy</Link>
            <Link className="text-on-surface-variant/70 hover:text-on-tertiary-container transition-all text-[10px] tracking-wide" href="/terms">Terms</Link>
            <Link className="text-on-surface-variant/70 hover:text-on-tertiary-container transition-all text-[10px] tracking-wide" href="/contact">Support</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-8">
          <p className="text-[9px] text-outline text-center uppercase tracking-[0.15em] leading-relaxed max-w-3xl mx-auto opacity-70">
            Disclaimer: Sovereign Insight is an AI-driven data tool. Financial markets carry risk. All AI-generated ratings are for informational purposes and do not constitute financial advice. Past performance is not indicative of future results.
          </p>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="scroll-cta">
        <div className="max-w-xl mx-auto">
          <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-full text-base shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" onClick={() => triggerDiagnosis()}>
            <span className="material-symbols-outlined font-bold">auto_awesome</span>
            ANALYZE NOW
          </button>
        </div>
      </div>
    </>
  )
}
