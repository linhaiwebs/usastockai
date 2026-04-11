'use client'

import { useState, useEffect } from 'react'

interface FreemiumHookProps {
  onUpgrade?: () => void
}

/**
 * Freemium Hook Component - Airbnb style
 * Shows free diagnosis offer, remaining count, and upgrade preview
 */
export function FreemiumHook({ onUpgrade }: FreemiumHookProps) {
  const [freeCount, setFreeCount] = useState(3)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Check localStorage for free count
    const stored = localStorage.getItem('freeAnalysisCount')
    if (stored) {
      setFreeCount(parseInt(stored, 10))
    }
  }, [])

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('freeAnalysisCount', freeCount.toString())
  }, [freeCount])

  const handleUpgrade = () => {
    onUpgrade?.()
  }

  return (
    <div className="mb-12">
      {/* Free diagnosis banner */}
      <div className="bg-surface rounded-card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 
              className="text-feature-title text-text-primary mb-1"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              Free diagnosis — no credit card required
            </h3>
            <p 
              className="text-body text-text-secondary"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              Start analyzing stocks today with our AI-powered tools
            </p>
          </div>
          <div className="hidden md:block">
            <svg className="w-12 h-12 text-rausch opacity-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>

        {/* Free count remaining */}
        <div className="flex items-center gap-2 p-3 bg-white rounded-standard">
          <svg className="w-5 h-5 text-rausch" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p 
            className="text-ui-medium text-text-primary"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Today's free analysis remaining: <span className="text-rausch font-semibold">{freeCount}</span>
          </p>
        </div>
      </div>

      {/* Upgrade preview - blurred/locked state */}
      <div className="relative">
        <div className="bg-white rounded-card shadow-card p-6 filter blur-sm pointer-events-none select-none">
          <div className="flex items-center justify-between mb-4">
            <h4 
              className="text-card-heading text-text-primary"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              Advanced Technical Analysis
            </h4>
            <span className="px-3 py-1 bg-luxe-purple text-white text-badge rounded-badge">
              PRO
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-circle bg-positive-green flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-body text-text-secondary">10+ Technical Indicators (MACD, RSI, Bollinger Bands)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-circle bg-positive-green flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-body text-text-secondary">Real-time Market Sentiment Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-circle bg-positive-green flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-body text-text-secondary">Portfolio Risk Assessment</span>
            </div>
          </div>
        </div>

        {/* Overlay with upgrade button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-card backdrop-blur-sm">
          <svg className="w-12 h-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p 
            className="text-ui-medium text-text-primary mb-4 text-center"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Unlock advanced features
          </p>
          <button
            onClick={handleUpgrade}
            className="px-6 py-3 bg-text-primary text-white rounded-standard font-medium hover:bg-black active:scale-[0.98] transition-all"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Upgrade to Pro — $9.99/mo
          </button>
        </div>
      </div>
    </div>
  )
}

// Export a function to decrement free count
export const useFreeCount = () => {
  const [freeCount, setFreeCount] = useState(3)

  useEffect(() => {
    const stored = localStorage.getItem('freeAnalysisCount')
    if (stored) {
      setFreeCount(parseInt(stored, 10))
    }
  }, [])

  const decrementCount = () => {
    setFreeCount((prev) => {
      const newCount = Math.max(0, prev - 1)
      localStorage.setItem('freeAnalysisCount', newCount.toString())
      return newCount
    })
  }

  const resetCount = () => {
    const newCount = 3
    setFreeCount(newCount)
    localStorage.setItem('freeAnalysisCount', newCount.toString())
  }

  return { freeCount, decrementCount, resetCount }
}
