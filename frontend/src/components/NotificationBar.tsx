'use client'

import { useState, useEffect } from 'react'

/**
 * Module 3: Real-time Sentiment Indicators - ClickHouse Design System
 * Three cards: Fear Index, Today's Hot Words, Sentiment Ratio
 * Auto-refresh every 5 seconds (simulated)
 * Pure black canvas, charcoal borders, neon accents
 */
export function NotificationBar() {
  const [fearIndex, setFearIndex] = useState(32)
  const [fearLabel, setFearLabel] = useState('Fear')
  const [hotWords, setHotWords] = useState(['#AI', '#RateHike', '#Earnings'])
  const [bullishPercent, setBullishPercent] = useState(63)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate data refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true)
      
      // Simulate data changes
      setTimeout(() => {
        setFearIndex(Math.floor(Math.random() * 20) + 25)
        setFearLabel(['Fear', 'Greed', 'Neutral'][Math.floor(Math.random() * 3)])
        setHotWords([
          ['#AI', '#Tech', '#Earnings'][Math.floor(Math.random() * 3)],
          ['#RateHike', '#Fed', '#Inflation'][Math.floor(Math.random() * 3)],
          ['#Earnings', '#GDP', '#Jobs'][Math.floor(Math.random() * 3)],
        ])
        setBullishPercent(Math.floor(Math.random() * 30) + 50)
        setIsRefreshing(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getFearColor = (label: string) => {
    switch (label) {
      case 'Fear': return 'text-danger-red'
      case 'Greed': return 'text-positive-green'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div className="mb-8">
      {/* Three cards in a row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card 1: Market Fear Index */}
        <div className={`border border-charcoal bg-surface rounded-comfortable p-4 ${isRefreshing ? 'opacity-70' : ''} transition-opacity`}>
          <div className="uppercase-label mb-2">
            Market Fear Index
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sub-heading font-bold text-text-primary">
              {fearIndex}
            </span>
            <span className={`text-body font-semibold ${getFearColor(fearLabel)}`}>
              ({fearLabel})
            </span>
          </div>
        </div>

        {/* Card 2: Today's Hot Words */}
        <div className={`border border-charcoal bg-surface rounded-comfortable p-4 ${isRefreshing ? 'opacity-70' : ''} transition-opacity`}>
          <div className="uppercase-label mb-2">
            Today's Hot Words
          </div>
          <div className="flex flex-wrap gap-2">
            {hotWords.map((word, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-surface-elevated border border-charcoal rounded-sharp text-caption text-neon-volt"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Sentiment Ratio */}
        <div className={`border border-charcoal bg-surface rounded-comfortable p-4 ${isRefreshing ? 'opacity-70' : ''} transition-opacity`}>
          <div className="uppercase-label mb-2">
            Sentiment Ratio
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold text-positive-green">
              {bullishPercent}% Bullish
            </span>
            <span className="text-text-muted">/</span>
            <span className="text-body font-semibold text-danger-red">
              {100 - bullishPercent}% Bearish
            </span>
          </div>
        </div>
      </div>

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="mt-2 text-caption text-text-muted text-center animate-pulse">
          Updating data...
        </div>
      )}
    </div>
  )
}
