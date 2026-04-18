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

  return (
    <>
      <div className="diag-mask" id="overlay-mask" onClick={closeDiagPanel}></div>

      {/* ── Diagnosis Panel (MarketPulse Style) ── */}
      <div className={`diag-panel ${diagView !== 'hidden' ? 'open' : ''}`}>
        <div className="relative w-full max-w-lg">
          <div className="bg-surface-container-high rounded-2xl border border-outline-variant/15 overflow-hidden shadow-2xl">
            <button className="absolute top-4 right-4 z-10 text-on-surface-variant hover:text-on-surface transition-colors" onClick={closeDiagPanel}>
              <span className="material-symbols-outlined">close</span>
            </button>

            {diagView === 'analyzing' && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-on-surface font-headline">Synthesizing Alpha...</h3>
                <p className="text-sm text-on-surface-variant mt-1">{barLabel}</p>
                <div className="w-full mt-4 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500 ease-out rounded-full" style={{ width: barWidth }}></div>
                </div>
              </div>
            )}

            {diagView === 'report' && (
              <>
                <div className="bg-surface-container-highest p-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black text-primary font-headline">{diagQuote?.symbol || activeTicker}</h2>
                      <p className="text-on-surface-variant text-xs mt-1">{diagQuote?.name || 'Stock'} | Diagnosis Complete</p>
                    </div>
                    {diagQuote && (
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-black ${diagQuote.change_percent >= 0 ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {diagQuote && (
                    <>
                      <div className="mb-6">
                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">AI Executive Summary</h4>
                        <p className="text-on-surface text-sm font-medium leading-relaxed">
                          {diagQuote.change >= 0
                            ? `Strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI-integration in the ecosystem provides significant medium-term tailwinds. Valuation justified by cash flow stability.`
                            : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Consider protective positioning.`}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1">Valuation</span>
                          <span className="text-on-surface font-bold text-sm">{diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1">Sentiment</span>
                          <span className={`font-bold text-sm ${diagQuote.change >= 0 ? 'text-primary' : 'text-error'}`}>{diagQuote.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                        </div>
                        <div className="bg-surface-container p-3 rounded-lg text-center">
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase block mb-1">Risk</span>
                          <span className="text-on-surface font-bold text-sm">{diagQuote.change_percent >= -2 ? 'Low' : 'High'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase">Price</span><p className="font-bold text-sm">${priceStr(diagQuote.price)}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase">Market Cap</span><p className="font-bold text-sm">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase">Volume</span><p className="font-bold text-sm">{diagQuote.volume?.toLocaleString() || 'N/A'}</p></div>
                        <div><span className="text-[9px] font-bold text-on-surface-variant uppercase">P/E</span><p className="font-bold text-sm">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</p></div>
                      </div>
                    </>
                  )}

                  {streamText && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>AI Analysis
                      </h4>
                      <div className="text-sm text-on-surface font-medium leading-relaxed whitespace-pre-wrap">{streamText}</div>
                      {streamActive && <div className="w-3 h-3 border-2 border-surface-container-highest border-t-primary rounded-full animate-spin mt-2"></div>}
                    </div>
                  )}

                  <button
                    id="whatsapp-cta"
                    className={`flex items-center justify-center gap-3 py-3.5 rounded-full font-bold text-base transition-all active:scale-95 w-full ${diagView === 'report' ? 'pulse-active' : 'bg-surface-container-highest text-on-surface-variant'}`}
                    onClick={() => {
                      const url = whatsappLink || defaultLink
                      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') (window as any).gtag('event', 'conversion')
                      window.open(url, '_blank')
                    }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    Get the report for free via WhatsApp
                  </button>
                  <button className="w-full text-center mt-4 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors" onClick={closeDiagPanel}>
                    Close Analysis
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <header className="bg-background/70 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <span className="text-xl font-black text-primary uppercase tracking-tighter font-headline">MarketPulse AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-primary text-on-primary px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wide">Beta</span>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 pt-6 pb-6">
        {/* ── Hero ── */}
        <section className="text-center max-w-3xl mx-auto mb-4">
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight mb-2 leading-tight">
            What&apos;s the news saying about your stock?
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl font-medium">
            AI scans 10,000+ articles and posts — in real time
          </p>
        </section>

        {/* ── Search Section ── */}
        <section className="max-w-2xl mx-auto mb-4">
          <div className="flex flex-col gap-2">
            <div className="relative search-box">
              <div className="flex items-center bg-surface-container-highest rounded-full p-4 border border-outline-variant/15 focus-within:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant ml-2 mr-2">search</span>
                <input
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder-on-surface-variant text-lg outline-none font-body"
                  placeholder={diagnosticHint || 'Enter ticker (e.g. AAPL)'}
                  type="text"
                  value={searchTerm}
                  onChange={e => onSearchInput(e.target.value)}
                  onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
                />
              </div>
              {searchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-outline-variant/15 rounded-xl overflow-hidden shadow-xl z-[60]">
                  {searchItems.length > 0 ? (
                    <>
                      {searchItems.map(item => (
                        <button key={item.symbol} className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container transition-colors text-left" onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); triggerDiagnosis(item.symbol) }}>
                          <div className="flex flex-col">
                            <span className="font-headline font-bold text-on-surface text-sm">${item.symbol}</span>
                            <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant border border-outline-variant/20 rounded-full px-2 py-0.5">{item.type}</span>
                        </button>
                      ))}
                      {searchTotal > 5 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/15">
                          <span className="text-[10px] text-on-surface-variant">{(searchPage - 1) * 5 + 1}–{Math.min(searchPage * 5, searchTotal)} of {searchTotal}</span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container text-on-surface-variant hover:text-primary transition-all disabled:opacity-30" disabled={searchPage <= 1} onClick={() => onSearchPage(searchPage - 1)}>Prev</button>
                            <button className="px-3 py-1 rounded-full text-[10px] font-medium bg-surface-container text-on-surface-variant hover:text-primary transition-all disabled:opacity-30" disabled={searchPage * 5 >= searchTotal} onClick={() => onSearchPage(searchPage + 1)}>Next</button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : searchBusy ? (
                    <div className="px-4 py-6 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-surface-container border-t-primary rounded-full animate-spin"></div>
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
            <button className="w-full bg-gradient-to-br from-error-container to-error text-on-error-container px-8 py-4 rounded-full font-bold uppercase tracking-wide hover:opacity-90 transition-opacity" onClick={() => triggerDiagnosis()}>
              Scan Now
            </button>
          </div>
          <div className="flex justify-center gap-3 mt-3">
            {(hotFetching || hotList.length === 0 ? ['GME', 'AMC', 'TSLA', 'BBBY'] : hotList.slice(0, 4).map(s => s.symbol)).map(sym => (
              <button key={sym} className="bg-surface-variant px-4 py-2 rounded-md text-primary font-medium hover:bg-surface-bright transition-colors text-sm" onClick={() => { setSearchTerm(sym); triggerDiagnosis(sym) }}>
                ${sym}
              </button>
            ))}
          </div>
        </section>

        {/* ── Hot Stocks Carousel ── */}
        <section className="mb-4">
          <h3 className="font-headline text-sm text-on-surface-variant uppercase tracking-widest mb-2">Hot Stocks</h3>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar">
            {(hotFetching || hotList.length === 0
              ? [
                  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 822.43, change_percent: 4.2 },
                  { symbol: 'AAPL', name: 'Apple Inc', price: 173.50, change_percent: -1.1 },
                  { symbol: 'TSLA', name: 'Tesla Inc', price: 202.64, change_percent: 2.8 },
                  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 180.49, change_percent: 5.6 },
                  { symbol: 'MSFT', name: 'Microsoft Corp', price: 402.18, change_percent: 0.9 },
                ]
              : hotList.slice(0, 8).map(s => ({ symbol: s.symbol, name: s.name, price: s.price, change_percent: s.change_percent }))
            ).map(stock => (
              <div key={stock.symbol} className="snap-center shrink-0 w-64 bg-surface-container-highest rounded-xl p-6 border border-outline-variant/15 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { setSearchTerm(stock.symbol); triggerDiagnosis(stock.symbol) }}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-lg text-on-surface">${stock.symbol}</span>
                    <span className="text-xs text-on-surface-variant">{stock.name}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${stock.change_percent >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                    <span className="material-symbols-outlined text-[16px]">{stock.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                    <span className="text-xs font-bold">{stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(1)}%</span>
                  </div>
                </div>
                <div>
                  <span className="font-headline text-2xl font-bold text-on-surface">${priceStr(stock.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stock Data Module (code param) ── */}
        {codeParam && quoteData && (
          <section className="mb-4">
            <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/15">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">${quoteData.symbol}</h3>
                  <span className="text-xs text-on-surface-variant">{quoteData.name}</span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${quoteData.change_percent >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
                  <span className="material-symbols-outlined text-[16px]">{quoteData.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                  <span className="text-xs font-bold">{quoteData.change_percent >= 0 ? '+' : ''}{quoteData.change_percent.toFixed(1)}%</span>
                </div>
              </div>
              <span className="font-headline text-2xl font-bold text-on-surface">${priceStr(quoteData.price)}</span>
              <p className="text-sm text-on-surface-variant mt-3">
                {quoteData.change >= 0
                  ? `Strong fundamental resilience with ${quoteData.change_percent.toFixed(1)}% momentum. Valuation justified by cash flow stability.`
                  : `Distribution pressure detected with ${Math.abs(quoteData.change_percent).toFixed(1)}% decline. Consider protective positioning.`}
              </p>
            </div>
          </section>
        )}

        {/* ── Trusted Sources ── */}
        <section className="border-t border-outline-variant/15 pt-4 text-center">
          <h3 className="text-sm text-on-surface-variant uppercase tracking-widest mb-4">Scanning Top Tier Sources</h3>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
            {['Reuters', 'Bloomberg', 'CNBC', 'Benzinga'].map(src => (
              <div key={src} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                <span className="font-headline font-bold text-lg">{src}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-background py-4 flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-screen-2xl mx-auto gap-4">
        <div className="text-lg font-bold text-primary font-headline">MarketPulse AI</div>
        <div className="text-sm text-on-surface-variant">&copy; 2026 MarketPulse AI. Editorial-grade market insights.</div>
        <div className="flex gap-6">
          <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="scroll-cta">
        <div className="max-w-2xl mx-auto">
          <button className="w-full bg-gradient-to-br from-error-container to-error text-on-error-container font-bold py-4 rounded-full text-base uppercase tracking-wide shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2" onClick={() => triggerDiagnosis()}>
            <span className="material-symbols-outlined">radar</span>
            SCAN NOW
          </button>
        </div>
      </div>
    </>
  )
}
