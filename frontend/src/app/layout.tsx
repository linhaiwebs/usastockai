import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '../components/GoogleAnalytics'

const BUILD_VER = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  metadataBase: new URL('https://ethereal-ai.com'),
  title: 'Ethereal AI | AI Stock Analysis & Market Insights',
  description: 'AI-powered stock analysis tool. Get instant insights on US stocks with algorithmic sentiment signals and pattern recognition. For informational purposes only — not financial advice.',
  keywords: ['stock analysis', 'AI stock scanner', 'market insights', 'US stocks', 'stock sentiment', 'algorithmic analysis', 'stock research tool'],
  authors: [{ name: 'Ethereal AI' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Ethereal AI | AI Stock Analysis & Market Insights',
    description: 'AI-powered stock analysis tool. Get instant insights on US stocks with algorithmic sentiment signals. For informational purposes only.',
    siteName: 'Ethereal AI',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethereal AI | AI Stock Analysis & Market Insights',
    description: 'AI-powered stock analysis tool. Get instant insights on US stocks with algorithmic sentiment signals. For informational purposes only.',
  },
  other: {
    'x-ver': BUILD_VER,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0e18',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/space-grotesk-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen selection:bg-primary/30 selection:text-primary antialiased">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Ethereal AI',
              description: 'AI-powered stock analysis tool for informational purposes',
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              disclaimer: 'This tool provides AI-generated stock analysis for informational and educational purposes only. It does not constitute financial advice, investment recommendations, or solicitation to buy or sell securities.',
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
