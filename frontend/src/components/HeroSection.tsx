'use client'

/**
 * Hero Section - Wise style with bold typography
 */
export function HeroSection() {
  return (
    <div className="pt-12 pb-8 text-center">
      {/* Main title - Wise Sans style at weight 900, line-height 0.85 */}
      <h1 className="text-4xl md:text-5xl font-black mb-4 text-near-black" style={{ lineHeight: '0.85', fontFeatureSettings: '"calt"' }}>
        AI-Powered Stock Diagnosis
      </h1>
      
      {/* Subtitle - Inter weight 600 */}
      <p className="text-body-semibold text-warm-dark leading-relaxed" style={{ fontFeatureSettings: '"calt"' }}>
        Real-time Quotes · Intelligent Analysis · Investment Decisions
      </p>
      
      {/* Decorative elements - Wise Green accent */}
      <div className="mt-6 flex justify-center gap-2">
        <div className="w-12 h-1.5 bg-wise-green rounded-full" />
        <div className="w-3 h-1.5 bg-light-mint rounded-full" />
        <div className="w-2 h-1.5 bg-pastel-green rounded-full" />
      </div>
    </div>
  )
}
