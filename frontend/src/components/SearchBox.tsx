'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

export interface SearchBoxRef {
  clearAndFocus: () => void
}

// Hot stocks for random selection
const hotStocks = ['TSLA', 'GME', 'NVDA', 'AAPL', 'META', 'AMZN', 'GOOGL', 'MSFT']

/**
 * Search Box Component - BMW Design System
 * Sharp corners, BMW Blue accent, tight line-height
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
      (window as any).gtag('event', 'Bdd')
    }
    
    onAnalyze?.(trimmedQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleRandomStock = () => {
    const randomStock = hotStocks[Math.floor(Math.random() * hotStocks.length)]
    setQuery(randomStock)
    setError('')
  }

  return (
    <div className="mb-8">
      {/* Search input container - BMW sharp corners */}
      <div className={`relative border ${error ? 'border-danger-red' : 'border-border-default'} bg-white transition-colors`}>
        <div className="flex items-center">
          {/* Magnifier icon */}
          <div className="pl-4 flex items-center">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* $ prefix */}
          <span className="pl-3 text-text-secondary font-medium">$</span>
          
          {/* Input field */}
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
            placeholder="TSLA, GME, NVDA..."
            className="flex-1 px-2 py-4 bg-white text-text-primary placeholder-text-secondary focus:outline-none text-body"
            autoFocus={isFocused}
          />
          
          {/* Random stock button (emoji) */}
          <button
            type="button"
            onClick={handleRandomStock}
            className="px-3 py-2 hover:bg-surface transition-colors text-lg"
            title="Random hot stock"
          >
            🔥
          </button>
          
          {/* Diagnose button */}
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className="px-6 py-4 bg-bmw-blue text-white font-semibold hover:bg-bmw-blue-focus active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            DIAGNOSE
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-small text-danger-red flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
})

SearchBox.displayName = 'SearchBox'
