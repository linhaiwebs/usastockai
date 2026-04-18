'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-obsidian text-on-background font-body">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-full mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00FFA3] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            <span className="font-headline tracking-[-0.02em] uppercase text-xl font-black text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.4)]">NEURAL ALPHA</span>
          </Link>
        </div>
        <div className="bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent h-[1px] bottom-0 absolute w-full"></div>
      </header>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 liquid-silver-gradient uppercase">Privacy Policy</h1>
          <p className="text-on-surface-variant text-sm mb-12 font-headline tracking-widest uppercase">Last updated: April 2026</p>

          <div className="space-y-10">
            <section>
              <h2 className="font-headline text-xl font-bold text-primary-container uppercase tracking-tight mb-4">1. Information We Collect</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We collect information you provide directly when using NEURAL ALPHA, including stock symbols you search for, analysis requests, and any data you voluntarily submit. We also automatically collect certain technical information when you visit our platform, including your IP address, browser type, device information, and usage patterns through cookies and similar technologies.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">2. How We Use Your Information</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We use the information we collect to provide, maintain, and improve our AI stock analysis services, process your analysis requests, send you stock reports via WhatsApp or other delivery methods, communicate with you about your account or our services, monitor and analyze usage patterns to improve user experience, and detect and prevent fraud or abuse.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">3. Data Sharing</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We do not sell your personal information to third parties. We may share your information with service providers who assist in operating our platform (such as AI model providers, cloud hosting services, and communication platforms), law enforcement when required by law, and business partners with your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">4. Data Security</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We implement industry-standard security measures to protect your data, including encryption in transit and at rest, regular security audits, access controls, and monitoring systems. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">5. Cookies</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We use cookies and similar tracking technologies to enhance your experience, analyze platform usage, and deliver personalized content. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of the platform.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">6. Third-Party Links</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party services you access.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">7. Your Rights</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also have the right to opt out of certain data processing activities. To exercise these rights, please contact us through the information provided below.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">8. Changes to This Policy</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-headline text-xl font-bold text-primary uppercase tracking-tight mb-4">9. Contact Us</h2>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-primary-container hover:underline">contact us</Link>.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-outline-variant/10">
            <Link href="/" className="text-primary-container font-headline font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
              ← Back to NEURAL ALPHA
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
