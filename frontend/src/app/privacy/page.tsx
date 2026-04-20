'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white px-3 pt-6 pb-4 border-b border-gray-100">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-pink-500 text-sm">AI Stock Diagnosis</Link>
          <Link href="/" className="text-[10px] text-gray-500 hover:text-gray-900 transition">&larr; Back</Link>
        </div>
      </header>
      <main className="max-w-sm mx-auto px-3 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-gray-600 text-xs leading-relaxed">
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">1. Information We Collect</h2><p>We collect information you provide directly, such as stock symbols entered for AI diagnosis and any data submitted through contact forms. We also automatically collect usage data including page views, interaction patterns, and device information.</p></section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">2. How We Use Your Data</h2><p>Your data is used to deliver AI-powered stock analysis, improve diagnostic accuracy, and personalize your experience. We may use aggregated, anonymized data to train and refine our quantitative models.</p></section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">3. Data Sharing</h2><p>We do not sell personal data to third parties. We may share anonymized analytics with service providers who assist in operating our platform.</p></section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">4. Data Security</h2><p>We implement industry-standard encryption and security measures to protect your information. All data transmissions are secured using TLS encryption.</p></section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">5. Your Rights</h2><p>You have the right to access, correct, or delete your personal data. You may opt out of analytics tracking at any time.</p></section>
          <section className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100"><h2 className="font-bold text-gray-900 text-sm mb-2">6. Cookies</h2><p>We use essential cookies for platform functionality and analytics cookies to improve our services.</p></section>
          <p className="text-[10px] text-gray-400 pt-4">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  )
}
