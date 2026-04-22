import type { Metadata, Viewport } from 'next'
import './globals.css'
import GoogleAnalytics from '../components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'AI Stock Diagnosis | Intelligent Market Analysis',
  description: 'AI-powered stock diagnosis and predictive analysis. Get real-time market insights and risk assessment for any stock.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#131313',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/inter-500.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/material-symbols-outlined.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
