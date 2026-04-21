import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '../components/GoogleAnalytics'

const BUILD_VER = process.env.NEXT_BUILD_VER || `b${Date.now()}`

export const metadata: Metadata = {
  title: 'Fidex AI | Stock Diagnosis',
  description: 'AI-powered stock diagnosis and analysis. Get instant insights and risk assessment for any stock.',
  other: {
    'x-ver': BUILD_VER,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f9f5ff',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/manrope-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-800.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen selection:bg-primary/20 selection:text-primary antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
