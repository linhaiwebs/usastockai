'use client'

/**
 * Hero Section - Mobile-first design with Airbnb style
 * Clean, focused messaging for stock diagnosis
 */
export function HeroSection() {
  return (
    <div className="pt-12 pb-6 text-center relative overflow-hidden">
      {/* Decorative gradient elements - Rausch Red */}
      <div className="absolute top-4 right-0 w-64 h-64 bg-rausch opacity-5 blur-3xl rounded-circle pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rausch opacity-5 blur-3xl rounded-circle pointer-events-none" />
      
      {/* Main title - Airbnb Cereal VF weight 700, letter-spacing -0.44px */}
      <h1 
        className="text-display-hero md:text-display-large text-text-primary mb-4 relative z-10 leading-tight"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        AI that thinks like a Wall Street analyst —{' '}
        <span className="text-rausch">free</span>
      </h1>
      
      {/* Subtitle - weight 500, warm gray */}
      <p 
        className="text-ui-medium text-text-secondary max-w-md mx-auto leading-relaxed"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        Real-time technical, fundamental & sentiment scoring
      </p>
    </div>
  )
}
