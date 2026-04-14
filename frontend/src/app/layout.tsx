import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
  weight: ['400', '500', '600', '700', '800'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#137fec',
}

export const metadata: Metadata = {
  title: 'Planet Discovery — AI Stock Analysis',
  description: 'Discover insights about any US stock with AI-powered real-time analysis. Scan 10,000+ articles instantly.',
  keywords: ['stock analysis', 'AI', 'US stocks', 'investment', 'real-time news', 'market analysis'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Planet Discovery — AI Stock Analysis',
    description: 'Discover insights about any US stock with AI-powered real-time analysis.',
    siteName: 'Planet Discovery',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planet Discovery — AI Stock Analysis',
    description: 'Discover insights about any US stock with AI-powered real-time analysis.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-white text-text-primary">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
