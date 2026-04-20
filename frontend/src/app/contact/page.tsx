'use client'
import Link from 'next/link'

export default function ContactPage() {
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
        <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tighter uppercase mb-8">CONNECT_DEPT</h1>
        <div className="space-y-6 text-on-surface-variant leading-relaxed text-sm">
          <section className="bg-surface-container/60 p-6 border-l-4 border-primary">
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">Get in Touch</h2>
            <p>Have questions about our AI stock diagnosis platform? Need technical support? We are here to help.</p>
          </section>
          <section className="bg-surface-container-lowest brutalist-border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <p className="font-label text-[10px] text-white/40 uppercase tracking-widest mb-1">EMAIL</p>
                <p className="text-on-surface">support@avantanalyst.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary">forum</span>
              <div>
                <p className="font-label text-[10px] text-white/40 uppercase tracking-widest mb-1">WHATSAPP</p>
                <p className="text-on-surface">Available for instant support and free AI stock reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              <div>
                <p className="font-label text-[10px] text-white/40 uppercase tracking-widest mb-1">RESPONSE_TIME</p>
                <p className="text-on-surface">Within 24 hours on business days</p>
              </div>
            </div>
          </section>
          <section className="bg-surface-container/60 p-6 border-l-4 border-secondary">
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3 uppercase tracking-tight">Technical Support</h2>
            <p>If you encounter issues with the AI diagnosis engine or any other feature, please include your browser version and a description of the problem when contacting us.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
