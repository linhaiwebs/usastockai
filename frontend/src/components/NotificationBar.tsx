'use client'

import { useState, useEffect } from 'react'

/**
 * Notification Bar Component - BMW Design System
 * Dismissible notification bar with sessionStorage persistence
 * Non-modal, sharp corners, tight line-height
 */
export function NotificationBar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if notification was closed in this session
    const wasClosed = sessionStorage.getItem('notificationBarClosed')
    if (!wasClosed) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('notificationBarClosed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="mb-6 bg-surface border border-border-default">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">🎉</span>
          <div>
            <p className="text-body font-semibold text-text-primary">
              Free forever. No catch.
            </p>
            <p className="text-small text-text-secondary">
              Diagnose as many stocks as you want
            </p>
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
