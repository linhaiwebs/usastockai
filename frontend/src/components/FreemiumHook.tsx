'use client'

import { useState, useEffect } from 'react'

/**
 * Usage Stats Bar - BMW Design System
 * Shows today's diagnosis count with sharp corners, tight line-height
 */
export function UsageStatsBar() {
  const [freeCount, setFreeCount] = useState(3)

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

  const diagnosesUsed = 3 - freeCount

  return (
    <div className="mb-6">
      <div className="bg-surface border border-border-default p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bmw-blue flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-body text-text-primary">
                You've done <span className="font-semibold text-bmw-blue">{diagnosesUsed}</span> diagnoses today
              </p>
              <p className="text-small text-text-secondary">
                Come back tomorrow for more — or diagnose another now
              </p>
            </div>
          </div>
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

// Keep FreemiumHook as alias for backwards compatibility
export function FreemiumHook({ onUpgrade }: { onUpgrade?: () => void }) {
  return <UsageStatsBar />
}
