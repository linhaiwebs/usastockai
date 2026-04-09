import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stock AI Diagnostic - Intelligent Stock Analysis System',
  description: 'AI-powered US stock diagnostic system providing real-time stock data, intelligent analysis, and investment recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
