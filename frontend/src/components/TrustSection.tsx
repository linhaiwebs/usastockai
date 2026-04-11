'use client'

/**
 * Trust Section - Mobile-first with Airbnb style
 * Three-column trust indicators with data sources
 */
export function TrustSection() {
  const trustItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Real-time Updates',
      description: 'Data refreshed every minute',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'No Credit Card',
      description: '100% free, no hidden fees',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Privacy First',
      description: 'Your data stays secure',
    },
  ]

  const dataSources = [
    'Polygon',
    'Finnhub',
    'Reddit API',
  ]

  return (
    <div className="mb-8">
      {/* Trust indicators - Three columns */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {trustItems.map((item, index) => (
          <div 
            key={index}
            className="bg-white rounded-card p-4 shadow-card text-center"
          >
            <div className="w-12 h-12 rounded-circle bg-surface mx-auto mb-3 flex items-center justify-center text-text-primary">
              {item.icon}
            </div>
            <h3 
              className="text-small font-semibold text-text-primary mb-1"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              {item.title}
            </h3>
            <p 
              className="text-small text-text-secondary text-xs"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Data sources */}
      <div className="text-center">
        <p 
          className="text-small text-text-secondary mb-2"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          Data sources:
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {dataSources.map((source, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-surface rounded-badge text-small text-text-secondary"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              {source}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
