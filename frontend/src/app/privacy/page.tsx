'use client'

import Link from 'next/link'

/**
 * Privacy Policy Page
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-text mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">1. Information We Collect</h2>
            <p className="text-text-secondary">
              Our AI Stock Diagnostic System collects minimal information necessary to provide our services:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Stock symbols and queries you submit for analysis</li>
              <li>Usage patterns to improve our AI models</li>
              <li>Anonymous analytics data for service optimization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">2. How We Use Your Information</h2>
            <p className="text-text-secondary">
              The information we collect is used exclusively for:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Providing AI-powered stock analysis and insights</li>
              <li>Improving our analytical models and accuracy</li>
              <li>Enhancing user experience and interface</li>
              <li>Generating anonymous statistical reports</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">3. Data Security</h2>
            <p className="text-text-secondary">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Encrypted data transmission (HTTPS)</li>
              <li>Secure server infrastructure</li>
              <li>Regular security audits and updates</li>
              <li>No permanent storage of personal identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">4. Third-Party Services</h2>
            <p className="text-text-secondary">
              Our system utilizes the following third-party services:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Yahoo Finance API for stock market data</li>
              <li>SiliconFlow AI for analysis generation</li>
              <li>WhatsApp for personalized communication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">5. Disclaimer</h2>
            <p className="text-text-secondary">
              This system provides AI-generated analysis for educational and reference purposes only. 
              We do not provide investment advice. All investment decisions should be made after 
              consulting with qualified financial advisors and conducting your own due diligence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">6. Contact Us</h2>
            <p className="text-text-secondary">
              If you have questions about this Privacy Policy, please contact us through our{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Page
              </Link>
              .
            </p>
          </section>

          <section className="border-t border-gray-700 pt-6 mt-8">
            <p className="text-text-secondary text-sm">
              Last Updated: April 2024
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
