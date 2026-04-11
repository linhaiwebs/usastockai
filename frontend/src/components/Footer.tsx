'use client'

import Link from 'next/link'

/**
 * Footer Component - Airtable style with clean white background
 */
export function Footer() {
  return (
    <footer className="py-6 border-t border-border-light">
      <div className="text-center">
        <p 
          className="text-caption text-text-secondary mb-2"
          style={{ letterSpacing: '0.18px' }}
        >
          © 2026 AI Stock Doctor
        </p>
        <p 
          className="text-small text-text-secondary mb-4 max-w-xs mx-auto"
          style={{ letterSpacing: '0.08px' }}
        >
          For educational purposes only. Not financial advice.
        </p>
        <div className="flex justify-center gap-4 text-caption text-text-secondary">
          <Link 
            href="/privacy" 
            className="hover:text-airtable-blue transition-colors"
            style={{ letterSpacing: '0.18px' }}
          >
            Privacy
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/terms" 
            className="hover:text-airtable-blue transition-colors"
            style={{ letterSpacing: '0.18px' }}
          >
            Terms
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/contact" 
            className="hover:text-airtable-blue transition-colors"
            style={{ letterSpacing: '0.18px' }}
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
