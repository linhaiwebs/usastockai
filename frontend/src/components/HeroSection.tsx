'use client'

import { useState, useEffect } from 'react'

/**
 * Hero Section - BMW Design System
 * 60px uppercase display heading, weight 300
 * Sharp corners, tight line-heights
 */
export function HeroSection() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true)
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="pt-8 pb-6 relative">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-12">
        {/* Logo + Brand Name */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-bmw-blue flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-section-heading text-text-primary" style={{ fontWeight: 400 }}>
            STOCKAI
          </span>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center border border-border-default hover:border-bmw-blue transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Title - 60px uppercase, weight 300 */}
      <h1 className="text-display-hero text-text-primary mb-4 text-center">
        WHAT'S THE VIBE ON YOUR STOCK? 🎯
      </h1>
      
      {/* Subtitle - weight 400, Meta Gray */}
      <p className="text-body text-text-secondary max-w-md mx-auto text-center mb-8">
        AI reads Reddit, X & news — then tells you buy/hold/sell
      </p>
    </div>
  )
}
