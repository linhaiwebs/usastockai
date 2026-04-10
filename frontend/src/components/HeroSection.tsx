'use client'

/**
 * Hero Section - Revolut style compact layout
 * Uses Inter at weight 500, negative letter-spacing, near-black headings
 * NO shadows - depth through color contrast only
 */
export function HeroSection() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main headline - Revolut stadium-scale at 48px, weight 500 */}
        <h1 
          className="text-display-hero font-medium text-revolut-dark mb-4 tracking-tight"
          style={{ 
            lineHeight: '1.00',
            letterSpacing: '-0.48px'
          }}
        >
          AI-Powered Stock
          <br />
          <span className="text-revolut-blue">Intelligence</span>
        </h1>
        
        {/* Subtitle - Inter body large, positive letter-spacing */}
        <p 
          className="text-body-large text-mid-slate max-w-2xl mx-auto mb-8"
          style={{ 
            lineHeight: '1.50'
          }}
        >
          Real-time market data powered by advanced AI. Make informed investment 
          decisions with professional-grade analysis tools.
        </p>
        
        {/* CTA Pills - Revolut style */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button className="revolut-btn-primary min-w-[160px]">
            Get Started
          </button>
          <button className="revolut-btn-outlined min-w-[160px]">
            Learn More
          </button>
        </div>
        
        {/* Trust indicators - minimal badges */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal"></div>
            <span className="text-caption text-mid-slate">10,000+ Users</span>
          </div>
          <div className="w-px h-3 bg-gray-tone"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-revolut-blue"></div>
            <span className="text-caption text-mid-slate">Real-time Data</span>
          </div>
          <div className="w-px h-3 bg-gray-tone"></div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal"></div>
            <span className="text-caption text-mid-slate">AI Insights</span>
          </div>
        </div>
      </div>
    </section>
  )
}
