'use client'

import Link from 'next/link'

/**
 * Footer Component - Wise style with clean typography
 */
export function Footer() {
  return (
    <footer className="py-8 border-t border-near-black/10">
      <div className="text-center">
        <p className="text-gray text-sm mb-2 font-medium" style={{ fontFeatureSettings: '"calt"' }}>
          © 2026 Stock AI Diagnostic System
        </p>
        <p className="text-gray text-xs" style={{ fontFeatureSettings: '"calt"' }}>
          For learning and reference only, not investment advice
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray">
          <Link href="/privacy" className="hover:text-dark-green transition-colors font-medium">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-dark-green transition-colors font-medium">Terms of Use</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-dark-green transition-colors font-medium">Contact Us</Link>
        </div>
      </div>
    </footer>
  )
}
