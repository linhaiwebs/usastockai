'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="bg-neutral-950 text-lime-400 sticky top-0 z-50 border-b border-white/10 flex justify-between items-center w-full px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container text-lg">smart_toy</span>
          </div>
          <span className="text-2xl font-black italic text-primary-container tracking-tighter">StockAI</span>
        </div>
        <Link href="/" className="text-on-surface-variant text-label-md font-medium hover:text-primary-container transition-colors">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-headline-lg font-bold text-on-surface mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-body-md">
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as stock symbols entered for AI diagnosis and any data submitted through contact forms. We also automatically collect usage data including page views, interaction patterns, and device information.</p>
          </section>
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">2. How We Use Your Data</h2>
            <p>Your data is used to deliver AI-powered stock analysis, improve diagnostic accuracy, and personalize your experience. We may use aggregated, anonymized data to train and refine our quantitative models.</p>
          </section>
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">3. Data Sharing</h2>
            <p>We do not sell personal data to third parties. We may share anonymized analytics with service providers who assist in operating our platform.</p>
          </section>
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">4. Data Security</h2>
            <p>We implement industry-standard encryption and security measures to protect your information. All data transmissions are secured using TLS encryption.</p>
          </section>
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may opt out of analytics tracking at any time.</p>
          </section>
          <section>
            <h2 className="font-semibold text-on-surface text-headline-md mb-3">6. Cookies</h2>
            <p>We use essential cookies for platform functionality and analytics cookies to improve our services. You may manage cookie preferences through your browser settings.</p>
          </section>
          <p className="text-xs text-on-surface-variant/60 pt-8">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  )
}
