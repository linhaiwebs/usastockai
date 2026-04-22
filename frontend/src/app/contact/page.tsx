'use client'
import Link from 'next/link'
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-50 bg-[#0F0F0F] border-b border-white/5 py-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-primary-fixed">smart_toy</span>
          </div>
          <span className="text-xl font-bold text-white">AI Stock Diagnosis</span>
        </div>
        <Link href="/" className="text-primary-fixed text-sm font-medium hover:text-primary-container transition-colors">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-on-surface mb-8">Contact Us</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-sm">
          <section><h2 className="font-bold text-on-surface text-lg mb-3">Get in Touch</h2><p>Have questions about our AI stock diagnosis platform? Need support? We are here to help.</p></section>
          <section className="bg-surface-container border border-white/5 rounded-[1.5rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">chat</span>
              <div><p className="font-bold text-on-surface text-sm mb-0.5">WhatsApp</p><p className="text-on-surface-variant">Available for instant support and free AI stock diagnosis</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">mail</span>
              <div><p className="font-bold text-on-surface text-sm mb-0.5">Email</p><p className="text-on-surface-variant">support@ai-stock-diagnosis.com</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">schedule</span>
              <div><p className="font-bold text-on-surface text-sm mb-0.5">Response Time</p><p className="text-on-surface-variant">Within 24 hours on business days</p></div>
            </div>
          </section>
          <section><h2 className="font-bold text-on-surface text-lg mb-3">Technical Support</h2><p>If you encounter issues with the AI diagnosis platform or any other feature, please include your browser version and a description of the problem when contacting us.</p></section>
        </div>
      </main>
    </div>
  )
}
