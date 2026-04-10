import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false, // 等宽字体不预加载，按需加载
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0E1A',
}

export const metadata: Metadata = {
  title: 'Stock AI Diagnostic - Intelligent Stock Analysis System',
  description: 'AI-powered US stock diagnostic system providing real-time stock data, intelligent analysis, and investment recommendations',
  keywords: ['stock analysis', 'AI', 'US stocks', 'investment', 'real-time quotes', 'stock diagnostic'],
  authors: [{ name: 'Stock AI Team' }],
  creator: 'Stock AI',
  publisher: 'Stock AI',
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
    title: 'Stock AI Diagnostic - Intelligent Stock Analysis',
    description: 'AI-powered US stock diagnostic system',
    siteName: 'Stock AI Diagnostic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock AI Diagnostic',
    description: 'AI-powered US stock diagnostic system',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
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
