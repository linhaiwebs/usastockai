'use client'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#faf8ff]/70 backdrop-blur-xl z-50 shadow-[0px_20px_40px_rgba(15,23,42,0.06)]">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-[#131b2e] font-headline">
          <span className="material-symbols-outlined text-[#4F46E5]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          StockAI
        </Link>
        <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors text-sm">&larr; Back</Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-8">Contact &amp; Support</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-sm">
          <section><h2 className="font-headline font-bold text-on-surface text-lg mb-3">Get in Touch</h2><p>Have questions about our AI stock prediction platform? Need technical support? We are here to help.</p></section>
          <section className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_20px_40px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Email</p>
                <p className="text-on-surface">support@stockai.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">chat</span>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-on-surface">Available for instant support and free AI stock reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Response Time</p>
                <p className="text-on-surface">Within 24 hours on business days</p>
              </div>
            </div>
          </section>
          <section><h2 className="font-headline font-bold text-on-surface text-lg mb-3">Technical Support</h2><p>If you encounter issues with the AI diagnosis engine or any other feature, please include your browser version and a description of the problem when contacting us.</p></section>
        </div>
      </main>
    </div>
  )
}
