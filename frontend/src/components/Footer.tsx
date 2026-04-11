'use client'

import Link from 'next/link'

/**
 * Footer Component - BMW Design System
 * Sharp corners, tight line-heights, minimal styling
 */
export function Footer() {
  return (
    <footer className="py-10 border-t border-border-default">
      <div className="text-center">
        <p className="text-small text-text-secondary mb-3 uppercase">
          © 2026 StockAI
        </p>
        <p className="text-small text-text-muted mb-5 max-w-xs mx-auto">
          For educational purposes only. Not financial advice.
        </p>
        <div className="flex justify-center gap-6 text-small text-text-secondary">
          <Link 
            href="/privacy" 
            className="hover:text-bmw-blue transition-colors uppercase"
          >
            Privacy
          </Link>
          <span className="opacity-30">|</span>
          <Link 
            href="/terms" 
            className="hover:text-bmw-blue transition-colors uppercase"
          >
            Terms
          </Link>
          <span className="opacity-30">|</span>
          <Link 
            href="/contact" 
            className="hover:text-bmw-blue transition-colors uppercase"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
