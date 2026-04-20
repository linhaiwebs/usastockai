'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchStockQuote, fetchSearchResults, fetchHotStocks, StockInfo, StockSearchResult, StockSearchResponse } from '../lib/api'

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

  const [hotList, setHotList] = useState<StockInfo[]>([])
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
    let cancelled = false
    fetchHotStocks().then(d => { if (!cancelled) setHotList(d.slice(0, 4)) }).catch(() => {}).finally(() => {})
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

  // ── Close search on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.search-box')) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Real-time search ──
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

  const activeTicker = diagQuote?.symbol || searchTerm.trim() || 'AAPL'
  const isBullish = diagQuote ? diagQuote.change >= 0 : true

  return (
    <>
      {/* ══════════ LOADING MODAL ══════════ */}
      <div className={`diag-modal ${modalState === 'loading' ? 'open' : ''}`}>
        <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-base mb-1">Scanning Market...</h3>
            <p className="text-xs text-gray-500">Fetching data &amp; calibrating AI</p>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400 rounded-full" style={{ width: '40%', animation: 'loading 1.5s ease-in-out infinite' }}></div>
          </div>
        </div>
      </div>

      {/* ══════════ RESULT MODAL ══════════ */}
      <div className={`diag-modal ${modalState === 'result' ? 'open' : ''}`}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-pink-400 text-white px-4 py-2.5 flex justify-between items-center">
            <h3 className="font-bold text-sm">Diagnosis Result</h3>
            <button className="hover:scale-110 transition-transform" onClick={closeModal}>
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Ticker + Signal */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center shrink-0">
                <span className="font-bold text-pink-500 text-lg">{activeTicker}</span>
              </div>
              <div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mb-1 ${isBullish ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {isBullish ? 'SIGNAL ACQUIRED' : 'RISK DETECTED'}
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{isBullish ? 'Breakout Confirmed' : 'Distribution Pressure'}</h4>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-pink-400">
              {diagQuote ? (
                <p className="text-xs text-gray-700 leading-relaxed">
                  {isBullish
                    ? `Strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI recommends maintaining position or scaling on dips.`
                    : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Consider protective positioning.`}
                </p>
              ) : streamText ? (
                <p className="text-xs text-gray-700 leading-relaxed">{streamText}</p>
              ) : (
                <p className="text-xs text-gray-500">Analyzing market patterns...</p>
              )}
            </div>

            {/* Metrics Grid */}
            {diagQuote && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="block text-[10px] text-gray-500 mb-0.5">Price</span>
                  <span className="font-bold text-gray-900 text-sm">${priceStr(diagQuote.price)}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="block text-[10px] text-gray-500 mb-0.5">Change</span>
                  <span className={`font-bold text-sm ${isBullish ? 'text-green-600' : 'text-red-600'}`}>
                    {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="block text-[10px] text-gray-500 mb-0.5">Valuation</span>
                  <span className="font-bold text-gray-900 text-sm">{diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <span className="block text-[10px] text-gray-500 mb-0.5">Sentiment</span>
                  <span className={`font-bold text-sm ${isBullish ? 'text-green-600' : 'text-red-600'}`}>{isBullish ? 'Bullish' : 'Bearish'}</span>
                </div>
              </div>
            )}

            {/* Stream text */}
            {streamText && (
              <div>
                <p className="text-[10px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-pink-500">psychology</span>AI Analysis
                </p>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{streamText}</div>
                {streamActive && <div className="w-3 h-3 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin mt-1.5"></div>}
              </div>
            )}

            {/* WhatsApp CTA */}
            <button
              id="whatsapp-cta"
              className="pulse-active w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              onClick={handleWhatsApp}
            >
              Get the report for free via WhatsApp
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ HERO SECTION ══════════ */}
      <header className="bg-gradient-hero px-3 pt-8 pb-6 text-center relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-1 h-32 bg-red-400 rounded-full"></div>
          <div className="absolute top-20 right-10 w-1 h-24 bg-green-400 rounded-full"></div>
          <div className="absolute top-40 left-20 w-1 h-16 bg-red-300 rounded-full"></div>
        </div>
        <div className="relative z-10 max-w-sm mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3 text-gray-900">
            Stop <br /> guessing. <br />
            <span className="text-pink-500">AI-powered <br /> stock <br /> diagnosis in <br /> seconds.</span>
          </h1>
          <p className="text-gray-600 text-xs mb-4 leading-relaxed">
            Real-time market insights powered by advanced AI. Make smarter investment decisions with confidence.
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-5 text-[10px] text-gray-700">
            {['10,000+ investors', 'Real-time NASDAQ', 'AI-powered'].map(tag => (
              <span key={tag} className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-red-500 text-[10px] mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {tag}
              </span>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative mb-3 search-box">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-base">search</span>
            </div>
            <input
              className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs shadow-sm"
              placeholder={diagnosticHint || 'Search any stock symbol (AAPL, TSLA...)'}
              type="text"
              value={searchTerm}
              onChange={e => onSearchInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') triggerDiagnosis() }}
              onFocus={() => { if (searchItems.length > 0) setSearchOpen(true) }}
            />
            {/* Search Dropdown */}
            {searchOpen && searchItems.length > 0 && (
              <div className="absolute z-[60] left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
                {searchItems.map(item => (
                  <button key={item.symbol} className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left" onClick={() => { setSearchTerm(item.symbol); setSearchOpen(false); triggerDiagnosis(item.symbol) }}>
                    <div>
                      <span className="font-bold text-xs text-pink-500">{item.symbol}</span>
                      <span className="text-[11px] text-gray-600 ml-2">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{item.exchange}</span>
                  </button>
                ))}
              </div>
            )}
            {searchOpen && searchItems.length === 0 && searchBusy && (
              <div className="absolute z-[60] left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-soft border border-gray-200 p-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] text-gray-500">Scanning...</span>
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition duration-150 ease-in-out text-sm mb-2" onClick={() => triggerDiagnosis()}>
            Diagnose with AI
          </button>
          <p className="text-[10px] text-gray-400 mt-1">For informational purposes only. Not financial advice.</p>
        </div>
      </header>

      <main>
        {/* ══════════ INFO CARDS ══════════ */}
        <section className="px-3 py-4">
          <div className="max-w-sm mx-auto space-y-3">
            {/* Free Diagnosis Card */}
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-tight">Free diagnosis — no credit card required</h3>
              <p className="text-xs text-gray-600 mb-3">Start analyzing stocks today with our AI-powered tools</p>
              <div className="bg-gray-50 rounded-xl p-2.5 flex items-center">
                <div className="bg-red-50 p-1.5 rounded-full mr-2.5">
                  <span className="material-symbols-outlined text-red-500 text-sm">bolt</span>
                </div>
                <div className="text-xs font-medium text-gray-800">
                  Today&apos;s free analysis remaining: <span className="text-red-500 font-bold">3</span>
                </div>
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[120px]">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10"></div>
              <div className="relative z-20 flex flex-col items-center">
                <span className="material-symbols-outlined text-gray-700 text-2xl mb-1.5">lock</span>
                <p className="font-semibold text-gray-800 mb-3 text-sm">Unlock advanced features</p>
                <button className="bg-gray-900 text-white font-medium py-1.5 px-5 rounded-lg text-xs hover:bg-gray-800 transition" onClick={handleWhatsApp}>
                  Upgrade to Pro — $9.99/mo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRENDING STOCKS ══════════ */}
        <section className="px-3 py-6">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">Trending <br />Today</h2>
              </div>
              <span className="text-[10px] text-gray-500 text-right">Auto-<br />updating</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {(hotList.length > 0 ? hotList : [
                { symbol: 'SPY', name: 'S&P 500 ETF', price: 710.14, change: 8.48, change_percent: 1.21 },
                { symbol: 'QQQ', name: 'Nasdaq 100 ETF', price: 648.85, change: 6.85, change_percent: 1.31 },
                { symbol: 'AAPL', name: 'Apple Inc.', price: 270.23, change: 5.59, change_percent: 2.59 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 422.79, change: 2.53, change_percent: 0.60 },
              ]).map(stock => (
                <div
                  key={stock.symbol}
                  className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-16 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => { setSearchTerm(stock.symbol); triggerDiagnosis(stock.symbol) }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-xs">{stock.symbol}</span>
                    <span className="font-semibold text-gray-900 text-xs">${priceStr(stock.price)}</span>
                  </div>
                  <div className={`text-[10px] font-medium flex items-center ${stock.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change_percent >= 0 ? '↑' : '↓'} {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)} ({stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%)
                  </div>
                </div>
              ))}
            </div>
            {/* Carousel Dots */}
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-4 h-1 bg-pink-500 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="px-3 py-6 bg-white">
          <div className="max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trusted by thousands <br />of investors</h2>
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 relative">
              {/* Stars */}
              <div className="flex justify-center space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-pink-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-xs text-gray-700 italic mb-4">
                &ldquo;Love how fast I can analyze multiple stocks. The free tier is perfect for getting started.&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span className="material-symbols-outlined text-gray-600 text-base">chevron_left</span>
                </button>
                <div className="flex items-center text-left">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-2.5">
                    <span className="material-symbols-outlined text-pink-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-gray-900">Emily R.</p>
                    <p className="text-[10px] text-gray-500">Data Analyst • Texas</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span className="material-symbols-outlined text-gray-600 text-base">chevron_right</span>
                </button>
              </div>
              <div className="flex justify-center mt-5 space-x-1">
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-4 h-1 bg-pink-500 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ COMPARISON TABLE ══════════ */}
        <section className="px-3 py-6 bg-gray-50">
          <div className="max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Why choose our <br />platform</h2>
            <p className="text-xs text-gray-500 mb-6">See how we compare to traditional analysis tools</p>
            <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden text-left text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
                <div className="p-3 font-semibold text-gray-900"></div>
                <div className="p-3 font-bold text-gray-900 text-center leading-tight">Our <br />Platform</div>
                <div className="p-3 font-medium text-gray-500 text-center leading-tight text-[11px]">Traditional <br />Tools</div>
              </div>
              {/* Rows - Our advantages */}
              {[
                { feature: 'AI-Powered Diagnosis', ours: true, theirs: false, highlight: true },
                { feature: 'Real-time Market Sentiment', ours: true, theirs: false, highlight: true },
                { feature: 'Risk Breakdown Analysis', ours: true, theirs: false, highlight: true },
                { feature: 'Results in Seconds', ours: true, theirs: false, highlight: false },
                { feature: 'Free Tier Available', ours: true, theirs: false, highlight: false },
                { feature: 'Plain English Explanations', ours: true, theirs: false, highlight: false },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-3 border-b border-gray-100 ${row.highlight ? 'bg-red-50/30' : ''}`}>
                  <div className="p-3 text-gray-700 flex items-center">{row.feature}</div>
                  <div className="p-3 flex justify-center items-center">
                    <span className="material-symbols-outlined text-green-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div className="p-3 flex justify-center items-center">
                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))}
              {/* Rows - Shared negatives */}
              {['Expensive Subscription', 'Complex Interface'].map((feature, i) => (
                <div key={i} className="grid grid-cols-3 border-b border-gray-100">
                  <div className="p-3 text-gray-700 flex items-center leading-tight">{feature}</div>
                  <div className="p-3 flex justify-center items-center">
                    <span className="material-symbols-outlined text-red-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  </div>
                  <div className="p-3 flex justify-center items-center">
                    <span className="material-symbols-outlined text-red-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  </div>
                </div>
              ))}
              {/* Table Footer */}
              <div className="grid grid-cols-3 bg-gray-900 text-white rounded-b-2xl">
                <div className="p-3"></div>
                <div className="p-3 text-center">
                  <div className="font-bold text-xs leading-tight">Fast &amp; <br />Affordable</div>
                  <div className="text-[9px] text-gray-300 mt-0.5">Free to start</div>
                </div>
                <div className="p-3 text-center">
                  <div className="font-medium text-xs text-gray-300 leading-tight">Slow &amp; <br />Expensive</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">$50-200/mo</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="px-3 py-6 bg-white border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-500 mb-1.5">&copy; 2026 AI Stock Analysis Platform</p>
        <p className="text-[10px] text-gray-400 mb-3">For educational purposes only. Not financial advice.</p>
        <div className="flex justify-center space-x-3 text-[11px] font-medium text-gray-600">
          <Link className="hover:text-gray-900 transition" href="/privacy">Privacy</Link>
          <span>&bull;</span>
          <Link className="hover:text-gray-900 transition" href="/terms">Terms</Link>
          <span>&bull;</span>
          <Link className="hover:text-gray-900 transition" href="/contact">Contact</Link>
        </div>
      </footer>
    </>
  )
}
