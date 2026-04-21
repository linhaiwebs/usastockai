'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">AI Stock Diagnosis</div>
        <Link href="/" className="text-brand text-sm font-medium hover:text-brand-dark transition-colors">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when contacting us via WhatsApp, including your phone number and any messages you send. We also collect basic usage data through analytics tools.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">2. How We Use Information</h2>
            <p>Your information is used solely to deliver the free AI stock diagnosis content you requested and to improve our service. We do not sell or share your personal data with third parties.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">3. WhatsApp Communication</h2>
            <p>By contacting us via WhatsApp, you consent to receiving educational content and topic overviews. You may opt out at any time by sending a stop request.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">5. Cookies</h2>
            <p>We use analytics cookies to understand how visitors interact with our website. You can disable cookies through your browser settings.</p>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us via WhatsApp to exercise these rights.</p>
          </section>
          <p className="text-xs text-slate-400 pt-8">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  )
}
