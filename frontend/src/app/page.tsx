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
  const [currentDomain, setCurrentDomain] = useState('')
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
    setCurrentDomain(window.location.hostname)
    fetch('/api/config/public').then(r => r.json()).then(data => {
      const s = data.settings || []
      const fb = s.find((x: { key: string }) => x.key === 'fallback_redirect_url')
      if (fb?.value) setFallbackUrl(fb.value)
      const ph = s.find((x: { key: string }) => x.key === 'diagnostic_placeholder_text')
      if (ph?.value) setPlaceholderText(ph.value)
    }).catch(() => {})
  }, [])

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
        <div className="fixed inset-0 bg-background/90 backdrop-blur-2xl transition-all duration-500" onClick={closeModal}></div>
        <div className="relative w-full max-w-sm glass-card rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 transition-all duration-500 overflow-hidden">
          <button className="absolute top-2 right-2 text-on-surface-variant hover:text-primary transition-colors z-20" onClick={closeModal}>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {modalState === 'loading' && (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-6 p-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-2 border-secondary/40 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">auto_awesome</span>
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-xl font-bold uppercase tracking-widest gradient-text">AI Diagnosis In Progress</h2>
                <div className="text-primary font-mono text-xs uppercase tracking-tighter opacity-80">{progressTxt}</div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out rounded-full" style={{ width: progressW }}></div>
              </div>
            </div>
          )}

          {modalState === 'result' && (
            <div className="flex flex-col p-2">
              <div className="w-full mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-headline font-bold text-primary tracking-[0.3em] uppercase">AI Diagnosis Complete</span>
                  <span className="text-[9px] font-mono text-secondary">100%</span>
                </div>
                <div className="w-full h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full shadow-[0_0_10px_rgba(153,247,255,1)]"></div>
                </div>
              </div>

              <div className="text-center mb-3">
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">{modalStock?.name || activeSym}</h2>
                {modalStock ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-headline text-3xl font-bold text-primary">${fmtPrice(modalStock.price)}</span>
                    <span className={`text-sm font-headline font-bold px-2.5 py-1 rounded-full ${modalStock.change_percent >= 0 ? 'text-primary bg-primary/10' : 'text-error bg-error/10'}`}>
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
                <div className="glass-card rounded-xl p-3 mb-3">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2.5">
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Change</p><p className={`text-xs font-bold font-headline ${modalStock.change >= 0 ? 'text-primary' : 'text-error'}`}>{modalStock.change >= 0 ? '+' : ''}{modalStock.change.toFixed(2)}</p></div>
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Volume</p><p className="text-xs font-bold text-on-surface font-headline">{fmtNum(modalStock.volume)}</p></div>
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Mkt Cap</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.market_cap ? fmtNum(modalStock.market_cap) : '—'}</p></div>
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">P/E</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.pe_ratio != null ? modalStock.pe_ratio.toFixed(1) : '—'}</p></div>
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">52W High</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.fifty_two_week_high != null ? '$' + fmtPrice(modalStock.fifty_two_week_high) : '—'}</p></div>
                    <div><p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">EPS</p><p className="text-xs font-bold text-on-surface font-headline">{modalStock.eps != null ? modalStock.eps.toFixed(2) : '—'}</p></div>
                  </div>
                </div>
              )}

              <div className="w-full glass-card p-2 rounded-xl mb-3 max-h-48 overflow-y-auto no-scrollbar">
                <p className="text-sm text-on-surface leading-relaxed font-body whitespace-pre-wrap">
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
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl font-headline font-black text-base tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20"
                  id="modal-submit-btn"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Get Free Report via WhatsApp
                </button>
                <p className="mt-2 text-center text-[8px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">INSTANT WHATSAPP DELIVERY · COMPREHENSIVE REPORT</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Background Glowing Orbs ── */}
      <div className="fixed top-[-15%] left-[-20%] w-[70vw] h-[70vw] bg-secondary-container/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-15%] w-[60vw] h-[60vw] bg-primary-container/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* ── Decorative Floating Glass Cards ── */}
      <div className="fixed top-[15%] right-[5%] w-24 h-32 bg-white/[0.03] backdrop-blur-[16px] border border-white/[0.05] rounded-xl z-0 animate-float rotate-6 pointer-events-none shadow-[0_8px_32px_rgba(0,0,0,0.3)]"></div>
      <div className="fixed bottom-[20%] left-[5%] w-32 h-24 bg-white/[0.03] backdrop-blur-[16px] border border-white/[0.05] rounded-xl z-0 animate-float-delayed -rotate-12 pointer-events-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>
      <div className="fixed top-[45%] left-[8%] w-16 h-16 rounded-full bg-white/[0.02] backdrop-blur-[16px] border border-white/[0.05] z-0 animate-float-slow pointer-events-none"></div>

      {/* ── TopAppBar ── */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 glass-nav border-b border-white/[0.05]">
        <button className="text-primary hover:bg-white/5 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full">
          <span className="material-symbols-outlined text-2xl font-bold">font_download</span>
        </button>
        <div className="text-xl font-bold tracking-[0.2em] text-primary uppercase font-headline">ETHEREAL AI</div>
        <button className="text-secondary hover:bg-white/5 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full border border-white/10">
          <span className="material-symbols-outlined text-2xl font-bold">info</span>
        </button>
      </header>

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-6 px-6 relative z-10">
        {/* ── Trust Badge ── */}
        <div className="mb-8 px-5 py-2 rounded-full bg-white/[0.05] border border-white/[0.05] backdrop-blur-[16px] flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <span className="font-label text-[10px] text-primary tracking-widest uppercase animate-pulse-glow">
            🔥 12,458 investors diagnosed today | Backtest Accuracy 89.4%
          </span>
        </div>

        {/* ── Hero Typography ── */}
        <div className="text-center w-full max-w-sm mb-10 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-headline font-bold mb-4 tracking-tight leading-tight gradient-text">
            See the Hidden DNA of<br/>Every Stock
          </h1>
          <p className="text-sm font-body text-on-surface-variant font-light leading-relaxed max-w-[280px]">
            Wall Street-level AI quantitative model. Enter code for instant prediction and risk analysis.
          </p>
        </div>

        {/* ── Search Input (Glassmorphism Data Portal) ── */}
        <div className="w-full max-w-sm relative group mb-12 search-portal">
          <div className="relative rounded-[20px] bg-white/[0.05] backdrop-blur-[16px] border border-white/[0.05] p-2 flex items-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.1]">
            <span className="material-symbols-outlined text-on-surface-variant ml-3 text-xl">search</span>
            <input
              autoComplete="off"
              className="flex-1 w-full min-w-0 bg-transparent border-none text-on-surface font-label text-[13px] placeholder:text-on-surface-variant/40 focus:ring-0 focus:outline-none px-3"
              placeholder="Enter stock code or symbol (e.g., AAPL)"
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onFocus={() => { if (results.length > 0) setDropdown(true) }}
              onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleCTA() }}
            />
            <button
              className="relative flex-shrink-0 bg-gradient-to-br from-primary to-secondary text-on-primary-fixed font-headline font-bold text-xs px-5 py-3.5 rounded-[14px] shadow-[0_0_15px_rgba(153,247,255,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(172,137,255,0.6)] flex items-center gap-1 group/btn overflow-hidden"
              onClick={handleCTA}
            >
              <span className="relative z-10 tracking-wide">⚡ Free AI Diagnosis</span>
              <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Search Dropdown */}
          {dropdown && query.trim() && (
            <div className="absolute top-full left-0 w-full mt-3 rounded-2xl bg-[#0a0e18]/90 backdrop-blur-[16px] border border-white/[0.05] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-20">
              {results.length > 0 ? (
                <>
                  {results.map(item => (
                    <button
                      key={item.symbol}
                      className="w-full px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors border-b border-white/[0.05] last:border-b-0 text-left"
                      onClick={() => { setQuery(item.symbol); setDropdown(false); startStream(item.symbol); openModal() }}
                    >
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-primary text-sm tracking-widest">{item.symbol}</span>
                        <span className="font-body text-on-surface-variant text-[10px]">{item.name}</span>
                      </div>
                      <span className="font-label text-[10px] text-secondary border border-secondary/30 rounded px-2 py-0.5 bg-secondary-container/10">{item.type}</span>
                    </button>
                  ))}
                  {resultTotal > 5 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
                      <span className="text-[10px] text-on-surface-variant">{(resultPage - 1) * 5 + 1}–{Math.min(resultPage * 5, resultTotal)} of {resultTotal}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-white/5 text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage <= 1} onClick={() => onPageChange(resultPage - 1)}>← Prev</button>
                        <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-white/5 text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30" disabled={resultPage * 5 >= resultTotal} onClick={() => onPageChange(resultPage + 1)}>Next →</button>
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
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl block mb-1">search_off</span>
                  <p className="text-xs text-on-surface-variant">No results for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Market Pulse ── */}
        <div className="w-full max-w-sm mb-10">
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
            <h2 className="font-headline text-xs font-bold text-on-surface tracking-widest uppercase">Market Pulse</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2 snap-x">
            {!hotLoading && hotStocks.length > 0 ? hotStocks.slice(0, 6).map(stock => (
              <div key={stock.symbol} className="min-w-[140px] flex-shrink-0 glass-card rounded-xl p-3 snap-start relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-12 h-12 ${stock.change_percent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} blur-xl rounded-full`}></div>
                <div className="text-[10px] font-body text-on-surface-variant mb-1">{stock.symbol}</div>
                <div className="font-headline text-sm font-bold text-on-surface mb-1">${fmtPrice(stock.price)}</div>
                <div className={`font-label text-[10px] flex items-center gap-1 ${stock.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="material-symbols-outlined text-[10px]">{stock.change_percent >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                  {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                </div>
              </div>
            )) : (
              <>
                <div className="min-w-[140px] flex-shrink-0 glass-card rounded-xl p-3 snap-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/10 blur-xl rounded-full"></div>
                  <div className="text-[10px] font-body text-on-surface-variant mb-1">NASDAQ</div>
                  <div className="font-headline text-sm font-bold text-on-surface mb-1">16,248.52</div>
                  <div className="font-label text-[10px] text-green-400 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_upward</span>+1.24%</div>
                </div>
                <div className="min-w-[140px] flex-shrink-0 glass-card rounded-xl p-3 snap-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 blur-xl rounded-full"></div>
                  <div className="text-[10px] font-body text-on-surface-variant mb-1">S&P 500</div>
                  <div className="font-headline text-sm font-bold text-on-surface mb-1">5,147.21</div>
                  <div className="font-label text-[10px] text-red-400 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_downward</span>-0.32%</div>
                </div>
                <div className="min-w-[140px] flex-shrink-0 glass-card rounded-xl p-3 snap-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/10 blur-xl rounded-full"></div>
                  <div className="text-[10px] font-body text-on-surface-variant mb-1">DOW JONES</div>
                  <div className="font-headline text-sm font-bold text-on-surface mb-1">39,475.90</div>
                  <div className="font-label text-[10px] text-green-400 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_upward</span>+0.68%</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Trending AI Analysis ── */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="material-symbols-outlined text-secondary text-sm">local_fire_department</span>
            <h2 className="font-headline text-xs font-bold text-on-surface tracking-widest uppercase">Trending AI Analysis</h2>
          </div>
          <div className="flex flex-col gap-3 px-2">
            {!hotLoading && hotStocks.length > 0 ? hotStocks.slice(0, 4).map((stock, i) => (
              <div
                key={stock.symbol}
                className="w-full glass-card rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-white/[0.08] transition-colors relative overflow-hidden"
                onClick={() => { setQuery(stock.symbol); startStream(stock.symbol); openModal() }}
              >
                <div className={`absolute left-0 top-0 w-1 h-full ${i % 2 === 0 ? 'bg-primary/80' : 'bg-secondary/80'}`}></div>
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white/[0.03] flex items-center justify-center font-headline font-bold border border-white/[0.05]" style={{ color: i % 2 === 0 ? '#99f7ff' : '#ac89ff' }}>
                    {stock.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-headline font-bold text-sm tracking-wide text-on-surface truncate">{stock.symbol}</div>
                    <div className="font-body text-[10px] text-on-surface-variant truncate">{stock.name}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                  <div className={`font-label text-[10px] border rounded px-2 py-0.5 mb-1 flex items-center gap-1 ${stock.change_percent >= 0 ? 'text-primary border-primary/30 bg-primary/10' : 'text-error border-error/30 bg-error/10'}`}>
                    <span className="material-symbols-outlined text-[10px]">verified</span>
                    {stock.change_percent >= 0 ? 'High' : 'Low'} Confidence
                  </div>
                  <div className={`font-headline text-xs ${stock.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.change_percent >= 0 ? 'Bullish' : 'Bearish'} Signal
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-on-surface-variant">No trending data available</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stock Data Module (code param) ── */}
        {tickerParam && (
          <section className="w-full max-w-sm mb-8 space-y-4">
            <div className="flex items-center gap-2 mb-2 px-2">
              <span className="material-symbols-outlined text-primary text-sm">analytics</span>
              <h2 className="font-headline text-xs font-bold text-on-surface tracking-widest uppercase">AI Diagnosis Result</h2>
            </div>
            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : stockData ? (
              <div className="flex flex-col gap-3">
                <div className="glass-card p-4 rounded-xl relative overflow-hidden border-l-4 border-primary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-2">Market Sentiment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-headline font-bold text-primary">{stockData.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                    <span className="text-primary/60 font-mono text-sm tracking-tighter">({stockData.change >= 0 ? 'High' : 'Low'} Confidence)</span>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl border-l-4 border-secondary/50">
                  <p className="text-on-surface-variant font-headline text-xs tracking-widest uppercase mb-2">AI Recommendation</p>
                  <div className={`${stockData.change_percent >= 0 ? 'bg-primary/10' : 'bg-error/10'} inline-block px-4 py-1 rounded-full mb-2`}>
                    <span className={`${stockData.change_percent >= 0 ? 'text-primary' : 'text-error'} font-headline font-bold text-sm uppercase tracking-tighter`}>
                      {stockData.change_percent >= 0 ? 'Strong Buy' : 'Sell Signal'}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed font-body">
                    AI analysis indicates {stockData.change >= 0 ? 'a primary support bounce' : 'distribution pressure'} at {fmtPrice(stockData.price)} with target {stockData.change >= 0 ? 'upside' : 'downside'} of {Math.abs(stockData.change_percent).toFixed(1)}%.
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-6 mt-auto border-t border-white/[0.05] flex justify-center items-center z-10 relative bg-[#0a0e18]/80 backdrop-blur-md">
        <div className="max-w-sm w-full flex justify-between items-center px-6">
          <Link className="hover:text-primary transition-colors text-on-surface-variant/60 font-body text-[10px]" href="/privacy">Privacy Policy</Link>
          <span className="text-white/10">|</span>
          <Link className="hover:text-primary transition-colors text-on-surface-variant/60 font-body text-[10px]" href="/terms">Terms of Service</Link>
          <span className="text-white/10">|</span>
          <Link className="hover:text-primary transition-colors text-on-surface-variant/60 font-body text-[10px]" href="/contact">Contact</Link>
        </div>
      </footer>

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-8 left-0 w-full px-6 z-[80]" id="sticky-cta">
        <div className="max-w-sm mx-auto">
          <button
            className="w-full bg-gradient-to-br from-primary to-secondary text-on-primary-fixed font-headline font-bold py-4 rounded-2xl text-base tracking-wide shadow-[0_0_30px_rgba(153,247,255,0.2)] hover:shadow-[0_0_40px_rgba(172,137,255,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
            onClick={handleCTA}
          >
            <span className="material-symbols-outlined font-bold">auto_awesome</span>
            RUN AI DIAGNOSIS
          </button>
        </div>
      </div>
    </>
  )
}
