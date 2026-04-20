'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchStockQuote, fetchSearchResults, StockInfo, StockSearchResult, StockSearchResponse } from '../lib/api'

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

  const [searchTerm, setSearchTerm] = useState('')
  const [searchItems, setSearchItems] = useState<StockSearchResult[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searchBusy, setSearchBusy] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [diagQuote, setDiagQuote] = useState<StockInfo | null>(null)
  const [streamText, setStreamText] = useState('')
  const [streamActive, setStreamActive] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [defaultLink, setDefaultLink] = useState('https://wa.me/1234567890')
  const [diagnosticHint, setDiagnosticHint] = useState('')

  const [modalState, setModalState] = useState<'closed' | 'loading' | 'result'>('closed')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)
  const streamAbortRef = useRef<AbortController | null>(null)

  useEffect(() => { if (codeParam) setSearchTerm(codeParam.toUpperCase()) }, [codeParam])

  useEffect(() => {
    fetch('/api/config/public').then(r => r.json()).then(cfg => {
      const items = cfg.settings || []
      const fb = items.find((x: { key: string }) => x.key === 'fallback_redirect_url')
      if (fb?.value) setDefaultLink(fb.value)
      const hint = items.find((x: { key: string }) => x.key === 'diagnostic_placeholder_text')
      if (hint?.value) setDiagnosticHint(hint.value)
    }).catch(() => {})
  }, [])

  // ── Real-time search ──
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

  // ── SSE Analysis ──
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

  // ── Diagnose trigger ──
  const triggerDiagnosis = useCallback((ticker?: string) => {
    if (processingRef.current) return
    processingRef.current = true
    const sym = ticker || searchTerm.trim() || 'AAPL'
    setSearchTerm(sym)
    beginAnalysis(sym)
    setWhatsappLink(null)
    fetch('/api/redirects/assign').then(r => r.ok ? r.json() : null).then(d => d?.url && setWhatsappLink(d.url)).catch(() => {})
    setModalState('loading')
    setTimeout(() => { setModalState('result'); processingRef.current = false }, 2000)
  }, [searchTerm, beginAnalysis])

  const closeModal = useCallback(() => {
    if (streamAbortRef.current) { streamAbortRef.current.abort(); streamAbortRef.current = null }
    setStreamActive(false); setModalState('closed')
  }, [])

  const handleWhatsApp = useCallback(() => {
    const url = whatsappLink || defaultLink
    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
      (window as any).gtag_report_conversion(url)
    } else {
      window.location.href = url
    }
  }, [whatsappLink, defaultLink])

  const activeTicker = searchTerm.trim() || 'AAPL'
  const isBullish = diagQuote ? diagQuote.change >= 0 : true

  return (
    <>
      {/* ── Noise Overlay ── */}
      <div className="noise-overlay fixed inset-0 z-0"></div>

      {/* ══════════ LOADING MODAL ══════════ */}
      <div className={`diag-modal ${modalState === 'loading' ? 'open' : ''}`}>
        <div className="w-full max-w-sm brutalist-border p-8 bg-black flex flex-col items-center gap-6 loading-pulse">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
          <div className="text-center">
            <h3 className="font-headline text-2xl font-black text-primary tracking-tighter uppercase mb-2">SCANNING_MARKET</h3>
            <p className="font-label text-[10px] text-white/60 tracking-widest uppercase">FETCHING DATA... CALIBRATING AI...</p>
          </div>
          <div className="w-full h-1 bg-surface-container overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '30%', animation: 'loading 2s ease-in-out infinite' }}></div>
          </div>
        </div>
      </div>

      {/* ══════════ RESULT MODAL ══════════ */}
      <div className={`diag-modal ${modalState === 'result' ? 'open' : ''}`}>
        <div className="w-full max-w-md brutalist-border bg-black relative overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-on-primary px-4 py-2 flex justify-between items-center">
            <h3 className="font-headline text-sm font-black tracking-widest">DIAGNOSIS_RESULT.EXE</h3>
            <button className="hover:scale-110 transition-transform" onClick={closeModal}>
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Ticker + Signal */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 brutalist-border border-primary flex items-center justify-center shrink-0">
                <span className="font-headline text-2xl font-bold text-primary">{diagQuote?.symbol || activeTicker}</span>
              </div>
              <div>
                <div className={`px-2 py-0.5 border text-[9px] font-bold w-fit mb-1 ${isBullish ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-error/10 border-error/40 text-error'}`}>
                  {isBullish ? 'SIGNAL_ACQUIRED' : 'RISK_DETECTED'}
                </div>
                <h4 className="font-headline text-xl font-bold uppercase tracking-tight">
                  {isBullish ? 'BREAKOUT_CONFIRMED' : 'DISTRIBUTION_PRESSURE'}
                </h4>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-surface-container p-4 border-l-4 border-primary">
              {diagQuote ? (
                <p className="font-body text-sm leading-relaxed text-white/90">
                  {isBullish
                    ? `Historical data indicates strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI recommends maintaining position or scaling on dips below the median trendline.`
                    : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Consider protective positioning.`}
                </p>
              ) : streamText ? (
                <p className="font-body text-sm leading-relaxed text-white/90">{streamText}</p>
              ) : (
                <p className="font-body text-sm leading-relaxed text-white/90">Analyzing market patterns...</p>
              )}
            </div>

            {/* Metrics Grid */}
            {diagQuote && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-white/10 bg-surface-container-low">
                  <span className="block text-[10px] font-label text-white/40 uppercase mb-1">Price</span>
                  <span className="text-primary font-headline text-lg font-bold">${priceStr(diagQuote.price)}</span>
                </div>
                <div className="p-3 border border-white/10 bg-surface-container-low">
                  <span className="block text-[10px] font-label text-white/40 uppercase mb-1">Change</span>
                  <span className={`font-headline text-lg font-bold ${isBullish ? 'text-primary' : 'text-error'}`}>
                    {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 border border-white/10 bg-surface-container-low">
                  <span className="block text-[10px] font-label text-white/40 uppercase mb-1">Valuation</span>
                  <span className="text-secondary font-headline text-lg font-bold">
                    {diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}
                  </span>
                </div>
                <div className="p-3 border border-white/10 bg-surface-container-low">
                  <span className="block text-[10px] font-label text-white/40 uppercase mb-1">Sentiment</span>
                  <span className={`font-headline text-lg font-bold ${isBullish ? 'text-primary' : 'text-error'}`}>
                    {isBullish ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
              </div>
            )}

            {/* Stream text (live) */}
            {streamText && (
              <div>
                <h5 className="font-label text-[10px] text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-tertiary">psychology</span>AI_ANALYSIS_STREAM
                </h5>
                <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{streamText}</div>
                {streamActive && <div className="w-3 h-3 border-2 border-surface-container border-t-primary rounded-full animate-spin mt-2"></div>}
              </div>
            )}

            {/* WhatsApp CTA */}
            <button
              id="whatsapp-cta"
              className="pulse-active w-full bg-[#25D366] text-white p-4 font-headline font-black text-center uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3"
              onClick={handleWhatsApp}
            >
              Get the report for free via WhatsApp
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            </button>
          </div>
          <div className="scan-line !opacity-10"></div>
        </div>
      </div>

      {/* ── TopAppBar ── */}
      <header className="bg-black w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tighter font-headline uppercase">AVANT_ANALYST</h1>
        </div>
        <button className="text-primary active:scale-95 duration-100">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

          {/* ── Compact Hero & Input ── */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col items-start">
              <div className="bg-tertiary-container/10 backdrop-blur-xl px-2 py-1 mb-2 border-l-2 border-tertiary">
                <p className="font-label text-tertiary text-[10px] tracking-widest uppercase">SYS: LIVE</p>
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight">
                RAW_AI <span className="text-primary italic">DIAGNOSIS</span>
              </h2>
            </div>
            <div className="w-full max-w-3xl relative search-box">
              <div className="bg-surface-container-low p-6 brutalist-border flex flex-col md:flex-row items-stretch gap-4">
                <div className="flex-1">
                  <label className="block font-label text-primary/60 text-[10px] uppercase tracking-widest mb-1">INPUT_TICKER</label>
                  <input
                    className="w-full bg-transparent border-0 border-b border-outline focus:border-secondary focus:ring-0 text-3xl md:text-5xl font-headline font-bold text-white placeholder:text-white/10 p-0 uppercase outline-none"
                    placeholder={diagnosticHint || 'AAPL...'}
                    type="text"
                    value={searchTerm}
                    onChange={e => onSearchInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') triggerDiagnosis() }}
                    onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
                  />
                </div>
                <button
                  className="bg-primary text-on-primary px-8 py-4 font-headline font-bold text-lg uppercase tracking-tighter hover:bg-primary-fixed active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => triggerDiagnosis()}
                >
                  DIAGNOSE <span className="material-symbols-outlined text-xl">bolt</span>
                </button>
              </div>

              {/* Search Dropdown */}
              {searchOpen && searchItems.length > 0 && (
                <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-surface-container-lowest brutalist-border overflow-hidden">
                  {searchItems.map(item => (
                    <button
                      key={item.symbol}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left"
                      onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); triggerDiagnosis(item.symbol) }}
                    >
                      <div>
                        <span className="font-label font-bold text-primary">{item.symbol}</span>
                        <span className="text-xs text-on-surface-variant ml-2">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-label">{item.exchange}</span>
                    </button>
                  ))}
                  {searchTotal > 5 && (
                    <div className="flex justify-center gap-2 py-2 border-t border-outline-variant">
                      {Array.from({ length: Math.min(Math.ceil(searchTotal / 5), 5) }, (_, i) => (
                        <button key={i} className={`px-2.5 py-1 text-xs font-label ${searchPage === i + 1 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`} onClick={() => onSearchPage(i + 1)}>{i + 1}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {searchOpen && searchItems.length === 0 && searchBusy && (
                <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-surface-container-lowest brutalist-border p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-surface-container border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs text-on-surface-variant font-label uppercase">Scanning...</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Consolidated Diagnostic Report Area ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Main Verdict Column */}
            <div className="lg:col-span-8 bg-surface-container/60 backdrop-blur-md p-6 brutalist-border border-primary relative overflow-hidden">
              <div className="scan-line"></div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">verified</span>
                <h4 className="font-headline text-xl font-bold uppercase tracking-tighter text-primary">
                  {diagQuote
                    ? `REPORT_SUMMARY: ${isBullish ? 'BULLISH_EXTREME' : 'BEARISH_SIGNAL'}`
                    : 'REPORT_SUMMARY: AWAITING_INPUT'}
                </h4>
              </div>
              <p className="font-body text-lg md:text-xl leading-snug mb-6">
                {diagQuote
                  ? isBullish
                    ? <>Unconventional <span className="text-primary font-bold">accumulation phase</span> detected. {diagQuote.change_percent.toFixed(1)}% momentum aligns with institutional flow patterns. AI confidence high.</>
                    : <>Distribution <span className="text-error font-bold">pressure detected</span> with {Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Protective positioning recommended.</>
                  : <>Enter a stock symbol above and click <span className="text-primary font-bold">DIAGNOSE</span> to begin AI-powered analysis.</>}
              </p>
              {diagQuote && (
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-label font-bold uppercase">
                    CONFIDENCE: {Math.max(70, 100 - Math.abs(diagQuote.change_percent) * 5).toFixed(1)}%
                  </div>
                  <div className="px-3 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-label font-bold uppercase">
                    HORIZON: 14_DAYS
                  </div>
                  <div className={`px-3 py-1 border text-[10px] font-label font-bold uppercase ${Math.abs(diagQuote.change_percent) > 2 ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    RISK: {Math.abs(diagQuote.change_percent) > 2 ? 'HIGH' : 'LOW'}
                  </div>
                </div>
              )}
            </div>

            {/* Side Data Points Column */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Anomaly Alert */}
              <div className={`p-4 flex gap-4 items-start ${diagQuote && !isBullish ? 'bg-error' : 'bg-tertiary'} text-white`}>
                <span className="material-symbols-outlined text-2xl">warning</span>
                <div>
                  <h5 className="font-headline font-extrabold uppercase text-sm">ANOMALY_ALERT</h5>
                  <p className="text-[11px] leading-tight mt-1">
                    {diagQuote
                      ? `${diagQuote.symbol} options delta suggests ${isBullish ? 'momentum continuation' : 'volatility spike'}. Prep for ${isBullish ? 'breakout' : 'friction'}.`
                      : 'Awaiting diagnosis input for anomaly detection.'}
                  </p>
                </div>
              </div>
              {/* Compact Data */}
              {diagQuote && (
                <div className="bg-surface-container-high p-4 border border-white/5 space-y-3">
                  <h5 className="font-headline text-[10px] font-bold uppercase">MARKET_DATA.v7</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-white/40 uppercase block text-[9px]">Mkt Cap</span><span className="font-bold">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</span></div>
                    <div><span className="text-white/40 uppercase block text-[9px]">Volume</span><span className="font-bold">{diagQuote.volume?.toLocaleString() || 'N/A'}</span></div>
                    <div><span className="text-white/40 uppercase block text-[9px]">P/E</span><span className="font-bold">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</span></div>
                    <div><span className="text-white/40 uppercase block text-[9px]">52W High</span><span className="font-bold">{diagQuote.fifty_two_week_high ? `$${priceStr(diagQuote.fifty_two_week_high)}` : 'N/A'}</span></div>
                  </div>
                </div>
              )}
              {/* Placeholder when no data */}
              {!diagQuote && (
                <div className="bg-surface-container-high relative aspect-[16/6] lg:flex-1 overflow-hidden border border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-white/10">monitoring</span>
                    <h5 className="font-headline text-[10px] font-bold uppercase text-white/20 mt-2">LIQUIDITY_MAP.v7</h5>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── CTA Section ── */}
          <section className="bg-primary p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left relative z-10">
              <h2 className="font-headline text-3xl md:text-5xl font-extrabold text-on-primary tracking-tighter leading-none mb-4">
                FULL_TERMINAL_ACCESS
              </h2>
              <p className="font-body text-on-primary/80 text-sm md:text-base">
                Join closed-beta. Direct line to AI operator.
              </p>
            </div>
            <button
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-black text-primary px-8 py-6 font-headline font-black text-xl uppercase tracking-widest hover:bg-surface-container-highest transition-all group shrink-0"
              onClick={handleWhatsApp}
            >
              WHATSAPP
              <span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform">forum</span>
            </button>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[150px]">grid_view</span>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-black border-t border-white/5 px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-primary font-bold font-headline text-sm tracking-tighter uppercase">AVANT_ANALYST_DEPT.</div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="font-headline text-[10px] uppercase tracking-widest text-white/40 hover:text-primary transition-colors" href="/privacy">PRIVACY</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest text-white/40 hover:text-primary transition-colors" href="/terms">TERMS</Link>
          <Link className="font-headline text-[10px] uppercase tracking-widest text-tertiary hover:text-primary font-bold transition-colors" href="/contact">WHATSAPP_CONNECT</Link>
        </div>
        <p className="font-headline text-[9px] uppercase tracking-widest text-white/20">&copy;2026</p>
      </footer>
    </>
  )
}
