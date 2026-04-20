'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body flex flex-col">
      <header className="bg-black w-full sticky top-0 z-50 flex justify-between items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          <h1 className="text-xl font-bold text-primary tracking-tighter font-headline uppercase">AVANT_ANALYST</h1>
        </Link>
        <Link href="/" className="font-label text-[10px] text-white/40 uppercase tracking-widest hover:text-primary transition-colors">&larr; BACK</Link>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tighter uppercase mb-8">PRIVACY_POLICY</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-sm">
          <section className="bg-surface-container/60 p-6 border-l-4 border-primary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">1. Information We Collect</h2><p>We collect information you provide directly, such as stock symbols entered for AI diagnosis and any data submitted through contact forms. We also automatically collect usage data including page views, interaction patterns, and device information.</p></section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-secondary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">2. How We Use Your Data</h2><p>Your data is used to deliver AI-powered stock analysis, improve diagnostic accuracy, and personalize your experience. We may use aggregated, anonymized data to train and refine our quantitative models.</p></section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-tertiary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">3. Data Sharing</h2><p>We do not sell personal data to third parties. We may share anonymized analytics with service providers who assist in operating our platform. All data processing complies with applicable privacy regulations.</p></section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-primary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">4. Data Security</h2><p>We implement industry-standard encryption and security measures to protect your information. All data transmissions are secured using TLS encryption, and stored data is protected using AES-256 encryption.</p></section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-secondary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">5. Your Rights</h2><p>You have the right to access, correct, or delete your personal data. You may opt out of analytics tracking at any time. To exercise these rights, please contact us through our support page.</p></section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-tertiary"><h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">6. Cookies</h2><p>We use essential cookies for platform functionality and analytics cookies to improve our services. You may manage cookie preferences through your browser settings.</p></section>
          <p className="font-label text-[9px] text-white/20 uppercase tracking-widest pt-8">LAST_UPDATED: APRIL 2026</p>
        </div>
      </main>
    </div>
  )
}
