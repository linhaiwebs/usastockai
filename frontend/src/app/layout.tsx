import type { Metadata, Viewport } from 'next'
import './globals.css'
import GATracker from '../components/GATracker'

const VERSION = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  title: 'AI Stock Diagnosis',
  description: 'AI-powered stock diagnosis in seconds. Real-time market insights for smarter investment decisions.',
  other: { 'x-ver': VERSION },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen selection:bg-pink-400 selection:text-white antialiased">
        <GATracker />
        {children}
      </body>
    </html>
  )
}
