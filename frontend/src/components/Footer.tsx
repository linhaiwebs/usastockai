'use client'

import Link from 'next/link'

/**
 * Footer Component - Revolut style minimal design
 * Clean, flat layout with no shadows
 */
export function Footer() {
  return (
    <footer className="py-10 px-4 border-t-2 border-gray-tone">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <p 
            className="text-body font-medium text-revolut-dark mb-2"
          >
            © 2026 AI Stock Analysis Platform
          </p>
          <p 
            className="text-caption text-mid-slate mb-6 max-w-md mx-auto"
          >
            For educational purposes only. Not financial advice.
          </p>
          <div className="flex justify-center gap-6 text-body text-mid-slate">
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
