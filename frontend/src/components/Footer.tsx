'use client'

import Link from 'next/link'

/**
 * Footer Component - Stripe style with dark brand background
 */
export function Footer() {
  return (
    <footer className="py-10 border-t border-border-default">
      <div className="text-center">
        <p 
          className="text-caption text-body-text mb-3"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          © 2026 AI Stock Analysis Platform
        </p>
        <p 
          className="text-caption-small text-body-text opacity-70 mb-5 max-w-xs mx-auto"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          For educational purposes only. Not financial advice.
        </p>
        <div className="flex justify-center gap-6 text-caption text-body-text">
          <Link 
            href="/privacy" 
            className="hover:text-stripe-purple transition-colors"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            Privacy
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/terms" 
            className="hover:text-stripe-purple transition-colors"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            Terms
          </Link>
          <span className="opacity-30">•</span>
          <Link 
            href="/contact" 
            className="hover:text-stripe-purple transition-colors"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
