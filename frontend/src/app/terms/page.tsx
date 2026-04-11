'use client'

import Link from 'next/link'

/**
 * Terms of Use Page
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-text mb-8">Terms of Use</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">1. Acceptance of Terms</h2>
            <p className="text-text-secondary">
              By accessing and using the Stock AI Diagnostic System ("Service"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">2. Description of Service</h2>
            <p className="text-text-secondary">
              The Service provides AI-powered stock market analysis and diagnostic tools for educational and informational purposes. The Service includes:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Stock symbol analysis and diagnostics</li>
              <li>AI-generated market insights</li>
              <li>Technical and fundamental analysis reports</li>
              <li>Market trend analysis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">3. Important Disclaimers</h2>
            <div className="bg-loss/10 border border-loss/30 rounded-lg p-4 mb-3">
              <p className="text-loss font-semibold mb-2">⚠️ Investment Risk Warning</p>
              <p className="text-text-secondary text-sm">
                The Service does NOT provide investment advice. All information is for educational purposes only. 
                Past performance does not guarantee future results. Stock market investments carry significant risks.
              </p>
            </div>
            <ul className="list-disc list-inside text-text-secondary space-y-1">
              <li>AI-generated analysis may contain errors or inaccuracies</li>
              <li>Market conditions can change rapidly and unpredictably</li>
              <li>You are solely responsible for your investment decisions</li>
              <li>Always consult qualified financial advisors before investing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">4. User Responsibilities</h2>
            <p className="text-text-secondary">
              As a user of this Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to manipulate or abuse the system</li>
              <li>Not use automated scripts without permission</li>
              <li>Verify all information before making investment decisions</li>
              <li>Accept full responsibility for your investment choices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">5. Limitation of Liability</h2>
            <p className="text-text-secondary">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside text-text-secondary mt-2 space-y-1">
              <li>The Service is provided "AS IS" without warranties</li>
              <li>We are not liable for any investment losses</li>
              <li>We do not guarantee accuracy or completeness of analysis</li>
              <li>We are not responsible for third-party actions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">6. Intellectual Property</h2>
            <p className="text-text-secondary">
              The Service, including its original content, features, and functionality, is owned by us and protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">7. Modifications to Service</h2>
            <p className="text-text-secondary">
              We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">8. Governing Law</h2>
            <p className="text-text-secondary">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">9. Contact Information</h2>
            <p className="text-text-secondary">
              For questions about these Terms of Use, please visit our{' '}
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
