'use client'

export default function EnergyOrb() {
  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto" style={{ animation: 'float-up 4s ease-in-out infinite' }}>
      {/* Outermost bloom */}
      <div
        className="absolute inset-[-30%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,255,0.12) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
          animation: 'orb-breathe 5s ease-in-out infinite',
        }}
      />

      {/* Glow ring 1 - blue */}
      <div
        className="absolute inset-[-8%] rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #4f8eff, #a855f7, #ec4899, #22d3ee, #4f8eff)',
          filter: 'blur(18px)',
          opacity: 0.5,
          animation: 'orb-rotate 8s linear infinite',
        }}
      />

      {/* Glow ring 2 - reverse */}
      <div
        className="absolute inset-[-4%] rounded-full"
        style={{
          background: 'conic-gradient(from 180deg, #22d3ee, #facc15, #ec4899, #4f8eff, #22d3ee)',
          filter: 'blur(12px)',
          opacity: 0.45,
          animation: 'orb-rotate-reverse 6s linear infinite',
        }}
      />

      {/* Inner energy core */}
      <div
        className="absolute inset-[8%] rounded-full"
        style={{
          background: 'conic-gradient(from 90deg, #4f8eff, #a855f7, #ec4899, #22d3ee, #facc15, #4f8eff)',
          filter: 'blur(6px)',
          opacity: 0.8,
          animation: 'orb-rotate 4s linear infinite',
        }}
      />

      {/* Core bright center */}
      <div
        className="absolute inset-[20%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(79,142,255,0.6) 30%, rgba(168,85,247,0.3) 60%, transparent 80%)',
          animation: 'orb-pulse 3s ease-in-out infinite',
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute top-[18%] left-[22%] w-[30%] h-[20%] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
      />

      {/* Energy stream lines */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${deg}deg, transparent 0%, rgba(79,142,255,0.25) 2%, transparent 4%, transparent 100%)`,
            animation: `orb-rotate ${6 + deg / 60}s linear infinite`,
          }}
        />
      ))}

      {/* Volumetric light rays */}
      <div
        className="absolute inset-[-50%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,255,0.06) 0%, transparent 50%)',
          animation: 'orb-breathe 7s ease-in-out infinite reverse',
        }}
      />
    </div>
  )
}
