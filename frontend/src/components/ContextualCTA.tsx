'use client'

import { useState, useEffect } from 'react'

interface FixedBottomBarProps {
  onNewDiagnosis?: () => void
  hasCompletedDiagnosis?: boolean
}

/**
 * Fixed Bottom Bar - Mobile-first with Airbnb style
 * Desktop: Left text + Right button
 * Mobile: Full-width button
 */
export function FixedBottomBar({ onNewDiagnosis, hasCompletedDiagnosis = false }: FixedBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      // Show after scrolling down one screen height
      setIsVisible(scrollTop > windowHeight * 0.3)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    onNewDiagnosis?.()
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light shadow-hover animate-slide-up">
      <div className="max-w-[520px] mx-auto px-5 py-3">
        {/* Desktop: Text + Button */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p 
              className="text-ui-medium text-text-primary truncate"
              style={{ fontFeatureSettings: '"salt"' }}
            >
              Diagnose any stock — unlimited free
            </p>
          </div>
          
          <button
            onClick={handleClick}
            className="px-5 py-2 bg-rausch text-white rounded-standard font-medium hover:bg-rausch-deep active:scale-[0.98] transition-all whitespace-nowrap"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            New diagnosis
          </button>
        </div>

        {/* Mobile: Full-width button */}
        <div className="md:hidden">
          <button
            onClick={handleClick}
            className="w-full py-3 bg-rausch text-white rounded-standard font-medium hover:bg-rausch-deep active:scale-[0.98] transition-all"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Diagnose another stock
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
