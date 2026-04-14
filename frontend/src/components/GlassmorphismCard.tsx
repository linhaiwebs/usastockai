'use client'

import EnergyOrb from './EnergyOrb'
import OrbitingStocks from './OrbitingStocks'

export default function GlassmorphismCard() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto">
      {/* Outer ambient glow */}
      <div
        className="absolute -inset-6 rounded-[40px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(79,142,255,0.08) 0%, rgba(168,85,247,0.04) 50%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Glass container */}
      <div className="glass glass-highlight relative p-6 pb-5" style={{ animation: 'glow-pulse 6s ease-in-out infinite' }}>
        {/* Inner subtle glow at top */}
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          }}
        />

        {/* Energy Orb + Orbiting Stocks */}
        <div className="relative h-60 sm:h-72 flex items-center justify-center mb-4">
          <OrbitingStocks />
          <EnergyOrb />
        </div>

        {/* AI Analysis Ready capsule */}
        <div className="flex justify-center mb-5">
          <div
            className="px-4 py-1.5 rounded-full text-[10px] font-medium tracking-[0.15em] uppercase"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            ● AI Analysis Ready
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-white mb-1.5 tracking-tight">
          Contrarian Analysis Engine
        </h2>

        {/* Description */}
        <p className="text-center text-xs text-white/40 leading-relaxed px-2">
          Enable the AI stock diagnostic analysis engine
        </p>
      </div>
    </div>
  )
}
