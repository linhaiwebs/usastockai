'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Stripe style with conservative border-radius and blue-tinted shadows
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
      {/* Search input - Stripe style with 6px radius, blue-tinted shadow */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search any stock symbol (AAPL, TSLA, NVDA...)"
          className="w-full px-4 py-4 pl-12 bg-white border border-border-default rounded-relaxed text-deep-navy placeholder-body-text focus:outline-none focus:border-stripe-purple focus:shadow-focus-ring transition-all"
          style={{ fontFeatureSettings: '"ss01"' }}
        />
        
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-body-text"
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

      {/* Analyze button - Stripe primary purple button */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-4 py-4 bg-stripe-purple text-white font-normal rounded-standard shadow-elevated hover:bg-purple-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Analyze with AI
      </button>
      
      {/* Helper text */}
      <p className="mt-3 text-caption-small text-body-text text-center opacity-70" style={{ fontFeatureSettings: '"ss01"' }}>
        Enter a stock symbol to get AI-powered analysis and insights
      </p>
    </div>
  )
}
