import type { Metadata, Viewport } from 'next'
import './globals.css'
import GATracker from '../components/GATracker'

const VERSION = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  title: 'AI Stock Diagnosis | QStock',
  description: 'Real-time market data powered by advanced AI algorithms for precise trading decisions.',
  other: { 'x-ver': VERSION },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#faf8ff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/plus-jakarta-sans-800.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/space-grotesk-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen selection:bg-primary selection:text-on-primary antialiased">
        <GATracker />
        {children}
      </body>
    </html>
  )
}
