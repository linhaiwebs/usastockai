'use client'

/**
 * Hero Section - Blue gradient title
 */
export function HeroSection() {
  return (
    <div className="pt-12 pb-8 text-center">
      {/* Main title */}
      <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-hero-gradient">
        AI-Powered Stock Diagnosis
      </h1>
      
      {/* Subtitle */}
      <p className="text-text-secondary text-base leading-relaxed">
        Real-time Quotes · Intelligent Analysis · Investment Decisions
      </p>
      
      {/* Decorative elements */}
      <div className="mt-6 flex justify-center gap-2">
        <div className="w-12 h-1 bg-primary rounded-full" />
        <div className="w-3 h-1 bg-secondary rounded-full" />
        <div className="w-2 h-1 bg-accent rounded-full" />
      </div>
    </div>
  )
}
