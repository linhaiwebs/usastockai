'use client'

const features = [
  {
    icon: '●',
    title: 'Real-time Data',
    description: 'Millisecond-latency quotes from major exchanges worldwide'
  },
  {
    icon: '●',
    title: 'AI Analysis',
    description: 'DeepSeek R1 reasoning model for professional insights'
  },
  {
    icon: '●',
    title: 'Technical Charts',
    description: 'MACD, RSI, Bollinger Bands and 50+ indicators'
  },
  {
    icon: '●',
    title: 'Risk Metrics',
    description: 'Smart risk assessment and portfolio evaluation'
  }
]

/**
 * Feature Grid - Stripe style with light cards and blue-tinted shadows
 * Uses sohne-var at weight 300 with ss01 stylistic set
 */
export function FeatureGrid() {
  return (
    <div className="mb-12">
      <h2 
        className="text-sub-heading-large text-deep-navy mb-6 text-center"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Why choose our platform
      </h2>
      
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-5 bg-white border border-border-default rounded-relaxed hover:shadow-elevated transition-all group"
          >
            <div className="flex items-start gap-4">
              <div 
                className="text-stripe-purple text-lg mt-1 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ fontFeatureSettings: '"ss01"' }}
              >
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 
                  className="text-sub-heading text-deep-navy mb-2 group-hover:text-stripe-purple transition-colors"
                  style={{ fontFeatureSettings: '"ss01"' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-caption text-body-text leading-relaxed"
                  style={{ fontFeatureSettings: '"ss01"' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
