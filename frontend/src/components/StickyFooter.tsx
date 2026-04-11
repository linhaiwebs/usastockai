'use client'

import { useState, useEffect } from 'react'

interface StickyFooterProps {
  onNewDiagnosis: () => void
}

/**
 * Sticky Footer CTA - Airtable style
 * Appears after scrolling 30%, fixed at bottom on mobile
 */
export function StickyFooter({ onNewDiagnosis }: StickyFooterProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      setIsVisible(scrollPercent > 30)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    onNewDiagnosis()
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-ambient animate-slide-up">
      <div className="max-w-[520px] mx-auto px-5 py-3 flex items-center justify-between">
        {/* Left text */}
        <p 
          className="text-xs text-text-secondary"
          style={{ letterSpacing: '0.08px' }}
        >
          Try another stock — always free
        </p>
        
        {/* Right button */}
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-airtable-blue text-white font-medium rounded-standard hover:bg-mid-blue active:scale-95 transition-all"
          style={{ letterSpacing: '0.08px', fontSize: '0.8125rem' }}
        >
          New diagnosis →
        </button>
      </div>
    </div>
  )
}
