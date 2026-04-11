'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

export interface SearchBoxRef {
  clearAndFocus: () => void
}

// Hot stocks for display and random selection
const hotStocks = ['GME', 'AMC', 'TSLA', 'BBBY']

/**
 * Module 2: Central Input Area - ClickHouse Design System
 * Big title, subtitle, search input with magnifier
 * Scan Now button (red), hot stocks, free scan text
 */
export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(({ onAnalyze }, ref) => {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useImperativeHandle(ref, () => ({
    clearAndFocus: () => {
      setQuery('')
      setError('')
      setIsLoading(false)
      setProgress(0)
    }
  }))

  const validateStockSymbol = (symbol: string): boolean => {
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
    
    // Simulate loading state
    setIsLoading(true)
    setProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 200)
    
    // Trigger Google Analytics event
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'scan_start')
    }
    
    // Call onAnalyze after short delay to show loading
    setTimeout(() => {
      clearInterval(progressInterval)
      setIsLoading(false)
      setProgress(100)
      onAnalyze?.(trimmedQuery)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  const handleHotStockClick = (stock: string) => {
    setQuery(stock)
    setError('')
  }

  return (
    <div className="mb-8">
      {/* Big Title */}
      <h1 className="text-feature-heading font-bold text-text-primary text-center mb-3">
        What's the news saying about your stock?
      </h1>
      
      {/* Subtitle */}
      <p className="text-body text-text-secondary text-center mb-6">
        AI scans 10,000+ articles and posts — in real time
      </p>
      
      {/* Search input container - ClickHouse dark style */}
      <div className={`relative border ${error ? 'border-danger-red' : 'border-charcoal'} bg-surface rounded-sharp transition-colors`}>
        <div className="flex items-center">
          {/* Magnifier icon */}
          <div className="pl-4 flex items-center">
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Input field */}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.toUpperCase())
              setError('')
            }}
            onKeyPress={handleKeyPress}
            placeholder="Search any ticker or company name..."
            className="flex-1 px-3 py-4 bg-surface text-text-primary placeholder-text-secondary focus:outline-none text-body"
            disabled={isLoading}
          />
          
          {/* Scan Now button - Red */}
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="px-6 py-4 bg-danger-red text-white font-semibold hover:bg-red-700 active:text-neon-volt-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-r-sharp"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                Scraping news...
                <span className="text-small">{Math.min(Math.round(progress), 100)}%</span>
              </span>
            ) : (
              'Scan Now'
            )}
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

      {/* Today's Hot Stocks */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="text-caption text-text-muted">Today's hot:</span>
        {hotStocks.map((stock) => (
          <button
            key={stock}
            onClick={() => handleHotStockClick(stock)}
            className="px-3 py-1 bg-surface border border-charcoal rounded-sharp text-caption text-text-primary hover:border-neon-volt hover:text-neon-volt transition-colors"
          >
            ${stock}
          </button>
        ))}
      </div>

      {/* Free scan text */}
      <p className="mt-4 text-caption text-text-muted text-center">
        Free. No account. 10 free scans per day.
      </p>
    </div>
  )
})

SearchBox.displayName = 'SearchBox'
