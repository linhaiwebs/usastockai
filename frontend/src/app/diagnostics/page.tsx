'use client'

import Link from 'next/link'

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-nav backdrop-blur-lg border-b border-white/[0.05]">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#99f7ff] font-headline tracking-tighter">STOCK AI</Link>
          <Link href="/" className="text-xs text-[#a5aac2] hover:text-[#99f7ff] uppercase tracking-widest transition-colors">← Back Home</Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-screen-xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <span className="text-[10px] text-[#a5aac2] uppercase tracking-[0.3em] font-label">AI Engine / Diagnostics</span>
          <h1 className="text-3xl font-headline font-bold text-white mt-2 tracking-tight">Stock Diagnostics</h1>
          <p className="text-[#a5aac2] text-sm mt-3 max-w-xl leading-relaxed">
            Our AI-powered diagnostic engine analyzes 500+ US stock entities in real-time, delivering structured insights
            with sentiment scores, risk assessments, and observational analysis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: 'monitoring', title: 'Real-Time Scanning', desc: 'Continuous monitoring of market data streams with sub-second latency for price movements, volume spikes, and pattern detection.' },
            { icon: 'auto_awesome', title: 'AI Sentiment Scoring', desc: 'Proprietary scoring algorithm generates 0-100 sentiment ratings based on multi-factor analysis including technical, fundamental, and sentiment indicators.' },
            { icon: 'trending_up', title: 'Pattern Recognition', desc: 'Deep learning models identify chart patterns, support/resistance levels, and trend reversals across multiple timeframes.' },
            { icon: 'security', title: 'Risk Assessment', desc: 'Comprehensive risk profiling including volatility analysis, drawdown potential, and correlation-based systemic risk evaluation.' },
          ].map((item) => (
            <div key={item.title} className="glass-panel rounded-2xl border border-white/[0.05] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#99f7ff] text-xl">{item.icon}</span>
                </div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">{item.title}</h3>
              </div>
              <p className="text-[#a5aac2] text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="mb-12">
          <h2 className="text-lg font-headline font-bold text-white mb-6 uppercase tracking-wider">How It Works</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: '01', title: 'Data Ingestion', desc: 'Stock quote data fetched from real-time market APIs with 5-minute caching for optimal performance.' },
              { step: '02', title: 'AI Analysis', desc: 'Qwen 2.5 AI model processes stock data through randomized prompt templates for diverse, non-repetitive insights.' },
              { step: '03', title: 'Stream Output', desc: 'Results delivered via SSE streaming — analysis appears character by character for immediate feedback.' },
              { step: '04', title: 'Structured Report', desc: 'Structured output with sentiment scores, risk factors, support/resistance levels, and overall assessments.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start">
                <span className="text-2xl font-headline font-black text-[#99f7ff]/30 shrink-0">{item.step}</span>
                <div>
                  <h4 className="text-sm font-headline font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-[#a5aac2] text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-fixed font-headline font-bold rounded-full text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-base">bolt</span>
          Start Diagnosis
        </Link>
      </main>
    </div>
  )
}
