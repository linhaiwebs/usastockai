'use client'

import { useEffect, useState } from 'react'

/**
 * Hero Section - Airbnb style with dynamic K-line background
 * Uses Airbnb Cereal VF at weight 700, negative letter-spacing
 */
export function HeroSection() {
  const [animatedLines, setAnimatedLines] = useState<Array<{ id: number; x: number; y: number; height: number; color: string }>>([])

  useEffect(() => {
    // Generate random K-line data for animation
    const generateLines = () => {
      const lines = []
      for (let i = 0; i < 12; i++) {
        lines.push({
          id: i,
          x: i * 8.33 + Math.random() * 3,
          y: Math.random() * 60 + 20,
          height: Math.random() * 40 + 20,
          color: Math.random() > 0.5 ? '#008a05' : '#c13515'
        })
      }
      setAnimatedLines(lines)
    }
    
    generateLines()
    const interval = setInterval(generateLines, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pt-12 pb-8 text-center relative overflow-hidden">
      {/* Dynamic K-line background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          {animatedLines.map((line) => (
            <rect
              key={line.id}
              x={`${line.x}%`}
              y={`${line.y}%`}
              width="2%"
              height={`${line.height}%`}
              fill={line.color}
              className="transition-all duration-1000 ease-in-out"
              rx="2"
            />
          ))}
        </svg>
      </div>
      
      {/* Decorative gradient elements - Rausch Red */}
      <div className="absolute top-4 right-0 w-64 h-64 bg-rausch opacity-5 blur-3xl rounded-circle pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rausch opacity-5 blur-3xl rounded-circle pointer-events-none" />
      
      {/* Main title - Airbnb Cereal VF weight 700, letter-spacing -0.44px */}
      <h1 
        className="text-display-hero md:text-display-large text-text-primary mb-5 relative z-10"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Stop guessing.
        <br />
        <span className="text-rausch">AI-powered stock diagnosis in seconds.</span>
      </h1>
      
      {/* Subtitle - weight 500, warm gray */}
      <p 
        className="text-ui-medium text-text-secondary max-w-md mx-auto leading-relaxed mb-6"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Real-time market insights powered by advanced AI. 
        Make smarter investment decisions with confidence.
      </p>
      
      {/* Trust indicators - Airbnb style badges */}
      <div className="flex justify-center gap-3 flex-wrap items-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-badge">
          <svg className="w-3.5 h-3.5 text-rausch" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-small text-text-primary">10,000+ investors</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-badge">
          <svg className="w-3.5 h-3.5 text-rausch" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-small text-text-primary">Real-time NASDAQ</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-badge">
          <svg className="w-3.5 h-3.5 text-rausch" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-small text-text-primary">AI-powered</span>
        </div>
      </div>
    </div>
  )
}
