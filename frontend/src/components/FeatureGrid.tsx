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
 * Feature Grid - Wise style with clean cards and typography
 */
export function FeatureGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-near-black mb-4 flex items-center gap-2" style={{ lineHeight: '0.85', fontFeatureSettings: '"calt"' }}>
        <span className="text-xl">✨</span>
        Core Features
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-5 bg-white border border-near-black/10 rounded-card-large hover:shadow-ring transition-all"
            style={{ fontFeatureSettings: '"calt"' }}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-near-black mb-1.5 text-base">{feature.title}</h3>
            <p className="text-sm text-gray leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
