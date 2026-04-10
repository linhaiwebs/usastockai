'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Revolut style with pill buttons
 * No shadows, flat design with generous padding
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
    <section className="py-10 px-4 bg-surface">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h2 
            className="text-section-heading font-medium text-revolut-dark mb-2"
            style={{ 
              lineHeight: '1.20',
              letterSpacing: '-0.28px'
            }}
          >
            Analyze Any Stock
          </h2>
          <p className="text-body text-mid-slate">
            Enter a stock symbol to get AI-powered analysis and insights
          </p>
        </div>

        {/* Search input - Revolut style with 20px radius */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AAPL, TSLA, NVDA, MSFT..."
            className="w-full px-4 py-3 pl-12 bg-white border-2 border-gray-tone rounded-card text-revolut-dark text-body placeholder-cool-gray focus:outline-none focus:border-revolut-dark transition-colors"
          />
          
          {/* Search icon */}
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mid-slate"
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

        {/* Analyze button - Revolut pill button */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="w-full mt-3 py-3 bg-revolut-dark text-white font-medium text-nav-ui rounded-pill hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Analyze with AI
        </button>
      </div>
    </section>
  )
}
