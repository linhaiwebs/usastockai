'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

export interface SearchBoxRef {
  clearAndFocus: () => void
}

/**
 * Search Box Component - Mobile-first with example pills and validation
 * Airbnb style with generous border-radius and three-layer shadows
 */
export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(({ onAnalyze }, ref) => {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useImperativeHandle(ref, () => ({
    clearAndFocus: () => {
      setQuery('')
      setError('')
      setIsFocused(true)
    }
  }))

  const validateStockSymbol = (symbol: string): boolean => {
    // Basic validation: 1-5 uppercase letters
    const validPattern = /^[A-Z]{1,5}$/
    return validPattern.test(symbol.toUpperCase())
  }

  const handleSubmit = () => {
    const trimmedQuery = query.trim().toUpperCase()
    
    if (!trimmedQuery) {
      setError('Please enter a stock symbol')
      return
    }
    
    if (!validateStockSymbol(trimmedQuery)) {
      setError('Invalid stock symbol. Use 1-5 letters (e.g., AAPL, TSLA)')
      return
    }
    
    setError('')
    
    // Trigger Google Analytics event
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'Bdd');
    }
    
    onAnalyze?.(trimmedQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleExampleClick = (symbol: string) => {
    setQuery(symbol)
    setError('')
    setIsFocused(true)
  }

  const exampleStocks = ['AAPL', 'NVDA', 'META']

  return (
    <div className="mb-8">
      {/* Search input container - Airbnb card style */}
      <div className={`relative shadow-card hover:shadow-hover transition-shadow rounded-large bg-white ${
        error ? 'ring-2 ring-danger-red' : ''
      }`}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase())
            setError('')
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="AAPL, MSFT, TSLA or any US stock"
          className="w-full px-5 py-4 bg-white rounded-large text-text-primary placeholder-text-secondary focus:outline-none transition-all"
          style={{ fontFeatureSettings: '"salt"' }}
          autoFocus={isFocused}
        />
      </div>

      {/* Error message */}
      {error && (
        <p 
          className="mt-2 text-small text-danger-red flex items-center gap-1"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Example pills */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span 
          className="text-small text-text-secondary"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          Try examples:
        </span>
        {exampleStocks.map((symbol) => (
          <button
            key={symbol}
            onClick={() => handleExampleClick(symbol)}
            className="px-3 py-1.5 bg-surface rounded-badge text-body-medium text-text-primary hover:bg-surface/80 transition-colors"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            {symbol}
          </button>
        ))}
      </div>

      {/* Diagnose button - Rausch Red CTA */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-4 py-4 bg-rausch text-white font-medium rounded-standard hover:bg-rausch-deep active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Diagnose
      </button>
      
      {/* Helper text */}
      <p 
        className="mt-3 text-small text-text-secondary text-center"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        No login. Instant results. Always free.
      </p>
    </div>
  )
})

SearchBox.displayName = 'SearchBox'
