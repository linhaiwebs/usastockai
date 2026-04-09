'use client'

const features = [
  {
    icon: '📊',
    title: '实时行情',
    description: '毫秒级延迟，全球股市实时数据'
  },
  {
    icon: '🤖',
    title: 'AI 分析',
    description: 'DeepSeek R1 推理模型，专业投资建议'
  },
  {
    icon: '📈',
    title: '技术指标',
    description: 'MACD、RSI、布林带等专业指标'
  },
  {
    icon: '🎯',
    title: '风险提示',
    description: '智能风控，投资风险评估'
  }
]

/**
 * 功能特性网格
 */
export function FeatureGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        核心功能
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
