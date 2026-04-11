'use client'

/**
 * Hero Section - Revolut style ultra compact layout
 * Uses Inter at weight 500, negative letter-spacing, near-black headings
 * NO shadows - depth through color contrast only
 */
export function HeroSection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main headline - Revolut stadium-scale at 36px, weight 500 */}
        <h1 
          className="text-display-hero font-medium text-revolut-dark mb-3 tracking-tight"
          style={{ 
            lineHeight: '1.00',
            letterSpacing: '-0.36px'
          }}
        >
          AI-Powered Stock
          <br />
          <span className="text-revolut-blue">Intelligence</span>
        </h1>
        
        {/* Subtitle - Inter body large */}
        <p 
          className="text-body-large text-mid-slate max-w-2xl mx-auto mb-6"
          style={{ 
            lineHeight: '1.50'
          }}
        >
          Real-time market data powered by advanced AI. Make informed investment 
          decisions with professional-grade analysis tools.
        </p>
        
        {/* CTA Pills - Revolut style */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <button className="revolut-btn-primary min-w-[140px]">
            Get Started
          </button>
          <button className="revolut-btn-outlined min-w-[140px]">
            Learn More
          </button>
        </div>
        
        {/* Trust indicators - minimal badges */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-teal"></div>
            <span className="text-caption text-mid-slate">10,000+ Users</span>
          </div>
          <div className="w-px h-2.5 bg-gray-tone"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-revolut-blue"></div>
            <span className="text-caption text-mid-slate">Real-time Data</span>
          </div>
          <div className="w-px h-2.5 bg-gray-tone"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-teal"></div>
            <span className="text-caption text-mid-slate">AI Insights</span>
          </div>
        </div>
      </div>
    </section>
  )
}
