'use client'

const features = [
  {
    icon: '📊',
    title: 'Real-time Quotes',
    description: 'Millisecond latency, global stock market data'
  },
  {
    icon: '🤖',
    title: 'AI Analysis',
    description: 'DeepSeek R1 reasoning model, professional investment advice'
  },
  {
    icon: '📈',
    title: 'Technical Indicators',
    description: 'MACD, RSI, Bollinger Bands and more'
  },
  {
    icon: '🎯',
    title: 'Risk Assessment',
    description: 'Smart risk control, investment risk evaluation'
  }
]

/**
 * Feature Grid
 */
export function FeatureGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        Core Features
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 bg-surface border border-gray-700 rounded-xl hover:border-primary transition-all"
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-text mb-1">{feature.title}</h3>
            <p className="text-sm text-text-secondary">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
