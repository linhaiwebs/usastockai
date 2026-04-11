'use client'

import GoogleAnalytics from '@/components/GoogleAnalytics'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  )
}
