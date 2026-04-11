'use client'

import { useState } from 'react'

const features = [
  {
    id: 'technical',
    icon: '📊',
    title: '技术面',
    shortDesc: 'RSI/MACD/均线',
    fullDesc: '深度分析RSI、MACD、移动平均线等技术指标，识别买卖信号和市场趋势。',
    color: '#1b61c9'
  },
  {
    id: 'fundamental',
    icon: '💰',
    title: '基本面',
    shortDesc: 'PE/ROE/负债率',
    fullDesc: '评估市盈率、净资产收益率、负债率等核心财务指标，发现价值投资机会。',
    color: '#006400'
  },
  {
    id: 'sentiment',
    icon: '💭',
    title: '情绪面',
    shortDesc: 'Reddit/新闻/推特',
    fullDesc: '追踪Reddit、财经新闻、Twitter等社交媒体情绪，洞察市场热度。',
    color: '#9333ea'
  },
  {
    id: 'risk',
    icon: '⚠️',
    title: '风险拆解',
    shortDesc: '行业/财报/波动',
    fullDesc: '评估行业风险、财报预警、价格波动等多维度风险因素。',
    color: '#c13515'
  }
]

/**
 * Feature Grid - 2x2 Grid - Airtable style
 * Technical, Fundamental, Sentiment, Risk cards
 */
export function FeatureGrid() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="mb-6">
      <h2 
        className="text-sub-heading text-deep-navy mb-4 text-center"
        style={{ letterSpacing: '0' }}
      >
        功能速览
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => toggleExpand(feature.id)}
            className={`p-3 bg-white border border-border-default rounded-relaxed cursor-pointer transition-all hover:shadow-card ${
              expandedId === feature.id ? 'row-span-2' : ''
            }`}
          >
            {/* Icon */}
            <div className="text-2xl mb-2">{feature.icon}</div>
            
            {/* Title */}
            <h3 
              className="text-card-title text-deep-navy mb-1"
              style={{ letterSpacing: '0.12px' }}
            >
              {feature.title}
            </h3>
            
            {/* Short description */}
            <p 
              className="text-small text-text-secondary"
              style={{ letterSpacing: '0.08px' }}
            >
              {feature.shortDesc}
            </p>
            
            {/* Expanded content */}
            {expandedId === feature.id && (
              <div className="mt-3 pt-3 border-t border-border-light">
                <p 
                  className="text-caption text-text-secondary leading-relaxed"
                  style={{ letterSpacing: '0.18px' }}
                >
                  {feature.fullDesc}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
