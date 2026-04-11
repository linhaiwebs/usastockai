'use client'

/**
 * Brand Section - Revolut style compact dark background
 * Minimal, flat design with pill badges
 */
export function BrandSection() {
  const brands = [
    { name: 'Nasdaq', desc: 'Real-time quotes' },
    { name: 'NYSE', desc: 'Market data' },
    { name: 'S&P 500', desc: 'Index tracking' },
    { name: 'Yahoo Finance', desc: 'Historical data' },
  ]

  return (
    <section className="py-10 px-4 bg-revolut-dark">
      <div className="max-w-6xl mx-auto">
        <p 
          className="text-center text-caption text-white opacity-70 mb-6 uppercase tracking-wider"
        >
          Powered by trusted data sources
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="px-4 py-3 bg-white/5 border-2 border-white/10 rounded-card backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <p 
                className="text-body font-medium text-white mb-0.5"
              >
                {brand.name}
              </p>
              <p 
                className="text-caption-small text-white opacity-60"
              >
                {brand.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
