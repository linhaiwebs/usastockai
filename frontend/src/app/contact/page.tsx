'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-primary font-bold text-sm">AI Stock Diagnosis</Link>
        <Link href="/" className="text-gray-500 hover:text-primary transition-colors text-xs font-headline">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Contact Us</h1>
        <div className="space-y-6 font-body text-gray-500 leading-relaxed text-sm">
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">Get in Touch</h2>
            <p>Have questions about our AI stock diagnosis platform? Need technical support? We are here to help.</p>
          </section>
          <section className="bg-brand-gray rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <p className="font-headline text-xs text-gray-500 uppercase tracking-widest mb-1">Email</p>
                <p className="text-on-surface">support@fidex-ai.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">chat</span>
              <div>
                <p className="font-headline text-xs text-gray-500 uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-on-surface">Available for instant support and free AI stock reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <div>
                <p className="font-headline text-xs text-gray-500 uppercase tracking-widest mb-1">Response Time</p>
                <p className="text-on-surface">Within 24 hours on business days</p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">Technical Support</h2>
            <p>If you encounter issues with the AI diagnosis engine, search functionality, or any other feature, please include your browser version and a description of the problem when contacting us.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
