import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '../components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'InsightLedger — Human-Centric Market Analysis',
  description: 'AI-powered market intelligence platform — Smarter insights powered by intuitive data analysis for the modern investor. Real-time streaming analysis and actionable verdicts for US stocks.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen selection:bg-primary/30 selection:text-primary antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
