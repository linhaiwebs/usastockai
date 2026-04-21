'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 py-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">AI Stock Diagnosis</div>
        <Link href="/" className="text-brand text-sm font-medium hover:text-brand-dark transition-colors">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Contact Us</h1>
        <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">Get in Touch</h2>
            <p>Have questions about our AI stock diagnosis platform? Need support? We are here to help.</p>
          </section>
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 p-2 rounded-lg text-lg">💬</span>
              <div>
                <p className="font-bold text-sm text-slate-900 mb-0.5">WhatsApp</p>
                <p className="text-slate-600">Available for instant support and free AI stock diagnosis content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 p-2 rounded-lg text-lg">📧</span>
              <div>
                <p className="font-bold text-sm text-slate-900 mb-0.5">Email</p>
                <p className="text-slate-600">support@ai-stock-diagnosis.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 p-2 rounded-lg text-lg">🕐</span>
              <div>
                <p className="font-bold text-sm text-slate-900 mb-0.5">Response Time</p>
                <p className="text-slate-600">Within 24 hours on business days</p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="font-bold text-slate-900 text-lg mb-3">Technical Support</h2>
            <p>If you encounter issues with the AI diagnosis platform or any other feature, please include your browser version and a description of the problem when contacting us.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
