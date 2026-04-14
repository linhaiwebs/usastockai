'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/adminApi'

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/adsadmin/dashboard')
    } else {
      router.push('/adsadmin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt">
      <div className="text-text-primary">Redirecting...</div>
    </div>
  )
}
