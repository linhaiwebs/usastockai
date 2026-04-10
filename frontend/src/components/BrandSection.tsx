'use client'

/**
 * Brand Section - Wise style with subtle badges
 */
export function BrandSection() {
  const brands = [
    'Nasdaq', 'NYSE', 'S&P 500', 'Dow Jones', 'Yahoo Finance'
  ]

  return (
    <div className="mb-8 py-6">
      <p className="text-center text-gray text-sm mb-4 font-semibold" style={{ fontFeatureSettings: '"calt"' }}>
        Data Sources
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="px-4 py-2 bg-light-mint border border-wise-green/20 rounded-pill text-xs text-dark-green font-semibold"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  )
}
