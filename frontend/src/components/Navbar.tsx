'use client'

import { useState } from 'react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-nav">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-text-primary">Planet Discovery</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">How It Works</a>
          <a href="#analyze" className="text-sm font-medium text-text-secondary hover:text-brand transition-colors">Analyze</a>
          <button
            onClick={() => document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-default bg-white px-6 py-4 space-y-3">
          <a href="#features" className="block text-sm font-medium text-text-secondary hover:text-brand" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-sm font-medium text-text-secondary hover:text-brand" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#analyze" className="block text-sm font-medium text-text-secondary hover:text-brand" onClick={() => setMobileOpen(false)}>Analyze</a>
          <button
            onClick={() => { setMobileOpen(false); document.getElementById('analyze')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="w-full px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  )
}
