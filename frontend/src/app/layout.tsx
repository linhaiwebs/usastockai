import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '../components/GoogleAnalytics'

// Build-time version fingerprint — changes every build, visible in page source
// Use to verify which version is deployed: view-source → search "x-ver"
const BUILD_VER = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  title: 'NEURAL ALPHA | AI Stock Terminal',
  description: 'Institutional-grade AI stock diagnostics. Decode whale movements and hidden volatility before the market reacts.',
  other: {
    'x-ver': BUILD_VER,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020408',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen selection:bg-primary-container/30 selection:text-primary antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
