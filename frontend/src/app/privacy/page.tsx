'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="glass-nav border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-primary font-headline font-bold tracking-[0.2em] uppercase text-sm">ETHEREAL AI</Link>
        <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors text-xs font-headline">← Back</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-headline font-bold gradient-text mb-8">Privacy Policy</h1>
        <div className="space-y-6 font-body text-on-surface-variant leading-relaxed text-sm">
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as stock symbols entered for AI analysis and any data submitted through contact forms. We also automatically collect usage data including page views, interaction patterns, and device information to improve our AI analysis services.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">2. How We Use Your Data</h2>
            <p>Your data is used to deliver AI-powered stock analysis, improve analysis accuracy, and personalize your experience. We may use aggregated, anonymized data to train and refine our quantitative models. We do not use your personal data to make investment decisions on your behalf.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">3. Data Sharing</h2>
            <p>We do not sell personal data to third parties. We may share anonymized analytics with service providers who assist in operating our platform. All data processing complies with applicable privacy regulations.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">4. Google Analytics &amp; Advertising</h2>
            <p>We use Google Analytics to collect and analyze usage data such as page views, user interactions, and device information. Google Analytics uses cookies to track user behavior. This data is used to improve our services and may be used for advertising purposes. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
            <p className="mt-2">We may also use Google Ads and other advertising platforms that use cookies and similar technologies to serve ads and track ad performance. These third-party ad services may collect information about your visits to our website and other websites to provide targeted advertisements.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">5. Data Security</h2>
            <p>We implement industry-standard encryption and security measures to protect your information. All data transmissions are secured using TLS encryption, and stored data is protected using AES-256 encryption.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may opt out of analytics tracking at any time. To exercise these rights, please contact us through our contact page.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">7. Cookies</h2>
            <p>We use essential cookies for platform functionality and analytics cookies (including Google Analytics) to improve our services. Third-party advertising partners may also set cookies for ad targeting and measurement. You may manage cookie preferences through your browser settings.</p>
          </section>
          <section>
            <h2 className="font-headline font-bold text-on-surface text-lg mb-3">8. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to provide our services or as required by law. Anonymized, aggregated data may be retained indefinitely for research and model improvement purposes.</p>
          </section>
          <p className="text-xs text-on-surface-variant/60 pt-8">Last updated: April 2026</p>
        </div>
      </main>
    </div>
  )
}
