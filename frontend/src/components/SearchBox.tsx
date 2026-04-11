'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Airbnb style with generous border-radius and three-layer shadows
 */
export function SearchBox({ onAnalyze }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    if (query.trim() && onAnalyze) {
      // Trigger Google Analytics event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'Bdd');
      }
      onAnalyze(query)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="mb-10">
      {/* Search input container - Airbnb card style */}
      <div className="relative shadow-card hover:shadow-hover transition-shadow rounded-large bg-white">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search any stock symbol (AAPL, TSLA, NVDA...)"
          className="w-full px-5 py-4 pl-12 bg-white rounded-large text-text-primary placeholder-text-secondary focus:outline-none transition-all"
          style={{ fontFeatureSettings: '"salt"' }}
        />
        
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Analyze button - Rausch Red CTA */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-4 py-4 bg-rausch text-white font-medium rounded-standard hover:bg-rausch-deep active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Diagnose with AI
      </button>
      
      {/* Compliance text - weak, small, centered */}
      <p 
        className="mt-3 text-small text-text-secondary text-center opacity-60"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        For informational purposes only. Not financial advice.
      </p>
    </div>
  )
}
