export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-light via-white to-surface-alt">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              AI-Powered Stock Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-6">
              Discover What the Market Is{' '}
              <span className="text-brand">Really Saying</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
              AI scans 10,000+ articles and social posts in real time. Get instant, deep sentiment analysis for any US stock — free, no account needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-3.5 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors shadow-card-hover"
              >
                Start Free Analysis
              </button>
              <a
                href="#how-it-works"
                className="px-7 py-3.5 border border-border-default text-text-primary font-semibold rounded-lg hover:bg-surface-alt transition-colors text-center"
              >
                See How It Works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                10 free scans/day
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                No account required
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Real-time data
              </span>
            </div>
          </div>

          {/* Right visual - decorative chart illustration */}
          <div className="hidden md:flex justify-center animate-slide-up">
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-card-hover p-6 border border-border-default">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-text-muted">AI Sentiment</p>
                    <p className="text-2xl font-bold text-text-primary">AAPL</p>
                  </div>
                  <span className="px-2.5 py-1 bg-card-green text-success text-xs font-semibold rounded-full">Bullish</span>
                </div>
                {/* Chart bars */}
                <div className="flex items-end gap-1.5 h-32 mb-4">
                  {[40, 55, 35, 60, 75, 50, 80, 65, 90, 70, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: h > 70 ? '#10b981' : h > 50 ? '#137fec' : '#e2e8f0' }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>12h ago</span>
                  <span>Now</span>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-card">
                Live
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
