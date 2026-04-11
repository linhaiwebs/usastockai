'use client'

/**
 * Comparison Matrix Component - BMW Design System
 * Three-column comparison table with rainbow gradient header
 * Sharp corners, tight line-heights
 */
export function ComparisonMatrix() {
  const features = [
    {
      feature: 'Real-time Sentiment',
      us: true,
      others: false,
    },
    {
      feature: 'No Ads',
      us: true,
      others: false,
    },
    {
      feature: 'Completely Free',
      us: true,
      others: false,
    },
    {
      feature: 'Price',
      usValue: 'Free',
      othersValue: '$50-200/mo',
      us: true,
      others: false,
    },
  ]

  return (
    <div className="mb-8">
      <div className="bg-white border border-border-default overflow-hidden">
        {/* Header - Rainbow gradient */}
        <div className="grid grid-cols-3 border-b border-border-default">
          <div className="p-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
            <span className="text-body text-white font-semibold uppercase">
              Feature
            </span>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-400 via-green-400 to-teal-400">
            <span className="text-body text-white font-semibold uppercase text-center block">
              StockAI
            </span>
          </div>
          <div className="p-4 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400">
            <span className="text-body text-white font-semibold uppercase text-center block">
              Traditional
            </span>
          </div>
        </div>

        {/* Features */}
        {features.map((item, index) => (
          <div 
            key={index}
            className="grid grid-cols-3 border-b border-border-default last:border-b-0"
          >
            {/* Feature name */}
            <div className="p-4 bg-surface">
              <span className="text-body text-text-primary">
                {item.feature}
              </span>
            </div>

            {/* Our platform - always highlighted */}
            <div className="p-4 flex justify-center items-center border-l border-border-default">
              {item.usValue ? (
                <span className="text-body font-semibold text-positive-green">
                  {item.usValue}
                </span>
              ) : (
                <div className="w-6 h-6 bg-positive-green flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Others */}
            <div className="p-4 flex justify-center items-center border-l border-border-default">
              {item.othersValue ? (
                <span className="text-body text-text-secondary">
                  {item.othersValue}
                </span>
              ) : (
                <div className="w-6 h-6 bg-border-default flex items-center justify-center">
                  <span className="text-caption text-text-disabled">—</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
