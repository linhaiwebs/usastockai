'use client'

import { useState, useEffect } from 'react'

interface FixedBottomBarProps {
  onNewDiagnosis?: () => void
  hasCompletedDiagnosis?: boolean
  lastDiagnosis?: string
}

/**
 * Module 5: Fixed Bottom Bar - ClickHouse Design System
 * Left text: "📊 Compare sentiment across 3 stocks"
 * Right button: "New scan →"
 * Behavior: clear input and cache
 * Light semi-transparent background, fixed to bottom
 */
export function FixedBottomBar({ onNewDiagnosis }: FixedBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      // Show after scrolling down a bit
      setIsVisible(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNewScan = () => {
    // Clear any cached modal data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('modalCache')
    }
    // Call parent handler to clear input
    onNewDiagnosis?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-charcoal animate-slide-up">
      <div className="max-w-[1200px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Text */}
          <div className="flex items-center gap-2 text-body text-text-primary">
            <span>📊</span>
            <span>Compare sentiment across 3 stocks</span>
          </div>
          
          {/* Right: New scan button */}
          <button
            onClick={handleNewScan}
            className="px-5 py-2 bg-neon-volt text-black font-semibold rounded-sharp hover:bg-neon-volt-hover transition-colors"
          >
            New scan →
          </button>
        </div>
      </div>
    </div>
  )
}

// Keep ContextualCTA as alias for backwards compatibility
export function ContextualCTA({ onUpgrade, hasCompletedDiagnosis }: { onUpgrade?: () => void; hasCompletedDiagnosis?: boolean }) {
  return <FixedBottomBar onNewDiagnosis={onUpgrade} hasCompletedDiagnosis={hasCompletedDiagnosis} />
}
