import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Stock Diagnostic Framework',
  description: 'Contrarian Analysis Engine — AI-powered stock diagnostic system',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050510',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050510] text-white antialiased">
        <div className="starfield" />
        <div className="nebula" />
        <main className="relative z-10 min-h-screen">{children}</main>
      </body>
    </html>
  )
}
