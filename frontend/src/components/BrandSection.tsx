'use client'

/**
 * Brand Section - Stripe style with dark brand background and subtle badges
 */
export function BrandSection() {
  const brands = [
    { name: 'Nasdaq', desc: 'Real-time quotes' },
    { name: 'NYSE', desc: 'Market data' },
    { name: 'S&P 500', desc: 'Index tracking' },
    { name: 'Yahoo Finance', desc: 'Historical data' },
  ]

  return (
    <section className="mb-12 -mx-4 px-4 py-12 bg-brand-dark">
      <div className="max-w-[480px] mx-auto">
        <p 
          className="text-center text-caption text-white opacity-70 mb-6 uppercase tracking-wider"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          Powered by trusted data sources
        </p>
        <div className="grid grid-cols-2 gap-3">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-standard backdrop-blur-sm"
            >
              <p 
                className="text-sm text-white font-normal mb-0.5"
                style={{ fontFeatureSettings: '"ss01"' }}
              >
                {brand.name}
              </p>
              <p 
                className="text-caption-small text-white opacity-50"
                style={{ fontFeatureSettings: '"ss01"' }}
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
