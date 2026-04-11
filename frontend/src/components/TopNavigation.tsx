'use client'

import { useState, useEffect } from 'react'

/**
 * Top Navigation Bar - Airtable style
 * Logo + text links + ghost button, shrinks on scroll
 */
export function TopNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-ambient' : 'py-3'
      }`}
    >
      <div className="max-w-[520px] mx-auto px-5 flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-7 h-7 bg-airtable-blue rounded-subtle flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          {/* Brand Name */}
          <span 
            className={`text-deep-navy font-medium transition-all duration-300 ${
              isScrolled ? 'text-sm' : 'text-base'
            }`}
            style={{ letterSpacing: '0.08px' }}
          >
            AI Stock Doctor
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Text Link */}
          <button 
            className="text-sm text-text-secondary hover:text-airtable-blue transition-colors"
            style={{ letterSpacing: '0.08px' }}
          >
            保存记录
          </button>
          
          {/* Ghost Button */}
          <button className="ghost-btn text-xs py-1.5 px-3">
            分享诊断
          </button>
        </div>
      </div>
    </nav>
  )
}
