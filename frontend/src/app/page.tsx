'use client'

import ParticleField from '@/components/ParticleField'
import GlassmorphismCard from '@/components/GlassmorphismCard'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-5 py-10 sm:py-16 overflow-hidden">
      <ParticleField />

      {/* ── Top Title ── */}
      <header className="relative z-10 text-center mb-6 mt-4">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight"
          style={{ textShadow: '0 0 30px rgba(79,142,255,0.2)' }}
        >
          AI Stock Diagnostic
          <br />
          Framework
        </h1>
      </header>

      {/* ── Green Capsule Button ── */}
      <div className="relative z-10 mb-10">
        <button className="capsule-glow flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white tracking-wide">
          {/* Sparkle icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M8 0L9.2 6.8L16 8L9.2 9.2L8 16L6.8 9.2L0 8L6.8 6.8L8 0Z" fill="white" fillOpacity="0.9" />
          </svg>
          Contrarian Analysis
        </button>
      </div>

      {/* ── Glassmorphism Card with Energy Orb ── */}
      <div className="relative z-10 mb-8">
        <GlassmorphismCard />
      </div>

      {/* ── Main CTA Button ── */}
      <div className="relative z-10 w-full max-w-[340px] mt-2">
        <button className="btn-glow w-full py-4 rounded-2xl text-base font-bold tracking-[0.15em] text-white">
          RUN DIAGNOSTIC
        </button>
      </div>

      {/* ── Bottom spacer ── */}
      <div className="h-10" />
    </div>
  )
}
