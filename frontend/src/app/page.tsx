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

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.search-box')) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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

  const trendingStocks = hotFetching || hotList.length === 0
    ? [
        { symbol: 'SPY', name: 'S&P 500 ETF', price: 512.45, change_percent: 1.2 },
        { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 445.12, change_percent: 0.8 },
        { symbol: 'AAPL', name: 'Apple Inc', price: 173.50, change_percent: -0.4 },
        { symbol: 'MSFT', name: 'Microsoft Corp', price: 420.69, change_percent: 1.5 },
      ]
    : hotList.slice(0, 4).map(s => ({ symbol: s.symbol, name: s.name, price: s.price, change_percent: s.change_percent }))

  return (
    <>
      <div className="diag-mask" id="overlay-mask" onClick={closeDiagPanel}></div>

      {/* ── Diagnosis Panel (QStock Style) ── */}
      <div className={`diag-panel ${diagView !== 'hidden' ? 'open' : ''}`}>
        <div className="relative w-full max-w-lg">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_24px_48px_rgba(19,27,46,0.12)] border border-outline-variant/15 overflow-hidden">
            <button className="absolute top-4 right-4 z-10 text-on-surface-variant hover:text-on-surface transition-colors" onClick={closeDiagPanel}>
              <span className="material-symbols-outlined">close</span>
            </button>

            {diagView === 'analyzing' && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-on-surface font-headline">Synthesizing Alpha...</h3>
                <p className="text-sm text-on-surface-variant mt-1">{barLabel}</p>
                <div className="w-full mt-4 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-500 ease-out rounded-full" style={{ width: barWidth }}></div>
                </div>
              </div>
            )}

            {diagView === 'report' && (
              <>
                <div className="bg-surface-container-low p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-primary font-headline">{diagQuote?.symbol || activeTicker}</h2>
                      <p className="text-on-surface-variant text-xs mt-1">{diagQuote?.name || 'Stock'} | Diagnosis Complete</p>
                    </div>
                    {diagQuote && (
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-black ${diagQuote.change_percent >= 0 ? 'bg-tertiary-fixed-dim/20 text-tertiary' : 'bg-error-container/50 text-error'}`}>
                        {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {diagQuote && (
                    <>
                      <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-label">AI Executive Summary</h4>
                        <p className="text-on-surface text-sm font-medium leading-relaxed">
                          {diagQuote.change >= 0
                            ? `Strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI-integration in the ecosystem provides significant medium-term tailwinds. Valuation justified by cash flow stability.`
                            : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Consider protective positioning.`}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1 font-label">Valuation</span>
                          <span className="text-on-surface font-bold text-sm">{diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1 font-label">Sentiment</span>
                          <span className={`font-bold text-sm ${diagQuote.change >= 0 ? 'text-tertiary' : 'text-error'}`}>{diagQuote.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1 font-label">Risk</span>
                          <span className="text-on-surface font-bold text-sm">{diagQuote.change_percent >= -2 ? 'Low' : 'High'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase font-label">Price</span><p className="font-bold text-sm">${priceStr(diagQuote.price)}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase font-label">Market Cap</span><p className="font-bold text-sm">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase font-label">Volume</span><p className="font-bold text-sm">{diagQuote.volume?.toLocaleString() || 'N/A'}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase font-label">P/E</span><p className="font-bold text-sm">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</p></div>
                      </div>
                    </>
                  )}

                  {streamText && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1 font-label">
                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>AI Analysis
                      </h4>
                      <div className="text-sm text-on-surface font-medium leading-relaxed whitespace-pre-wrap">{streamText}</div>
                      {streamActive && <div className="w-3 h-3 border-2 border-surface-container-highest border-t-primary rounded-full animate-spin mt-2"></div>}
                    </div>
                  )}

                  <button
                    id="whatsapp-cta"
                    className={`flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 w-full font-label ${diagView === 'report' ? 'pulse-active' : 'bg-surface-container-highest text-on-surface-variant'}`}
                    onClick={() => {
                      const url = whatsappLink || defaultLink
                      if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
                        (window as any).gtag_report_conversion(url)
                      } else {
                        window.location.href = url
                      }
                    }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    Get the report for free via WhatsApp
                  </button>
                  <button className="w-full text-center mt-4 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors" onClick={closeDiagPanel}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <header className="bg-background/70 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full">
        <Link href="/" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="text-xl font-black tracking-tight text-on-surface font-headline">QStock</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-on-primary font-label uppercase">Beta</span>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow flex flex-col pt-6 pb-8 px-6">
        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center text-center space-y-6 mb-8">
          <h1 className="font-headline text-5xl font-black leading-tight tracking-tight text-on-surface">
            Intelligent Stock<br/>Analysis
          </h1>
          <p className="font-body text-base text-on-surface-variant font-light max-w-sm">
            Real-time market data powered by advanced AI algorithms for precise trading decisions.
          </p>
          <div className="flex items-center justify-center gap-4 text-outline-variant py-2">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
            <span className="material-symbols-outlined text-3xl">security</span>
            <span className="material-symbols-outlined text-3xl">monitoring</span>
          </div>
        </section>

        {/* ── Search & Action ── */}
        <section className="mb-8 w-full max-w-md mx-auto">
          <div className="search-box relative">
            <div className="bg-surface-container-low rounded-xl p-2 flex items-center shadow-[0_8px_32px_rgba(19,27,46,0.06)] border border-outline-variant/15 backdrop-blur-md">
              <span className="material-symbols-outlined text-outline ml-3">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-on-surface font-body px-4 outline-none placeholder-on-surface-variant/60"
                placeholder={diagnosticHint || 'Enter stock symbol (e.g. AAPL)'}
                type="text"
                value={searchTerm}
                onChange={e => onSearchInput(e.target.value)}
                onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
                onKeyDown={e => { if (e.key === 'Enter') triggerDiagnosis() }}
              />
            </div>

            {/* Search Dropdown */}
            {searchOpen && searchItems.length > 0 && (
              <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_rgba(19,27,46,0.12)] border border-outline-variant/15 overflow-hidden">
                {searchItems.map(item => (
                  <button
                    key={item.symbol}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
                    onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); triggerDiagnosis(item.symbol) }}
                  >
                    <div>
                      <span className="font-label font-bold text-on-surface">${item.symbol}</span>
                      <span className="text-xs text-on-surface-variant ml-2">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-label">{item.exchange}</span>
                  </button>
                ))}
                {searchTotal > 5 && (
                  <div className="flex justify-center gap-2 py-2 border-t border-outline-variant/15">
                    {Array.from({ length: Math.ceil(searchTotal / 5) }, (_, i) => (
                      <button key={i} className={`px-2.5 py-1 rounded text-xs font-label ${searchPage === i + 1 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`} onClick={() => onSearchPage(i + 1)}>{i + 1}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {searchOpen && searchItems.length === 0 && searchBusy && (
              <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_rgba(19,27,46,0.12)] border border-outline-variant/15 p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-surface-container border-t-primary rounded-full animate-spin"></div>
                  <span className="text-xs text-on-surface-variant">Searching...</span>
                </div>
              </div>
            )}
          </div>
          <button className="w-full mt-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label text-base py-4 rounded-xl shadow-[0_12px_24px_rgba(73,62,229,0.2)] active:scale-95 transition-transform flex items-center justify-center gap-2 font-bold tracking-wide" onClick={() => triggerDiagnosis()}>
            Analyze with AI
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>

        {/* ── Trending Today ── */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">Trending Today</h2>
            <button className="text-primary font-label text-sm font-bold flex items-center gap-1 hover:opacity-80">
              View All <span className="material-symbols-outlined text-xs">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingStocks.map(stock => (
              <div
                key={stock.symbol}
                className="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(19,27,46,0.04)] border border-outline-variant/15 flex flex-col justify-between h-32 relative overflow-hidden group hover:bg-surface-container-low transition-colors cursor-pointer"
                onClick={() => { setSearchTerm(stock.symbol); triggerDiagnosis(stock.symbol) }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-label font-bold text-lg text-on-surface">{stock.symbol}</span>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center font-label ${stock.change_percent >= 0 ? 'bg-tertiary-fixed-dim/20 text-tertiary' : 'bg-error-container/50 text-error'}`}>
                    <span className="material-symbols-outlined text-[10px] mr-0.5">{stock.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="font-headline font-extrabold text-2xl text-on-surface">${priceStr(stock.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {codeParam && quoteData && (
          <section className="mb-8">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(19,27,46,0.04)] border border-outline-variant/15 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-label font-bold text-lg text-on-surface">${quoteData.symbol}</h3>
                  <span className="text-xs text-on-surface-variant">{quoteData.name}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center font-label ${quoteData.change_percent >= 0 ? 'bg-tertiary-fixed-dim/20 text-tertiary' : 'bg-error-container/50 text-error'}`}>
                  <span className="material-symbols-outlined text-[10px] mr-0.5">{quoteData.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                  {quoteData.change_percent >= 0 ? '+' : ''}{quoteData.change_percent.toFixed(1)}%
                </div>
              </div>
              <span className="font-headline font-extrabold text-2xl text-on-surface">${priceStr(quoteData.price)}</span>
              <p className="text-sm text-on-surface-variant mt-3">
                {quoteData.change >= 0
                  ? `Strong fundamental resilience with ${quoteData.change_percent.toFixed(1)}% momentum. Valuation justified by cash flow stability.`
                  : `Distribution pressure detected with ${Math.abs(quoteData.change_percent).toFixed(1)}% decline. Consider protective positioning.`}
              </p>
            </div>
          </section>
        )}

        {/* ── Data Sources (Dark Navy Banner) ── */}
        <section className="bg-on-surface w-full py-8 px-6 mb-8 relative overflow-hidden rounded-2xl -mx-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
          <h3 className="font-label text-xs tracking-[0.2em] uppercase text-center mb-8 font-bold relative z-10 text-white/60">Powered By Trusted Data Sources</h3>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {['NASDAQ', 'NYSE', 'S&P 500', 'YAHOO!'].map(src => (
              <div key={src} className="bg-surface/5 border border-surface/10 rounded-lg p-4 flex items-center justify-center backdrop-blur-sm h-16">
                <span className="font-headline font-bold text-white text-sm tracking-widest">{src}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features List ── */}
        <section className="mb-8">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-8 tracking-tight">Why choose our platform</h2>
          <ul className="space-y-6">
            {[
              { icon: 'bolt', title: 'Real-time Data', desc: 'Sub-millisecond latency on market updates ensuring you never miss a tick.' },
              { icon: 'psychology', title: 'AI Analysis', desc: 'Predictive modeling trained on decades of market behavior.' },
              { icon: 'monitoring', title: 'Technical Charts', desc: 'Advanced plotting tools with customizable indicators.' },
              { icon: 'shield', title: 'Risk Metrics', desc: 'Comprehensive exposure analysis and portfolio stress testing.' },
            ].map(feat => (
              <li key={feat.icon} className="flex items-start gap-4">
                <div className="mt-1 bg-primary/10 p-2 rounded-full flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">{feat.icon}</span>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface text-base mb-1">{feat.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant font-light leading-relaxed">{feat.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mb-8 w-full max-w-md mx-auto">
          <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label text-base py-5 rounded-xl shadow-[0_16px_32px_rgba(73,62,229,0.25)] active:scale-95 transition-transform flex items-center justify-center gap-2 font-bold tracking-wide" onClick={() => triggerDiagnosis()}>
            Connect with AI Agent
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#131B2E] text-white w-full flex flex-col items-center gap-6 text-center p-12">
        <div className="font-headline font-black text-white text-xl tracking-tight mb-2">QStock</div>
        <p className="text-slate-400 text-xs font-light">&copy; 2026 QStock. Precision in Every Pulse.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="text-slate-500 hover:text-primary-container transition-colors text-xs" href="/privacy">Privacy Policy</Link>
          <Link className="text-slate-500 hover:text-primary-container transition-colors text-xs" href="/terms">Terms of Service</Link>
          <Link className="text-slate-500 hover:text-primary-container transition-colors text-xs" href="/contact">Contact</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="scroll-cta">
        <div className="max-w-md mx-auto">
          <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label font-bold py-4 rounded-xl text-base shadow-[0_16px_32px_rgba(73,62,229,0.3)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" onClick={() => triggerDiagnosis()}>
            <span className="material-symbols-outlined">radar</span>
            ANALYZE NOW
          </button>
        </div>
      </div>
    </>
  )
}
