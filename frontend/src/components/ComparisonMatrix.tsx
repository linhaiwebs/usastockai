'use client'

/**
 * Module 4: News Source Trust Badges - ClickHouse Design System
 * Horizontal display: Reuters, Bloomberg, CNBC, Benzinga, Reddit, X
 * Each with ✓ verification mark
 * "We don't generate fake news — only real sources"
 */
export function ComparisonMatrix() {
  const sources = [
    { name: 'Reuters', verified: true },
    { name: 'Bloomberg', verified: true },
    { name: 'CNBC', verified: true },
    { name: 'Benzinga', verified: true },
    { name: 'Reddit', verified: true },
    { name: 'X', verified: true },
  ]

  return (
    <div className="mb-8">
      {/* Trust badge container */}
      <div className="border border-charcoal bg-surface rounded-comfortable p-6">
        {/* Sources horizontal display */}
        <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
          {sources.map((source, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <span className="text-body font-semibold text-text-primary">
                {source.name}
              </span>
              {source.verified && (
                <svg className="w-4 h-4 text-positive-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <p className="text-center text-caption text-text-secondary">
          We don't generate fake news — only real sources
        </p>
      </div>
    </div>
  )
}
