'use client'

/**
 * Brand Section
 */
export function BrandSection() {
  const brands = [
    'Nasdaq', 'NYSE', 'S&P 500', 'Dow Jones', 'Yahoo Finance'
  ]

  return (
    <div className="mb-8 py-6">
      <p className="text-center text-text-secondary text-sm mb-4">
        Data Sources
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="px-3 py-1.5 bg-surface border border-gray-700 rounded-lg text-xs text-text-secondary"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  )
}
