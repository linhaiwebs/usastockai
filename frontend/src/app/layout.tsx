import type { Metadata, Viewport } from 'next'
import './globals.css'
import GATracker from '../components/GATracker'

const VERSION = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  title: 'AI Stock Diagnosis | Sovereign Insight',
  description: 'Precision AI diagnostics for the sovereign investor. Institutional-grade stock analysis in seconds.',
  other: { 'x-ver': VERSION },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f7f9fb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-800.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen selection:bg-tertiary-fixed/30 selection:text-on-tertiary-fixed antialiased">
        <GATracker />
        {children}
      </body>
    </html>
  )
}
