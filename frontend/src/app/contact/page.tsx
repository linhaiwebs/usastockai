'use client'
import Link from 'next/link'
export default function ContactPage() {
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
        <h1 className="text-headline-lg font-bold text-on-surface mb-8">Contact Us</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-body-md">
          <section><h2 className="font-semibold text-on-surface text-headline-md mb-3">Get in Touch</h2><p>Have questions about our AI stock diagnosis platform? Need support? We are here to help.</p></section>
          <section className="bg-surface-container border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">chat</span>
              <div><p className="font-semibold text-on-surface text-label-md mb-0.5">WhatsApp</p><p className="text-on-surface-variant">Available for instant support and free AI stock diagnosis</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">mail</span>
              <div><p className="font-semibold text-on-surface text-label-md mb-0.5">Email</p><p className="text-on-surface-variant">support@stockai.com</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">schedule</span>
              <div><p className="font-semibold text-on-surface text-label-md mb-0.5">Response Time</p><p className="text-on-surface-variant">Within 24 hours on business days</p></div>
            </div>
          </section>
          <section><h2 className="font-semibold text-on-surface text-headline-md mb-3">Technical Support</h2><p>If you encounter issues with the AI diagnosis platform or any other feature, please include your browser version and a description of the problem when contacting us.</p></section>
        </div>
      </main>
    </div>
  )
}
