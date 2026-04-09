'use client'

import Link from 'next/link'

/**
 * Contact Us Page
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-text mb-8">Contact Us</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-text mb-3">Get in Touch</h2>
            <p className="text-text-secondary">
              Have questions, feedback, or suggestions about our Stock AI Diagnostic System? 
              We'd love to hear from you!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">WhatsApp Support</h2>
            <p className="text-text-secondary mb-4">
              For personalized stock analysis and support, connect with us on WhatsApp:
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Connect on WhatsApp
            </a>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text mb-2">Q: How accurate is the AI analysis?</h3>
                <p className="text-text-secondary text-sm">
                  A: Our AI provides analysis based on available market data and historical patterns. However, stock market predictions are inherently uncertain. The analysis should be used as one of many tools for investment research, not as definitive investment advice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-text mb-2">Q: Is this service free to use?</h3>
                <p className="text-text-secondary text-sm">
                  A: Yes, the basic diagnostic features are free to use. We offer personalized analysis through WhatsApp for users seeking more detailed insights.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-text mb-2">Q: What data sources do you use?</h3>
                <p className="text-text-secondary text-sm">
                  A: We use Yahoo Finance API for real-time stock market data, combined with AI-powered analysis from SiliconFlow's advanced models.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-text mb-2">Q: How often is the analysis updated?</h3>
                <p className="text-text-secondary text-sm">
                  A: Our AI generates fresh analysis for each query, incorporating the latest available market data and trends.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">Response Time</h2>
            <p className="text-text-secondary">
              We typically respond to inquiries within 24-48 hours. For urgent matters, please reach out via WhatsApp for faster assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text mb-3">Additional Resources</h2>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-primary hover:underline text-sm"
              >
                Privacy Policy →
              </Link>
              <Link
                href="/terms"
                className="text-primary hover:underline text-sm"
              >
                Terms of Use →
              </Link>
            </div>
          </section>

          <section className="border-t border-gray-700 pt-6 mt-8">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-text-secondary text-sm">
                <strong className="text-text">Important:</strong> For investment decisions, always consult with qualified financial advisors. 
                Our AI analysis is for educational purposes only and should not be considered as financial advice.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
