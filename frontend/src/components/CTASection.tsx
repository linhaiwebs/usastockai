export function CTASection() {
  return (
    <section className="py-20 bg-brand">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Discover Market Insights?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Join thousands of investors using AI-powered sentiment analysis to make smarter decisions. Start for free today.
        </p>
        <button
          onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-8 py-4 bg-white text-brand font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-card-hover text-lg"
        >
          Analyze a Stock Now
        </button>
        <p className="mt-4 text-sm text-white/60">No account required. 10 free scans per day.</p>
      </div>
    </section>
  )
}
