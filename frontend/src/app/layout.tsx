import type { Metadata, Viewport } from 'next'
import { Inter, Inconsolata } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
  weight: ['400', '500', '600', '700', '900'],
})

const inconsolata = Inconsolata({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
  weight: ['600'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'MarketPulse AI - Real-time Stock Sentiment Analysis',
  description: 'AI scans 10,000+ articles and posts in real time. Get instant sentiment analysis for any US stock.',
  keywords: ['stock sentiment', 'AI', 'US stocks', 'investment', 'real-time news', 'market analysis', 'stock scanner'],
  authors: [{ name: 'MarketPulse AI Team' }],
  creator: 'MarketPulse AI',
  publisher: 'MarketPulse AI',
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
    type: 'website',
    locale: 'en_US',
    title: 'MarketPulse AI - Real-time Stock Sentiment Analysis',
    description: 'AI scans 10,000+ articles and posts in real time',
    siteName: 'MarketPulse AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MarketPulse AI',
    description: 'AI scans 10,000+ articles and posts in real time',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://egfjp.com',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://egfjp.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${inconsolata.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
