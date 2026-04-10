'use client'

import { useState } from 'react'
import { assignRedirect, recordRedirectClick } from '@/lib/api'

/**
 * Call to Action Button - Stripe style primary purple button
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
    <div className="mb-12 text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-4 bg-stripe-purple text-white font-normal text-body rounded-standard shadow-elevated hover:bg-purple-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
        style={{ fontFeatureSettings: '"ss01"' }}
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
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>Connect with AI Agent</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
      <p 
        className="mt-4 text-caption text-body-text"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Start your intelligent investment journey today
      </p>
    </div>
  )
}
