'use client'

/**
 * Hero Section - Stripe style with whisper-weight typography
 * Uses sohne-var at weight 300, negative letter-spacing, deep navy headings
 */
export function HeroSection() {
  return (
    <div className="pt-16 pb-10 text-center relative overflow-hidden">
      {/* Decorative gradient element - Ruby to Magenta */}
      <div className="absolute top-8 right-0 w-64 h-64 bg-gradient-brand opacity-5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-brand opacity-5 blur-3xl rounded-full pointer-events-none" />
      
      {/* Main title - sohne-var weight 300, line-height 1.03, letter-spacing -1.4px */}
      <h1 
        className="text-display-large md:text-display-hero text-deep-navy mb-6 relative z-10"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Intelligent Stock Analysis
      </h1>
      
      {/* Subtitle - Body large weight 300, line-height 1.40, body-text color */}
      <p 
        className="text-body-large text-body-text max-w-md mx-auto leading-relaxed mb-8"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Real-time market data powered by advanced AI. Make informed investment decisions with confidence.
      </p>
      
      {/* Trust indicators - Stripe style subtle badges */}
      <div className="flex justify-center gap-3 flex-wrap">
        <span className="text-caption text-body-text opacity-60">
          Trusted by 10,000+ investors
        </span>
        <span className="text-caption text-body-text opacity-30">•</span>
        <span className="text-caption text-body-text opacity-60">
          Real-time NASDAQ data
        </span>
        <span className="text-caption text-body-text opacity-30">•</span>
        <span className="text-caption text-body-text opacity-60">
          AI-powered insights
        </span>
      </div>
    </div>
  )
}
