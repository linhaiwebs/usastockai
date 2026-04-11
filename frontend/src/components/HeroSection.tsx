'use client'

/**
 * Hero Section - Airtable style
 * Clean white background with blue accents
 */
export function HeroSection() {
  return (
    <div className="pt-8 pb-6 text-center">
      {/* Main title */}
      <h1 
        className="text-display-hero text-deep-navy mb-3"
      >
        Know if a stock is a buy or sell — in{' '}
        <span className="text-airtable-blue">3 seconds</span>
      </h1>
      
      {/* Subtitle */}
      <p 
        className="text-body text-text-secondary max-w-sm mx-auto"
        style={{ letterSpacing: '0.18px' }}
      >
        AI analyzes technicals, fundamentals & sentiment
      </p>
    </div>
  )
}
