'use client'

interface CTAButtonProps {
  onClick?: () => void
}

/**
 * Call to Action Button
 */
export function CTAButton({ onClick }: CTAButtonProps) {
  return (
    <div className="mb-8 text-center">
      <button
        onClick={onClick}
        className="w-full py-4 bg-hero-gradient text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        Meet Your AI Agent Team →
      </button>
      <p className="mt-3 text-sm text-text-secondary">
        Start your intelligent investment journey
      </p>
    </div>
  )
}
