'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const TOPICS = [
  { emoji: '📊', title: 'Trading strategies', desc: 'AI-powered strategy analysis and basic market structure patterns.' },
  { emoji: '📈', title: 'Technical analysis', desc: 'Understandable insights on market structure, technical tools & typical observations.' },
  { emoji: '🧠', title: 'Market psychology', desc: 'Insights into emotions, psychology and behavioral aspects in market decisions.' },
  { emoji: '⚖️', title: 'Risk management', desc: 'Basics on handling uncertainty, volatility and general risk factors.' },
  { emoji: '💱', title: 'Forex & Stocks', desc: 'Introduction to currency markets, equity markets and essential terminology.' },
  { emoji: '📉', title: 'Chart analysis', desc: 'Basics of charts, patterns and visual market observation for better classification.' },
]

const DETAIL_TOPICS = [
  { n: '1', title: 'Trading strategies', desc: 'AI-assisted insights into different approaches. The content shows how various strategy types are built and considerations that play a role in planning.', items: ['Short- and medium-term strategy approaches', 'Entry/exit scenarios basics', 'Structured preparation of trading ideas'] },
  { n: '2', title: 'Technical analysis', desc: 'Helps better understand how to use technical analysis to assess market movements. General info on common tools and market structure.', items: ['Trends, zones & market phases', 'Support and resistance areas', 'Simple classification of signals'] },
  { n: '3', title: 'Market psychology', desc: 'One of the most important topics for decision-making. Content shows how emotions, uncertainty and discipline affect behavior.', items: ['Emotions & decisions in markets', 'Dealing with uncertainty & pressure', 'Discipline & consistent behavior'] },
  { n: '4', title: 'Risk management', desc: 'Core component of a responsible approach to financial markets. General info on how to better assess risks.', items: ['Basic principles of risk awareness', 'Relationship risk & possible outcomes', 'Handling uncertainty and volatility'] },
  { n: '5', title: 'Forex trading', desc: 'Initial essential knowledge about forex markets. Understandable insights into typical terms, mechanisms and influencing factors.', items: ['Forex market basics', 'Currency pairs & movements', 'Impact of news & macro conditions'] },
  { n: '6', title: 'Stock trading', desc: 'General learning content on equity markets, price action and typical market mechanisms.', items: ['Stock market fundamentals', 'Price behavior & market action', 'Important terms for beginners'] },
  { n: '7', title: 'Chart analysis', desc: 'Helps visualize market movements. General info on charts, formations and structures.', items: ['Basics of charts & displays', 'Common observation patterns', 'Visual classification of movements'] },
]

const REVIEWS = [
  { text: 'The AI diagnosis was well structured, I immediately knew which topics I could request via WhatsApp.', name: 'Michael K.' },
  { text: 'I liked that the content is described in an understandable way, not like typical advertising.', name: 'Sarah M.' },
  { text: 'Contact process was simple. First I received a topic overview and could review everything in peace.', name: 'Thomas B.' },
  { text: 'Especially helpful that trading strategies, risk and market psychology were explained separately.', name: 'Anna W.' },
]

