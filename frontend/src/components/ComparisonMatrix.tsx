'use client'

/**
 * Comparison Matrix Component - Airbnb style
 * Compares our product with competitors using green checks and red Xs
 */
export function ComparisonMatrix() {
  const features = [
    {
      feature: 'AI-Powered Diagnosis',
      us: true,
      others: false,
      highlight: true
    },
    {
      feature: 'Real-time Market Sentiment',
      us: true,
      others: false,
      highlight: true
    },
    {
      feature: 'Risk Breakdown Analysis',
      us: true,
      others: false,
      highlight: true
    },
    {
      feature: 'Results in Seconds',
      us: true,
      others: false,
      highlight: false
    },
    {
      feature: 'Free Tier Available',
      us: true,
      others: false,
      highlight: false
    },
    {
      feature: 'Plain English Explanations',
      us: true,
      others: false,
      highlight: false
    },
    {
      feature: 'Expensive Subscription',
      us: false,
      others: true,
      highlight: false
    },
    {
      feature: 'Complex Interface',
      us: false,
      others: true,
      highlight: false
    }
  ]

  return (
    <div className="mb-12">
      <h2 
        className="text-section-heading text-text-primary mb-2 text-center"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Why choose our platform
      </h2>
      <p 
        className="text-body text-text-secondary mb-8 text-center max-w-md mx-auto"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        See how we compare to traditional analysis tools
      </p>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-surface border-b border-border-light">
          <div></div>
          <div 
            className="text-center text-ui-semibold text-text-primary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Our Platform
          </div>
          <div 
            className="text-center text-ui-medium text-text-secondary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Traditional Tools
          </div>
        </div>

        {/* Features */}
        {features.map((item, index) => (
          <div 
            key={index}
            className={`grid grid-cols-3 gap-4 p-4 border-b border-border-light last:border-b-0 ${
              item.highlight ? 'bg-rausch/5' : ''
            }`}
          >
            {/* Feature name */}
            <div 
              className={`text-body ${item.highlight ? 'text-text-primary font-medium' : 'text-text-secondary'}`}
              style={{ fontFeatureSettings: '"salt"' }}
            >
              {item.feature}
            </div>

            {/* Our platform */}
            <div className="flex justify-center">
              {item.us ? (
                <div className={`w-6 h-6 rounded-circle flex items-center justify-center ${
                  item.highlight ? 'bg-positive-green' : 'bg-positive-green/20'
                }`}>
                  <svg className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-positive-green'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-circle bg-danger-red/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-danger-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Others */}
            <div className="flex justify-center">
              {item.others ? (
                <div className="w-6 h-6 rounded-circle bg-danger-red/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-danger-red" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-circle bg-border-default flex items-center justify-center">
                  <span className="text-small text-text-disabled">—</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-text-primary">
          <div></div>
          <div className="text-center">
            <p className="text-ui-semibold text-white mb-1" style={{ fontFeatureSettings: '"salt"' }}>
              Fast & Affordable
            </p>
            <p className="text-small text-white/60" style={{ fontFeatureSettings: '"salt"' }}>
              Free to start
            </p>
          </div>
          <div className="text-center">
            <p className="text-ui-medium text-white/60 mb-1" style={{ fontFeatureSettings: '"salt"' }}>
              Slow & Expensive
            </p>
            <p className="text-small text-white/40" style={{ fontFeatureSettings: '"salt"' }}>
              $50-200/mo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
