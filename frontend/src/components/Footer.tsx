'use client'

import Link from 'next/link'

/**
 * Footer Component - ClickHouse Design System
 * Pure black canvas, charcoal borders, neon link hovers
 */
export function Footer() {
  return (
    <footer className="py-10 border-t border-charcoal">
      <div className="text-center">
        <p className="text-small text-text-secondary mb-3">
          © 2026 MarketPulse AI
        </p>
        <p className="text-small text-text-muted mb-5 max-w-xs mx-auto">
          For educational purposes only. Not financial advice.
        </p>
        <div className="flex justify-center gap-6 text-small text-text-secondary">
          <Link 
            href="/privacy" 
            className="hover:text-neon-volt transition-colors"
          >
            Privacy
          </Link>
          <span className="text-text-muted">|</span>
          <Link 
            href="/terms" 
            className="hover:text-neon-volt transition-colors"
          >
            Terms
          </Link>
          <span className="text-text-muted">|</span>
          <Link 
            href="/contact" 
            className="hover:text-neon-volt transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
