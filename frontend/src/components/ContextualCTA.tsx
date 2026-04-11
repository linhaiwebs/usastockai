'use client'

import { useState, useEffect } from 'react'

interface ContextualCTAProps {
  onUpgrade?: () => void
  hasCompletedDiagnosis?: boolean
}

/**
 * Contextual CTA Component - Airbnb style
 * Shows floating bar at 50% scroll, dynamic upgrade card after diagnosis
 */
export function ContextualCTA({ onUpgrade, hasCompletedDiagnosis = false }: ContextualCTAProps) {
  const [showFloatingBar, setShowFloatingBar] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollPercentage(scrollPercent)

      // Show floating bar when scrolled past 50%
      if (scrollPercent > 50 && !hasCompletedDiagnosis) {
        setShowFloatingBar(true)
      } else if (scrollPercent <= 50) {
        setShowFloatingBar(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasCompletedDiagnosis])

  const handleUpgrade = () => {
    onUpgrade?.()
  }

  // After diagnosis - show upgrade card
  if (hasCompletedDiagnosis) {
    return (
      <div className="mb-12">
        <div className="bg-gradient-brand rounded-card p-6 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-circle blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-circle blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 
                  className="text-card-heading text-white mb-2"
                  style={{ fontFeatureSettings: '"salt"' }}
                >
                  Unlock Advanced Analysis
                </h3>
                <p 
                  className="text-body text-white/80 max-w-sm"
                  style={{ fontFeatureSettings: '"salt"' }}
                >
                  Get access to 10+ technical indicators, real-time sentiment analysis, and portfolio risk assessment.
                </p>
              </div>
              <span className="px-3 py-1 bg-white/20 text-white text-badge rounded-badge">
                LIMITED OFFER
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-white text-rausch rounded-standard font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                Upgrade to Pro — $9.99/mo
              </button>
              <p 
                className="text-small text-white/60"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                Cancel anytime • No commitment
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Floating bar at 50% scroll
  if (!showFloatingBar) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light shadow-hover animate-slide-up">
      <div className="max-w-[520px] mx-auto px-5 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-circle bg-rausch/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rausch" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <p 
                className="text-ui-medium text-text-primary truncate"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                Ready to diagnose your portfolio?
              </p>
              <p 
                className="text-small text-text-secondary truncate"
                style={{ fontFeatureSettings: '"salt"' }}
              >
                Get AI-powered insights in seconds
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              // Scroll to top
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="px-5 py-2 bg-rausch text-white rounded-standard font-medium hover:bg-rausch-deep active:scale-[0.98] transition-all whitespace-nowrap"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Try Now
          </button>
        </div>
      </div>
    </div>
  )
}
