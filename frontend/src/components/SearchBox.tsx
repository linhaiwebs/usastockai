'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Simple input without real-time search
 */
export function SearchBox({ onAnalyze }: SearchBoxProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    if (query.trim() && onAnalyze) {
      onAnalyze(query)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="relative mb-8">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
          className="w-full px-4 py-3.5 pl-12 bg-surface border border-gray-700 rounded-xl text-text placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
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

      {/* Analyze button */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-3 py-3.5 bg-hero-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start AI Diagnosis
      </button>
    </div>
  )
}
