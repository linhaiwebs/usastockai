'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-outline-variant/10 px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-primary font-headline font-black tracking-tighter text-xl">SOVEREIGN</Link>
          <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors text-xs">← Back</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-headline font-bold text-primary mb-8">Contact &amp; Support</h1>
        <div className="space-y-6 font-body text-on-surface-variant leading-relaxed text-sm">
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">Get in Touch</h2>
            <p>Have questions about our AI stock diagnosis platform? Need technical support? We are here to help.</p>
          </section>
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Email</p>
                <p className="text-on-surface">support@sovereigninsight.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary-fixed-dim">chat</span>
              <div>
                <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-on-surface">Available for instant support and free AI stock reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
              <div>
                <p className="font-headline text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Response Time</p>
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
