'use client'

import { useState, useEffect } from 'react'

/**
 * Module 1: Top Brand Bar - ClickHouse Design System
 * Left: MarketPulse AI + Beta badge
 * Right: Real-time clock (ET) + Today's Hot dropdown
 * Pure black canvas, Neon Volt accents
 */
export function HeroSection() {
  const [currentTime, setCurrentTime] = useState('')
  const [hotDropdownOpen, setHotDropdownOpen] = useState(false)
  
  // Hot stocks for dropdown
  const hotStocks = ['GME', 'AMC', 'TSLA', 'BBBY']

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      // Format as US Eastern Time
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }
      setCurrentTime(now.toLocaleTimeString('en-US', options) + ' ET')
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pt-6 pb-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between">
        {/* Left: Logo + Brand Name + Beta Badge */}
        <div className="flex items-center gap-3">
          {/* Neon Volt logo square */}
          <div className="w-10 h-10 bg-neon-volt flex items-center justify-center rounded-sharp">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-feature-title font-bold text-text-primary">
              MarketPulse AI
            </span>
            {/* Beta badge */}
            <span className="px-2 py-0.5 bg-neon-volt text-black text-micro font-semibold rounded-sharp">
              BETA
            </span>
          </div>
        </div>
        
        {/* Right: Real-time clock + Today's Hot dropdown */}
        <div className="flex items-center gap-4">
          {/* Real-time clock */}
          <div className="text-small font-medium text-text-secondary font-mono">
            {currentTime}
          </div>
          
          {/* Today's Hot dropdown */}
          <div className="relative">
            <button
              onClick={() => setHotDropdownOpen(!hotDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-surface border border-charcoal rounded-sharp hover:border-neon-volt transition-colors"
            >
              <span className="text-small font-medium text-text-primary">
                🔥 Today's Hot
              </span>
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {hotDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-charcoal rounded-sharp shadow-elevated z-50">
                {hotStocks.map((stock) => (
                  <button
                    key={stock}
                    className="w-full px-4 py-2 text-left text-body text-text-primary hover:bg-hover-gray hover:text-neon-volt transition-colors first:rounded-t-sharp last:rounded-b-sharp"
                    onClick={() => setHotDropdownOpen(false)}
                  >
                    ${stock}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
