'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Airtable style with validation states
 */
export function SearchBox({ onAnalyze }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const popularTickers = ['AAPL', 'TSLA', 'NVDA']

  const validateTicker = (value: string): boolean => {
    // Basic validation: 1-5 uppercase letters
    const tickerPattern = /^[A-Z]{1,5}$/
    return value === '' || tickerPattern.test(value.toUpperCase())
  }

  const handleSubmit = async () => {
    if (query.trim() && onAnalyze) {
      // Validate ticker
      const ticker = query.trim().toUpperCase()
      if (!validateTicker(ticker)) {
        setIsValid(false)
        return
      }
      
      setIsValid(true)
      setIsLoading(true)
      
      // Trigger Google Analytics event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'Bdd');
      }
      
      // Simulate loading for UX
      setTimeout(() => {
        setIsLoading(false)
        onAnalyze(query)
      }, 500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleChange = (value: string) => {
    setQuery(value)
    setIsValid(true) // Reset validation on change
  }

  const handleTagClick = (ticker: string) => {
    setQuery(ticker)
    setIsValid(true)
  }

  return (
    <div className="mb-6">
      {/* Search input container */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter ticker (e.g. AAPL, TSLA, NVDA)"
          className={`w-full px-4 py-3 bg-white rounded-standard text-deep-navy placeholder-text-secondary focus:outline-none transition-all border ${
            !isValid 
              ? 'border-danger-red' 
              : 'border-border-default focus:border-airtable-blue'
          }`}
          style={{ letterSpacing: '0.18px', fontSize: '0.875rem' }}
          disabled={isLoading}
        />
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-24 top-1/2 -translate-y-1/2 text-text-secondary hover:text-deep-navy transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Diagnose button */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading}
          className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-2 bg-airtable-blue text-white font-medium rounded-subtle hover:bg-mid-blue active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          style={{ letterSpacing: '0.08px', fontSize: '0.8125rem' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>诊断</span>
            </div>
          ) : (
            '诊断'
          )}
        </button>
      </div>

      {/* Error message */}
      {!isValid && (
        <p className="mt-2 text-xs text-danger-red" style={{ letterSpacing: '0.08px' }}>
          Ticker not found
        </p>
      )}

      {/* Loading message */}
      {isLoading && (
        <p className="mt-2 text-xs text-airtable-blue animate-pulse" style={{ letterSpacing: '0.08px' }}>
          Analyzing 14 indicators...
        </p>
      )}

      {/* Popular tickers */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {popularTickers.map((ticker) => (
          <button
            key={ticker}
            onClick={() => handleTagClick(ticker)}
            className="px-2.5 py-1 bg-surface text-text-secondary rounded-subtle hover:bg-border-light hover:text-deep-navy transition-all text-xs"
            style={{ letterSpacing: '0.08px' }}
          >
            {ticker}
          </button>
        ))}
      </div>

      {/* Compliance text */}
      <p 
        className="mt-3 text-small text-text-secondary text-center"
        style={{ letterSpacing: '0.08px' }}
      >
        Always free. No signup required.
      </p>
    </div>
  )
}
