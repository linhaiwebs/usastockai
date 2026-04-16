'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-nav border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            <span className="text-xl font-bold tracking-[0.2em] text-primary font-headline uppercase">AVANT_ANALYST</span>
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 text-glow uppercase">Terms of Service</h1>
          <p className="text-on-surface-variant text-sm mb-12 font-headline tracking-widest uppercase">Last updated: April 2026</p>

          <div className="space-y-10">
            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">1. Acceptance of Terms</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                By accessing or using AVANT_ANALYST (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and others who access the Service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">2. Description of Service</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                AVANT_ANALYST provides AI-powered stock analysis and market intelligence tools. The Service generates automated analysis reports based on market data and artificial intelligence models. All analysis provided is for informational purposes only and should not be considered as financial advice, investment recommendations, or solicitations to buy or sell securities.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">3. Disclaimer of Financial Advice</h2>
              <div className="glass-card p-6  border-l-4 border-secondary/50 mb-4">
                <p className="text-on-surface leading-relaxed text-sm font-medium">
                  ⚠️ IMPORTANT: AVANT_ANALYST does not provide financial advice, investment advice, or any form of professional advisory services. The AI-generated stock analysis is based on computational models and historical data, which may not predict future market performance. Always consult a qualified financial advisor before making investment decisions.
                </p>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Past performance is not indicative of future results. Stock markets are inherently volatile and unpredictable. You acknowledge that any investment decisions made based on information from AVANT_ANALYST are made at your own risk.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">4. User Responsibilities</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                You are responsible for maintaining the confidentiality of any account credentials, ensuring that your use of the Service complies with all applicable laws and regulations, conducting your own due diligence before making any investment decisions, and not using the Service for any unlawful purpose or in any way that could damage the Service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">5. Intellectual Property</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                All content, features, and functionality of AVANT_ANALYST — including but not limited to text, graphics, logos, design elements, AI models, and software — are owned by AVANT_ANALYST and protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">6. Limitation of Liability</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                To the maximum extent permitted by law, AVANT_ANALYST shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, any errors or inaccuracies in the analysis provided, any interruption or cessation of the Service, or any financial losses resulting from investment decisions made based on information from the Service.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">7. Service Modifications</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We may also impose limits on certain features or restrict access to parts of the Service at our sole discretion. We will make reasonable efforts to notify users of significant changes.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">8. Governing Law</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of the Service shall be resolved through appropriate legal channels in the applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">9. Changes to Terms</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We reserve the right to update these Terms of Service at any time. Changes will be effective immediately upon posting on this page. Your continued use of the Service after any changes constitutes acceptance of the new terms. We encourage you to review these terms periodically.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">10. Contact</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                If you have questions about these Terms of Service, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5">
            <Link href="/" className="text-primary font-headline font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
              ← Back to AVANT_ANALYST
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
