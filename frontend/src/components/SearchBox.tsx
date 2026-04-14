'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

export interface SearchBoxRef {
  clearAndFocus: () => void
}

const hotStocks = ['AAPL', 'TSLA', 'NVDA', 'GME', 'AMC']

export const SearchBox = forwardRef<SearchBoxRef, SearchBoxProps>(({ onAnalyze }, ref) => {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    clearAndFocus: () => {
      setQuery('')
      setError('')
      setIsLoading(false)
    }
  }))

  const handleSubmit = () => {
    const trimmed = query.trim().toUpperCase()
    if (!trimmed) { setError('Please enter a stock symbol'); return }
    if (!/^[A-Z]{1,5}$/.test(trimmed)) { setError('Invalid symbol. Use 1-5 letters (e.g., AAPL)'); return }
    setError('')
    setIsLoading(true)
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'scan_start')
    }
    setTimeout(() => { setIsLoading(false); onAnalyze?.(trimmed) }, 800)
  }

  return (
    <section id="analyze" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Analyze Any Stock Now
          </h2>
          <p className="text-lg text-text-secondary">
            Enter a ticker symbol and get AI-powered sentiment analysis instantly
          </p>
        </div>

        {/* Search input */}
        <div className={`flex items-center border-2 ${error ? 'border-error' : 'border-border-default focus-within:border-brand'} rounded-xl bg-white shadow-card transition-colors`}>
          <div className="pl-4 flex items-center">
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
            placeholder="Enter stock symbol (e.g., AAPL, TSLA, NVDA)"
            className="flex-1 px-3 py-4 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-base"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="px-6 py-4 bg-brand text-white font-semibold hover:bg-brand-dark active:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-[10px]"
          >
            {isLoading ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-error flex items-center gap-1">{error}</p>}

        {/* Hot stocks */}
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-sm text-text-muted">Popular:</span>
          {hotStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => { setQuery(stock); setError('') }}
              className="px-3 py-1.5 bg-surface-alt border border-border-default rounded-lg text-sm font-medium text-text-primary hover:border-brand hover:text-brand transition-colors"
            >
              ${stock}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-text-muted text-center">
          Free. No account required. 10 free scans per day.
        </p>
      </div>
    </section>
  )
})

SearchBox.displayName = 'SearchBox'
