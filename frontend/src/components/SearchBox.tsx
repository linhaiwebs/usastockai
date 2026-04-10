'use client'

import { useState } from 'react'

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * Search Box Component - Wise style with pill buttons and clean inputs
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
    <div className="relative mb-8">
      {/* Search input - Wise style with ring shadow */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
          className="w-full px-4 py-3.5 pl-12 bg-white border border-near-black/10 rounded-2xl text-near-black placeholder-gray focus:outline-none focus:shadow-ring transition-all"
          style={{ fontFeatureSettings: '"calt"' }}
        />
        
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray"
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

      {/* Analyze button - Wise green pill button */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-3 py-3.5 bg-wise-green text-dark-green font-semibold rounded-pill shadow-none hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{ fontFeatureSettings: '"calt"' }}
      >
        Start AI Diagnosis
      </button>
    </div>
  )
}
