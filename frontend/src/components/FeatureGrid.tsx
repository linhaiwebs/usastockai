const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Real-Time Scanning',
    description: 'AI continuously monitors 10,000+ news sources and social media posts to capture market-moving information as it happens.',
    bg: 'card-blue',
    color: 'brand',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI Deep Analysis',
    description: 'Powered by advanced AI models that understand financial context, detect sentiment shifts, and identify emerging trends before they go mainstream.',
    bg: 'card-purple',
    color: 'text-purple-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Instant Results',
    description: 'Get comprehensive analysis in 1-3 seconds. No waiting, no loading — just immediate, actionable insights delivered right when you need them.',
    bg: 'card-green',
    color: 'text-emerald-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Trusted Sources',
    description: 'We aggregate from established financial news outlets, SEC filings, and verified social accounts — never random internet noise.',
    bg: 'card-amber',
    color: 'text-amber-600',
  },
]

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything You Need to Stay Ahead
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Our AI-powered platform gives you the edge with comprehensive, real-time stock intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border-default bg-white hover:shadow-card-hover transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl bg-${f.bg} flex items-center justify-center mb-4 text-${f.color} group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{f.title}</h3>
              <p className="text-text-secondary leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
