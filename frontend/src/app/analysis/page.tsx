'use client'

import Link from 'next/link'

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-[#070d1f] cosmic-gradient">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#070d1f]/80 backdrop-blur-lg border-b border-[#41475b]/30">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#99f7ff] font-headline tracking-tighter">STOCK AI</Link>
          <Link href="/" className="text-xs text-[#a5aac2] hover:text-[#99f7ff] uppercase tracking-widest transition-colors">← Back Home</Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-screen-xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <span className="text-[10px] text-[#a5aac2] uppercase tracking-[0.3em] font-label">AI Engine / Analysis</span>
          <h1 className="text-3xl font-headline font-bold text-white mt-2 tracking-tight">AI Analysis</h1>
          <p className="text-[#a5aac2] text-sm mt-3 max-w-xl leading-relaxed">
            Powered by Qwen 2.5-7B-Instruct via vLLM, our analysis engine generates structured, actionable
            stock diagnostics with randomized prompt templates for diverse and non-repetitive outputs.
          </p>
        </div>

        {/* Model Info */}
        <div className="glass-panel rounded-2xl border border-[#41475b]/30 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#99f7ff]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#99f7ff] text-xl">psychology</span>
            </div>
            <div>
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">AI Model</h3>
              <p className="text-[#a5aac2] text-xs">Qwen2.5-7B-Instruct — Fast, multilingual, instruction-tuned</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Temperature', value: '0.7' },
              { label: 'Max Tokens', value: '300-400' },
              { label: 'Top P', value: '0.9' },
              { label: 'Format Pool', value: '3 templates' },
            ].map((item) => (
              <div key={item.label} className="bg-[#0c1326] rounded-xl p-3">
                <p className="text-[8px] text-[#a5aac2] uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-sm font-headline font-bold text-[#99f7ff]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Templates */}
        <div className="mb-12">
          <h2 className="text-lg font-headline font-bold text-white mb-6 uppercase tracking-wider">Analysis Formats</h2>
          <p className="text-[#a5aac2] text-xs mb-6">
            Each diagnosis randomly selects one of 3 prompt templates, ensuring varied analysis perspectives. All templates are customizable via the admin dashboard.
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                format: 'Format 1 — Scorecard',
                desc: 'Structured scoring format with AI Score (/100), key strengths, key risks, and technical support/resistance levels.',
                vars: '{symbol}, {price}, {direction}, {change_pct}',
                icon: 'leaderboard',
              },
              {
                format: 'Format 2 — Bull/Bear Analysis',
                desc: 'Balanced bull/bear case analysis with growth drivers, risk factors, and a final verdict with buy/hold/sell recommendation.',
                vars: '{symbol}, {price}, {direction}, {change_pct}',
                icon: 'compare_arrows',
              },
              {
                format: 'Format 3 — Technical View',
                desc: 'Technical analysis focused format with price box, trend direction, key technical points, and entry/target/stop levels.',
                vars: '{symbol}, {price}, {emoji}, {change}',
                icon: 'candlestick_chart',
              },
            ].map((item) => (
              <div key={item.format} className="glass-panel rounded-2xl border border-[#41475b]/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#99f7ff] text-xl">{item.icon}</span>
                  <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">{item.format}</h3>
                </div>
                <p className="text-[#a5aac2] text-xs leading-relaxed mb-3">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.vars.split(', ').map((v) => (
                    <span key={v} className="text-[9px] px-2 py-0.5 rounded bg-[#99f7ff]/10 text-[#99f7ff] font-mono">{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streaming Architecture */}
        <div className="mb-12">
          <h2 className="text-lg font-headline font-bold text-white mb-6 uppercase tracking-wider">Streaming Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: 'sync', title: 'SSE Streaming', desc: 'Server-Sent Events deliver AI output character by character via EventSourceResponse, providing immediate visual feedback as analysis generates.' },
              { icon: 'speed', title: 'Hot-Reload Prompts', desc: 'Prompt templates stored in database with in-memory + Redis caching. Admin changes take effect immediately without server restart.' },
              { icon: 'casino', title: 'Random Selection', desc: 'Three distinct analysis formats are randomly selected per request, ensuring diverse outputs and preventing repetitive responses.' },
              { icon: 'tune', title: 'Configurable Parameters', desc: 'Temperature, token limits, frequency/presence penalty, and all prompt templates are fully customizable via admin settings panel.' },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-xl border border-[#41475b]/30 p-5 flex gap-4">
                <span className="material-symbols-outlined text-[#99f7ff] text-lg shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <h4 className="text-xs font-headline font-bold text-white uppercase tracking-wider mb-1">{item.title}</h4>
                  <p className="text-[#a5aac2] text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#99f7ff] text-[#070d1f] font-headline font-bold rounded-full text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-base">bolt</span>
          Try Analysis
        </Link>
      </main>
    </div>
  )
}
