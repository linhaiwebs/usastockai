'use client'

import { useState, useEffect } from 'react'

interface FixedBottomBarProps {
  onNewDiagnosis?: () => void
  hasCompletedDiagnosis?: boolean
  lastDiagnosis?: string
}

/**
 * Fixed Bottom Bar - BMW Design System
 * Ghost button on left, solid button on right
 * Sharp corners, tight line-heights
 */
export function FixedBottomBar({ onNewDiagnosis, hasCompletedDiagnosis = false, lastDiagnosis }: FixedBottomBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showSaveDrawer, setShowSaveDrawer] = useState(false)
  const [nickname, setNickname] = useState('')

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

  const handleSaveDiagnosis = () => {
    setShowSaveDrawer(true)
  }

  const handleConfirmSave = () => {
    // Save diagnosis to localStorage
    const savedDiagnoses = JSON.parse(localStorage.getItem('savedDiagnoses') || '[]')
    savedDiagnoses.push({
      symbol: lastDiagnosis,
      nickname: nickname || 'Anonymous',
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('savedDiagnoses', JSON.stringify(savedDiagnoses))
    setShowSaveDrawer(false)
    setNickname('')
  }

  const handleShare = () => {
    // Share functionality (anonymous)
    if (navigator.share) {
      navigator.share({
        title: 'StockAI Diagnosis',
        text: `Check out my stock diagnosis on StockAI`,
        url: window.location.href,
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!isVisible) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-default animate-slide-up">
        <div className="max-w-[520px] mx-auto px-5 py-3">
          {/* Desktop: Two buttons side by side */}
          <div className="flex items-center gap-4">
            {/* Ghost button - Share anonymously */}
            <button
              onClick={handleShare}
              className="flex-1 py-3 border border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white active:scale-[0.98] transition-all"
            >
              SHARE ANONYMOUSLY
            </button>
            
            {/* Solid button - Save diagnosis */}
            <button
              onClick={handleSaveDiagnosis}
              disabled={!hasCompletedDiagnosis}
              className="flex-1 py-3 bg-bmw-blue text-white font-semibold hover:bg-bmw-blue-focus active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              SAVE THIS DIAGNOSIS →
            </button>
          </div>
        </div>
      </div>

      {/* Save Drawer */}
      {showSaveDrawer && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-text-primary/50">
          <div className="w-full max-w-[520px] bg-white border-t border-border-default animate-slide-up">
            <div className="p-6">
              <h3 className="text-section-heading text-text-primary mb-4 uppercase">
                SAVE DIAGNOSIS
              </h3>
              
              <div className="mb-4">
                <label className="block text-small text-text-secondary mb-2 uppercase">
                  NICKNAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full px-4 py-3 border border-border-default bg-white text-text-primary placeholder-text-secondary focus:outline-none focus:border-bmw-blue"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSaveDrawer(false)}
                  className="flex-1 py-3 border border-text-primary text-text-primary font-medium hover:bg-text-primary hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 py-3 bg-bmw-blue text-white font-semibold hover:bg-bmw-blue-focus transition-all"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Keep ContextualCTA as alias for backwards compatibility
export function ContextualCTA({ onUpgrade, hasCompletedDiagnosis }: { onUpgrade?: () => void; hasCompletedDiagnosis?: boolean }) {
  return <FixedBottomBar onNewDiagnosis={onUpgrade} hasCompletedDiagnosis={hasCompletedDiagnosis} />
}
