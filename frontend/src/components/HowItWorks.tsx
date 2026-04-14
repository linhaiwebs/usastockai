const steps = [
  {
    step: '01',
    title: 'Enter a Stock Symbol',
    description: 'Type any US stock ticker (like AAPL, TSLA, NVDA) into the search bar.',
  },
  {
    step: '02',
    title: 'AI Scans the Market',
    description: 'Our AI instantly scans thousands of news articles, social posts, and financial data sources.',
  },
  {
    step: '03',
    title: 'Get Your Analysis',
    description: 'Receive a comprehensive AI-generated sentiment analysis with actionable insights in seconds.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-surface-alt">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Three Steps to Smarter Decisions
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            From ticker to insight in under 3 seconds. No signup, no credit card.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border-default" />
              )}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-extrabold text-brand">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{s.title}</h3>
              <p className="text-text-secondary leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
