'use client'

import Link from 'next/link'

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer className="py-8 border-t border-gray-700">
      <div className="text-center">
        <p className="text-text-secondary text-sm mb-2">
          © 2026 Stock AI Diagnostic System
        </p>
        <p className="text-text-secondary text-xs">
          For learning and reference only, not investment advice
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-text-secondary">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Use</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
        </div>
      </div>
    </footer>
  )
}
