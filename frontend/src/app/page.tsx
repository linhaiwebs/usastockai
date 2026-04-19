'use client'

import { useEffect, useRef, useCallback, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchStockQuote, StockInfo } from '../lib/api'

function priceStr(val: number): string {
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

type DiagStage = 'idle' | 'loading' | 'report'

export default function LandingPage() {
  return <Suspense><LandingContent /></Suspense>
}

function LandingContent() {
  const processingRef = useRef(false)
  const params = useSearchParams()
  const codeParam = params.get('code') || ''

  const [searchTerm, setSearchTerm] = useState('')
  const [diagStage, setDiagStage] = useState<DiagStage>('idle')
  const [diagQuote, setDiagQuote] = useState<StockInfo | null>(null)
  const [streamText, setStreamText] = useState('')
  const [streamActive, setStreamActive] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [defaultLink, setDefaultLink] = useState('https://wa.me/1234567890')
  const [diagnosticHint, setDiagnosticHint] = useState('')

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

  const triggerDiagnosis = useCallback((ticker?: string) => {
    if (processingRef.current) return
    processingRef.current = true
    const sym = ticker || searchTerm.trim() || 'AAPL'
    setSearchTerm(sym)
    beginAnalysis(sym)
    setDiagStage('loading')
    fetch('/api/redirects/assign').then(r => r.ok ? r.json() : null).then(d => d?.url && setWhatsappLink(d.url)).catch(() => {})
    setTimeout(() => { setDiagStage('report'); processingRef.current = false }, 1500)
  }, [searchTerm, beginAnalysis])

  const resetDiagnosis = useCallback(() => {
    if (streamAbortRef.current) { streamAbortRef.current.abort(); streamAbortRef.current = null }
    setStreamActive(false); setDiagStage('idle'); setStreamText(''); setDiagQuote(null)
  }, [])

  const handleWhatsApp = useCallback(() => {
    const url = whatsappLink || defaultLink
    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
      (window as any).gtag_report_conversion(url)
    } else {
      window.location.href = url
    }
  }, [whatsappLink, defaultLink])

  return (
    <>
      {/* ── TopAppBar ── */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#faf8ff]/70 backdrop-blur-xl text-[#4F46E5] font-headline tracking-tight z-50 shadow-[0px_20px_40px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-[#131b2e]">
          <span className="material-symbols-outlined text-[#4F46E5]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          StockAI
        </div>
        <nav className="hidden md:flex gap-6">
          <a className="text-[#4F46E5] font-semibold hover:bg-[#f2f3ff] transition-colors px-3 py-2 rounded-lg" href="#">Analyze</a>
          <a className="text-slate-500 hover:bg-[#f2f3ff] transition-colors px-3 py-2 rounded-lg" href="#">Markets</a>
          <a className="text-slate-500 hover:bg-[#f2f3ff] transition-colors px-3 py-2 rounded-lg" href="#">Portfolio</a>
          <a className="text-slate-500 hover:bg-[#f2f3ff] transition-colors px-3 py-2 rounded-lg" href="#">Profile</a>
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-grow flex items-center justify-center p-4 bg-background text-on-background font-body antialiased min-h-screen flex flex-col pt-16 pb-24 md:pb-0">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(15,23,42,0.06)] w-full max-w-3xl overflow-hidden mt-8 md:mt-0">
          {/* Decorative Top Border */}
          <div className="h-2 bg-gradient-to-r from-secondary to-primary w-full"></div>

          <div className="p-8 md:p-12 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">AI Stock Prediction</h1>
            <p className="font-body text-on-surface-variant text-lg mb-10">Enter any stock symbol for instant AI-powered insights.</p>

            {/* Feature Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
              {[
                { icon: 'bolt', title: 'Instant Analysis' },
                { icon: 'show_chart', title: 'Market Insights' },
                { icon: 'forum', title: 'Expert Advice' },
              ].map(f => (
                <div key={f.icon} className="flex flex-col items-center bg-surface-container-low p-3 md:p-6 rounded-xl text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-2 md:mb-4">
                    <span className="material-symbols-outlined text-lg md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  </div>
                  <h3 className="font-headline font-semibold text-on-surface text-xs md:text-base leading-tight">{f.title}</h3>
                </div>
              ))}
            </div>

            {/* ── Interactive Area (Input+Btn / Loading / Report) ── */}
            <div className="max-w-xl mx-auto mb-10">
              {diagStage === 'idle' && (
                <div className="diag-stage">
                  <div className="relative mb-6">
                    <input
                      className="w-full bg-surface-container-low border-0 text-center font-label text-sm tracking-widest text-on-surface placeholder:text-outline py-5 px-6 rounded-full focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all outline-none"
                      placeholder={diagnosticHint || 'ENTER STOCK SYMBOL (E.G. AAPL, TSLA)'}
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') triggerDiagnosis() }}
                    />
                  </div>
                  <button
                    className="bg-gradient-to-br from-secondary to-primary text-on-primary font-headline font-semibold text-lg py-4 px-10 rounded-full flex items-center justify-center gap-3 mx-auto shadow-[0px_20px_40px_rgba(15,23,42,0.06)] hover:scale-98 active:scale-95 transition-transform w-full md:w-auto"
                    onClick={() => triggerDiagnosis()}
                  >
                    <span className="material-symbols-outlined">bar_chart</span>
                    Analyze with AI
                  </button>
                </div>
              )}

              {diagStage === 'loading' && (
                <div className="diag-stage entering py-12">
                  <div className="w-12 h-12 border-4 border-surface-container-highest border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-headline font-semibold text-on-surface-variant">Analyzing...</p>
                  <p className="text-sm text-outline mt-1">Scanning market data and sentiment</p>
                </div>
              )}

              {diagStage === 'report' && (
                <div className="diag-stage entering text-left">
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="font-headline text-2xl font-bold text-primary">{diagQuote?.symbol || searchTerm || 'STOCK'}</h2>
                      <p className="text-on-surface-variant text-xs">{diagQuote?.name || 'Stock Analysis'}</p>
                    </div>
                    {diagQuote && (
                      <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${diagQuote.change_percent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        <span className="material-symbols-outlined text-sm">{diagQuote.change_percent >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {diagQuote.change_percent >= 0 ? '+' : ''}{diagQuote.change_percent.toFixed(1)}%
                      </div>
                    )}
                  </div>

                  {/* Price + Metrics */}
                  {diagQuote && (
                    <>
                      <div className="mb-4">
                        <span className="font-headline text-3xl font-bold text-on-surface">${priceStr(diagQuote.price)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-surface-container-low p-3 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Valuation</span>
                          <span className="text-on-surface font-bold text-sm">{diagQuote.pe_ratio ? (diagQuote.pe_ratio > 25 ? 'Premium' : 'Fair') : 'N/A'}</span>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Sentiment</span>
                          <span className={`font-bold text-sm ${diagQuote.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{diagQuote.change >= 0 ? 'Bullish' : 'Bearish'}</span>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1">Risk</span>
                          <span className="text-on-surface font-bold text-sm">{Math.abs(diagQuote.change_percent) <= 2 ? 'Low' : 'High'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                        <div><span className="text-on-surface-variant text-xs">Market Cap</span><p className="font-bold">{diagQuote.market_cap ? `$${(diagQuote.market_cap / 1e9).toFixed(1)}B` : 'N/A'}</p></div>
                        <div><span className="text-on-surface-variant text-xs">Volume</span><p className="font-bold">{diagQuote.volume?.toLocaleString() || 'N/A'}</p></div>
                        <div><span className="text-on-surface-variant text-xs">P/E Ratio</span><p className="font-bold">{diagQuote.pe_ratio?.toFixed(1) || 'N/A'}</p></div>
                        <div><span className="text-on-surface-variant text-xs">52W High</span><p className="font-bold">{diagQuote.fifty_two_week_high ? `$${priceStr(diagQuote.fifty_two_week_high)}` : 'N/A'}</p></div>
                      </div>
                    </>
                  )}

                  {/* AI Summary */}
                  {diagQuote && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">AI Executive Summary</h4>
                      <p className="text-on-surface text-sm leading-relaxed">
                        {diagQuote.change >= 0
                          ? `Strong fundamental resilience with ${diagQuote.change_percent.toFixed(1)}% momentum. AI-integration in the ecosystem provides significant medium-term tailwinds. Valuation justified by cash flow stability.`
                          : `Distribution pressure detected with ${Math.abs(diagQuote.change_percent).toFixed(1)}% decline. Risk factors suggest downside exposure. Consider protective positioning.`}
                      </p>
                    </div>
                  )}

                  {/* Stream Text */}
                  {streamText && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>AI Analysis
                      </h4>
                      <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{streamText}</div>
                      {streamActive && <div className="w-3 h-3 border-2 border-surface-container-highest border-t-primary rounded-full animate-spin mt-2"></div>}
                    </div>
                  )}

                  {/* WhatsApp CTA */}
                  <button
                    id="whatsapp-cta"
                    className="pulse-active flex items-center justify-center gap-3 py-4 rounded-full font-headline font-semibold text-base transition-all active:scale-95 w-full shadow-[0px_12px_24px_rgba(37,211,102,0.25)]"
                    onClick={handleWhatsApp}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    Get the report for free via WhatsApp
                  </button>

                  {/* Reset Button */}
                  <button className="w-full text-center mt-4 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors" onClick={resetDiagnosis}>
                    Analyze Another Stock
                  </button>
                </div>
              )}
            </div>

            {/* Trust Signals */}
            <div className="flex justify-center gap-8 mt-12 mb-8 text-on-surface-variant font-label text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">lock</span> Secure
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">timer</span> Instant
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">volunteer_activism</span> Free
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-outline text-xs mt-6 font-body">For educational purposes only. Not financial advice.</p>
          </div>
        </div>
      </main>

      {/* ── BottomNavBar (Mobile Only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#faf8ff]/80 backdrop-blur-2xl rounded-t-[32px] shadow-[0px_-10px_30px_rgba(15,23,42,0.04)] font-body text-[10px] uppercase tracking-widest font-bold">
        <a className="flex flex-col items-center justify-center text-[#4F46E5] bg-[#f2f3ff] rounded-2xl px-4 py-1 scale-95 active:scale-90 transition-transform duration-200" href="#">
          <span className="material-symbols-outlined mb-1">query_stats</span>
          <span>Analyze</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 hover:text-[#3525cd] scale-95 active:scale-90 transition-transform duration-200 px-4 py-1" href="#">
          <span className="material-symbols-outlined mb-1">trending_up</span>
          <span>Markets</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 hover:text-[#3525cd] scale-95 active:scale-90 transition-transform duration-200 px-4 py-1" href="#">
          <span className="material-symbols-outlined mb-1">account_balance_wallet</span>
          <span>Portfolio</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 hover:text-[#3525cd] scale-95 active:scale-90 transition-transform duration-200 px-4 py-1" href="#">
          <span className="material-symbols-outlined mb-1">person</span>
          <span>Profile</span>
        </a>
      </nav>

      {/* ── Footer (Desktop Only) ── */}
      <footer className="w-full py-12 px-6 flex-col items-center gap-6 border-t border-slate-200/10 bg-[#f2f3ff] text-[#3525cd] font-body text-xs leading-relaxed mt-auto hidden md:flex">
        <div className="flex gap-6">
          <Link className="text-slate-500 hover:text-[#4F46E5] transition-colors opacity-80 hover:opacity-100" href="/privacy">Privacy</Link>
          <Link className="text-slate-500 hover:text-[#4F46E5] transition-colors opacity-80 hover:opacity-100" href="/terms">Terms</Link>
          <Link className="text-slate-500 hover:text-[#4F46E5] transition-colors opacity-80 hover:opacity-100" href="/contact">Contact</Link>
        </div>
        <p className="font-headline font-extrabold text-slate-900">&copy; 2026 StockAI. High-fidelity market predictions powered by Luminous Intelligence.</p>
      </footer>
    </>
  )
}
