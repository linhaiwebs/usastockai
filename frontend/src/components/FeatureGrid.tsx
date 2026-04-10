'use client'

const features = [
  {
    icon: '⚡',
    title: 'Real-time Data',
    description: 'Millisecond-latency quotes from major exchanges worldwide'
  },
  {
    icon: '🤖',
    title: 'AI Analysis',
    description: 'DeepSeek R1 reasoning model for professional insights'
  },
  {
    icon: '📊',
    title: 'Technical Charts',
    description: 'MACD, RSI, Bollinger Bands and 50+ indicators'
  },
  {
    icon: '🛡️',
    title: 'Risk Metrics',
    description: 'Smart risk assessment and portfolio evaluation'
  }
]

/**
 * Feature Grid - Revolut style with horizontal layout
 * No shadows, flat design with alternating dark/light sections
 */
export function FeatureGrid() {
  return (
    <section className="py-20 px-4 bg-surface">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-display-large font-medium text-revolut-dark mb-12 text-center"
          style={{ 
            lineHeight: '1.21',
            letterSpacing: '-0.48px'
          }}
        >
          Why choose our platform
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-white border-2 border-gray-tone rounded-card hover:border-revolut-dark transition-colors group"
            >
              <div className="flex items-start gap-6">
                <div 
                  className="text-4xl flex-shrink-0"
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 
                    className="text-card-title font-medium text-revolut-dark mb-3 group-hover:text-revolut-blue transition-colors"
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-body text-mid-slate"
                    style={{ letterSpacing: '0.24px' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
