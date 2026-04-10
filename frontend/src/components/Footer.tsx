'use client'

import Link from 'next/link'

/**
 * Footer Component - Revolut style with minimal design
 * Clean, flat layout with no shadows
 */
export function Footer() {
  return (
    <footer className="py-16 px-4 border-t-2 border-gray-tone">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p 
            className="text-body font-medium text-revolut-dark mb-3"
          >
            © 2026 AI Stock Analysis Platform
          </p>
          <p 
            className="text-body text-mid-slate mb-8 max-w-md mx-auto"
            style={{ letterSpacing: '0.24px' }}
          >
            For educational purposes only. Not financial advice.
          </p>
          <div className="flex justify-center gap-8 text-body text-mid-slate">
            <Link 
              href="/privacy" 
              className="hover:text-revolut-dark transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="hover:text-revolut-dark transition-colors"
            >
              Terms
            </Link>
            <Link 
              href="/contact" 
              className="hover:text-revolut-dark transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
