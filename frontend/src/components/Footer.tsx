'use client'

/**
 * Footer Component
 */
export function Footer() {
  return (
    <footer className="py-8 border-t border-gray-700">
      <div className="text-center">
        <p className="text-text-secondary text-sm mb-2">
          © 2024 Stock AI Diagnostic System
        </p>
        <p className="text-text-secondary text-xs">
          For learning and reference only, not investment advice
        </p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-text-secondary">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Terms of Use</a>
          <span>·</span>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  )
}
