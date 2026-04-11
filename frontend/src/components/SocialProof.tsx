'use client'

/**
 * Social Proof Bar - Airtable style
 * Horizontal scrolling logo wall with trust indicators
 */
export function SocialProof() {
  const logos = [
    { name: 'Bloomberg', abbr: 'Bloomberg' },
    { name: 'Benzinga', abbr: 'Benzinga' },
    { name: 'Yahoo Finance', abbr: 'Yahoo Finance' }
  ]

  return (
    <div className="mb-6 py-4 border-y border-border-light">
      {/* Logo wall - horizontal scroll on mobile */}
      <div className="flex items-center justify-center gap-6 overflow-x-auto hide-scrollbar mb-3">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex-shrink-0 px-3 py-1.5 bg-surface rounded-subtle"
          >
            <span 
              className="text-xs text-text-secondary font-medium whitespace-nowrap"
              style={{ letterSpacing: '0.08px' }}
            >
              {logo.abbr}
            </span>
          </div>
        ))}
      </div>

      {/* Trust text */}
      <p 
        className="text-center text-xs text-text-secondary mb-2"
        style={{ letterSpacing: '0.18px' }}
      >
        Trusted by 87,000+ U.S. investors
      </p>

      {/* Rating */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className="w-3 h-3 text-airtable-blue"
              fill={star <= 4 ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          ))}
        </div>
        <span 
          className="text-xs text-deep-navy font-medium"
          style={{ letterSpacing: '0.08px' }}
        >
          4.8
        </span>
        <span 
          className="text-xs text-text-secondary"
          style={{ letterSpacing: '0.08px' }}
        >
          (App Store + Trustpilot)
        </span>
      </div>
    </div>
  )
}
