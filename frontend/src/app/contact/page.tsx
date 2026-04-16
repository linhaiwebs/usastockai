'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/15">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="text-xl font-bold tracking-[0.2em] text-primary font-headline uppercase">STOCK_DIAGNOSTIC</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 text-glow uppercase">Contact Us</h1>
          <p className="text-on-surface-variant text-sm mb-12 font-headline tracking-widest uppercase">GET IN TOUCH</p>

          <div className="space-y-8">
            <section className="glass-card p-8 rounded-[2rem] border border-outline-variant/15">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">chat</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface uppercase">WhatsApp</h2>
                  <p className="text-on-surface-variant text-xs font-body">Fastest response — 24/7 availability</p>
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm mb-4">
                Reach our team directly via WhatsApp for support, inquiries, or to request a full AI stock analysis report. We typically respond within minutes.
              </p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-headline font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-green-500/20"
              >
                <span className="material-symbols-outlined">chat</span>
                Chat on WhatsApp
              </a>
            </section>

            <section className="glass-card p-8 rounded-[2rem] border border-outline-variant/15">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">mail</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface uppercase">Email</h2>
                  <p className="text-on-surface-variant text-xs font-body">For detailed inquiries</p>
                </div>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                For partnership inquiries, technical support, or other detailed questions, please email us at{' '}
                <a href="mailto:support@stockintel.ai" className="text-primary hover:underline">support@stockintel.ai</a>.
              </p>
            </section>

            <section className="glass-card p-8 rounded-[2rem] border border-outline-variant/15">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-2xl">help</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface uppercase">FAQ</h2>
                  <p className="text-on-surface-variant text-xs font-body">Quick answers</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-headline font-bold text-on-surface mb-1">Is STOCK_DIAGNOSTIC a financial advisor?</p>
                  <p className="text-on-surface-variant leading-relaxed">No. STOCK_DIAGNOSTIC provides AI-generated analysis for informational purposes only. It is not a substitute for professional financial advice.</p>
                </div>
                <div className="border-t border-outline-variant/15 pt-4">
                  <p className="font-headline font-bold text-on-surface mb-1">How accurate is the AI stock analysis?</p>
                  <p className="text-on-surface-variant leading-relaxed">Our AI models analyze vast amounts of market data but no prediction system is 100% accurate. Always conduct your own research and consult financial professionals before investing.</p>
                </div>
                <div className="border-t border-outline-variant/15 pt-4">
                  <p className="font-headline font-bold text-on-surface mb-1">Is my data secure?</p>
                  <p className="text-on-surface-variant leading-relaxed">Yes. We use industry-standard encryption and security practices. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-outline-variant/15">
            <Link href="/" className="text-primary font-headline font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
              ← Back to STOCK_DIAGNOSTIC
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
