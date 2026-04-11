'use client'

import Link from 'next/link'

/**
 * Footer Component - Airbnb style with clean white background
 */
export function Footer() {
  return (
    <footer className="py-10 border-t border-border-light">
      <div className="text-center">
        <p 
          className="text-body text-text-secondary mb-3"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          © 2026 AI Stock Analysis Platform
        </p>
        <p 
          className="text-small text-text-secondary opacity-70 mb-5 max-w-xs mx-auto"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          For educational purposes only. Not financial advice.
        </p>
        <div className="flex justify-center gap-6 text-body text-text-secondary">
          <Link 
            href="/privacy" 
            className="hover:text-rausch transition-colors"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Privacy
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/terms" 
            className="hover:text-rausch transition-colors"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Terms
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/contact" 
            className="hover:text-rausch transition-colors"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
