import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stock AI Diagnostic - 智能股票分析系统',
  description: '基于AI的美股诊断系统，提供实时股票数据、智能分析和投资建议',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
