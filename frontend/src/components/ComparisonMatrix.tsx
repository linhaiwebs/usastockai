'use client'

/**
 * Comparison Matrix Component - Mobile-first with Airbnb style
 * Three-column comparison table highlighting product advantages
 */
export function ComparisonMatrix() {
  const features = [
    {
      feature: 'AI Summary',
      us: true,
      others: false,
    },
    {
      feature: 'Real-time Sentiment',
      us: true,
      others: false,
    },
    {
      feature: 'Risk Breakdown',
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
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-surface border-b border-border-light">
          <div 
            className="text-body text-text-secondary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Feature
          </div>
          <div 
            className="text-center text-ui-semibold text-text-primary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            AI Stock Doctor
          </div>
          <div 
            className="text-center text-ui-medium text-text-secondary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Traditional
          </div>
        </div>

        {/* Features */}
        {features.map((item, index) => (
          <div 
            key={index}
            className="grid grid-cols-3 gap-2 p-4 border-b border-border-light last:border-b-0"
          >
            {/* Feature name */}
            <div 
              className="text-body-medium text-text-primary"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              {item.feature}
            </div>

            {/* Our platform - always highlighted */}
            <div className="flex justify-center items-center">
              {item.usValue ? (
                <span 
                  className="text-ui-semibold text-positive-green"
                  style={{ fontFeatureSettings: '"salt"' }}
                >
                  {item.usValue}
                </span>
              ) : (
                <div className="w-6 h-6 rounded-circle bg-positive-green flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Others */}
            <div className="flex justify-center items-center">
              {item.othersValue ? (
                <span 
                  className="text-ui-medium text-text-secondary"
                  style={{ fontFeatureSettings: '"salt"' }}
                >
                  {item.othersValue}
                </span>
              ) : (
                <div className="w-6 h-6 rounded-circle bg-border-default flex items-center justify-center">
                  <span className="text-small text-text-disabled">—</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="p-4 bg-surface">
          <p 
            className="text-small text-text-secondary text-center"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            All features 100% free
          </p>
        </div>
      </div>
    </div>
  )
}
