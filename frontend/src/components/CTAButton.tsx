'use client'

import { useState } from 'react'
import { assignRedirect, recordRedirectClick } from '@/lib/api'

/**
 * Call to Action Button - Direct redirect to WhatsApp
 */
export function CTAButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      // Get redirect URL from backend
      const data = await assignRedirect()
      
      if (data.url) {
        // Record click
        if (data.id) {
          await recordRedirectClick(data.id)
        }
        
        // Open WhatsApp link in new tab
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Failed to get redirect URL:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-4 bg-hero-gradient text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>Meet Your AI Agent Team →</span>
          </>
        )}
      </button>
      <p className="mt-3 text-sm text-text-secondary">
        Start your intelligent investment journey
      </p>
    </div>
  )
}