export default function HomePage() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [fallbackUrl, setFallbackUrl] = useState('https://wa.me/1234567890')

  useEffect(() => {
    fetch('/api/config/public').then(r => r.json()).then(data => {
      const s = data.settings || []
      const fb = s.find((x: { key: string }) => x.key === 'fallback_redirect_url')
      if (fb?.value) setFallbackUrl(fb.value)
    }).catch(() => {})
  }, [])

  const handleConvert = useCallback(() => {
    const url = redirectUrl || fallbackUrl
    if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
      (window as any).gtag_report_conversion(url)
    } else {
      window.location.href = url
    }
  }, [redirectUrl, fallbackUrl])

  // Assign redirect on mount
  useEffect(() => {
    fetch('/api/redirects/assign').then(r => r.ok ? r.json() : null).then(d => d?.url && setRedirectUrl(d.url)).catch(() => {})
  }, [])

  // Scroll CTA
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

  return (
    <>
      {/* ── Top Banner ── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center">
        <p>🚀 Now get free AI stock diagnosis content via WhatsApp — trading strategies, technical analysis, market psychology, risk management, forex, stocks &amp; chart analysis.</p>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">AI Stock Diagnosis</div>
        <button className="bg-brand text-white text-sm font-medium py-2 px-4 rounded-full hover:bg-brand-dark transition-colors" onClick={handleConvert}>
          Get free content
        </button>
      </header>

      <main>
        {/* ── Hero Section ── */}
        <section className="py-10 px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>📱</span> Free via WhatsApp
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Free AI stock <span className="text-brand">diagnosis</span> content — right on WhatsApp
          </h1>
          <p className="text-brand-light text-base mb-8">
            Contact us via WhatsApp and receive free initial content on trading strategies, technical analysis, market psychology, risk management, forex trading, stock trading, and chart analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button className="bg-brand text-white text-center font-medium py-3 px-6 rounded-full hover:bg-brand-dark transition-colors w-full sm:w-auto" onClick={handleConvert}>
              Get free AI diagnosis now
            </button>
            <a className="bg-white text-slate-700 border border-slate-200 text-center font-medium py-3 px-6 rounded-full hover:bg-slate-50 transition-colors w-full sm:w-auto" href="#topics">
              Learn more
            </a>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-8">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Free topic overview
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Directly via WhatsApp
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
              Clear risk notice
            </div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>🎓</span> Free · No strings · General educational content only
          </div>
          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-700 flex gap-3">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <div>
              <span className="font-semibold">Initial overview at no cost:</span> Receive a first glimpse of content, topic areas, and learning focuses on strategies, technicals, psychology, risk, forex, stocks &amp; charting.
            </div>
          </div>
        </section>

        {/* ── Quick Access Banner ── */}
        <section className="bg-slate-50 border-y border-slate-100 py-8 px-4 sm:px-6">
          <div className="text-brand text-xs font-bold uppercase tracking-wider mb-2">Free Access</div>
          <h2 className="text-xl font-bold mb-3">Get AI stock diagnosis directly via WhatsApp — at no cost</h2>
          <p className="text-brand-light text-sm mb-6">Reach out via WhatsApp and receive a free initial overview of our content and topic areas.</p>
          <button className="block w-full bg-brand text-white text-center text-sm font-medium py-3 rounded-full hover:bg-brand-dark transition-colors" onClick={handleConvert}>
            Request free AI diagnosis
          </button>
        </section>

        {/* ── Topics Overview ── */}
        <section className="py-10 px-4 sm:px-6 bg-white" id="topics">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">These topics you can get for free</h2>
          <p className="text-brand-light text-sm mb-8">Initial overviews on key market areas — easy to understand, delivered free via WhatsApp.</p>
          <div className="space-y-4">
            {TOPICS.map(t => (
              <div key={t.title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{t.emoji}</span>
                  <h3 className="font-bold">{t.title}</h3>
                </div>
                <p className="text-sm text-brand-light leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Detailed Content List ── */}
        <section className="py-10 px-4 sm:px-6 bg-slate-50 border-y border-slate-100">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Topic overview — in more detail</h2>
          <p className="text-brand-light text-sm mb-8">A closer look at the areas for which you can receive initial information via WhatsApp.</p>
          <div className="space-y-8">
            {DETAIL_TOPICS.map(t => (
              <div key={t.n}>
                <h3 className="font-bold text-lg mb-2">{t.n}. {t.title}</h3>
                <p className="text-sm text-brand-light mb-3">{t.desc}</p>
                <ul className="text-sm text-brand-light space-y-1.5 list-disc pl-5">
                  {t.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── What You Receive ── */}
        <section className="py-10 px-4 sm:px-6 bg-white">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">What you receive free via WhatsApp</h2>
          <p className="text-brand-light text-sm mb-6">After your WhatsApp request, you&apos;ll get a free initial overview of our learning content, topic areas and general information material.</p>
          <ul className="space-y-4 mb-8">
            {[
              { emoji: '📋', label: 'Topic overview' },
              { emoji: '📚', label: 'Introductory material' },
              { emoji: '🧩', label: 'Content structure explanation' },
              { emoji: '⚠️', label: 'Important notes' },
            ].map(item => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="bg-slate-100 p-2 rounded-lg text-lg">{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="bg-brand-bg rounded-2xl p-5 mb-8">
            <h4 className="font-bold text-sm mb-4">Specifically included (free items):</h4>
            <ul className="space-y-3">
              {[
                { bold: 'Free trading strategies', after: ' overview' },
                { bold: 'Technical analysis', after: ' introduction' },
                { bold: '', before: 'General content on ', boldMid: 'market psychology' },
                { bold: 'Risk management', after: ' fundamentals' },
                { bold: '', before: 'Initial information on ', boldMid: 'forex & stocks' },
                { bold: '', before: 'Request free via WhatsApp' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-brand shrink-0" fill="currentColor" viewBox="0 0 20 20"><path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path></svg>
                  <span>{item.before}<span className="font-medium">{item.bold || item.boldMid}</span>{item.after}</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="block w-full bg-brand text-white text-center text-sm font-medium py-3 rounded-full hover:bg-brand-dark transition-colors" onClick={handleConvert}>
            Request free AI diagnosis
          </button>
        </section>

        {/* ── How To Request ── */}
        <section className="py-10 px-4 sm:px-6 bg-slate-50 border-y border-slate-100">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">How to request</h2>
          <p className="text-brand-light text-sm mb-8">Transparent, simple, no registration.</p>
          <div className="space-y-6">
            {[
              { n: '1', title: 'Send a WhatsApp message', desc: '— you contact us via WhatsApp and request a free overview of available topics.' },
              { n: '2', title: 'Receive content for free', desc: '— directly via WhatsApp you get the initial overview of our learning content and topic areas.' },
              { n: '3', title: 'Review at your own pace', desc: '— look through the information calmly and decide which topics interest you more.' },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm">{step.n}</div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-sm text-brand-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-10 px-4 sm:px-6 bg-white">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Feedback from users</h2>
          <p className="text-brand-light text-sm mb-8">Impressions on clarity and the simple WhatsApp process.</p>
          <div className="space-y-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm italic text-sm text-slate-700">
                &ldquo;{r.text}&rdquo;
                <div className="mt-3 font-semibold not-italic text-xs text-slate-900">— {r.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-12 px-4 sm:px-6 bg-slate-50 border-t border-slate-100 text-center" id="request">
          <div className="inline-flex items-center justify-center gap-2 text-brand text-xs font-bold uppercase tracking-wider mb-4">
            <span>📱</span> FREE VIA WHATSAPP
          </div>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Request free AI stock diagnosis now</h2>
          <p className="text-brand-light text-sm mb-8 max-w-md mx-auto">
            Receive a free initial overview on trading strategies, technical analysis, market psychology, risk management, forex, stocks &amp; chart analysis — directly via WhatsApp.
          </p>
          <button className="inline-block w-full sm:w-auto bg-brand text-white text-center font-medium py-3 px-8 rounded-full hover:bg-brand-dark transition-colors mb-6 shadow-md shadow-brand/20" onClick={handleConvert}>
            Get the report for free via WhatsApp
          </button>
          <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <span>🎓</span> Free · Direct via WhatsApp · General educational content
          </div>
        </section>

        {/* ── Important Notice ── */}
        <section className="py-10 px-4 sm:px-6 bg-white">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-600 space-y-4">
            <h4 className="font-bold text-sm text-slate-800">Important notice</h4>
            <p><strong className="font-semibold text-slate-700">General information:</strong> The content provided on this website is for general informational and educational purposes only.</p>
            <p><strong className="font-semibold text-slate-700">Not investment advice:</strong> The content does not constitute financial or investment advice, nor a personal recommendation or solicitation to buy/sell financial instruments.</p>
            <p><strong className="font-semibold text-slate-700">Risk:</strong> Capital investments involve risk. Past performance is not a reliable indicator of future results.</p>
            <p><strong className="font-semibold text-slate-700">WhatsApp contact:</strong> Contact via WhatsApp is solely for requesting free general learning content and topic overviews.</p>
          </div>
        </section>
      </main>

      {/* ── Sticky Footer Banner ── */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-slate-200 py-3 px-4 sm:px-6 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div>
          <div className="font-bold text-sm">Want free AI diagnosis?</div>
          <div className="text-xs text-brand-light">Contact us via WhatsApp for an initial topic overview</div>
        </div>
        <button className="shrink-0 bg-brand text-white text-xs font-medium py-2 px-4 rounded-full hover:bg-brand-dark transition-colors" onClick={handleConvert}>
          Get free content
        </button>
      </div>

      {/* ── Scroll CTA ── */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md" id="scroll-cta">
        <button className="block w-full bg-brand text-white text-center font-bold py-4 px-6 rounded-2xl shadow-2xl hover:bg-brand-dark transition-colors" onClick={handleConvert}>
          Get the report for free via WhatsApp
        </button>
      </div>

      {/* ── Footer Links ── */}
      <footer className="py-6 text-center bg-white border-t border-slate-100">
        <p className="text-xs text-slate-400 mb-2">© 2026 AI Stock Diagnosis</p>
        <div className="flex justify-center gap-4">
          <Link className="text-xs text-slate-400 hover:text-brand transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="text-xs text-slate-400 hover:text-brand transition-colors" href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </>
  )
}
