'use client'

import { useState, useEffect } from 'react'
import { getRedirectInfo, recordRedirectClick } from '@/lib/api'

interface RedirectPageProps {
  id: number
}

export function RedirectPage({ id }: RedirectPageProps) {
  const [targetUrl, setTargetUrl] = useState<string>('')
  const [countdown, setCountdown] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchRedirectInfo() }, [id])

  useEffect(() => {
    if (countdown > 0 && targetUrl) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && targetUrl) {
      handleRedirect()
    }
  }, [countdown, targetUrl])

  const fetchRedirectInfo = async () => {
    try {
      const data = await getRedirectInfo(id)
      setTargetUrl(data.url)
    } catch (err: any) {
      setError(err.message || 'Link does not exist')
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = async () => {
    try {
      await recordRedirectClick(id)
      window.location.href = targetUrl
    } catch (err) {
      window.location.href = targetUrl
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-border-default rounded-2xl p-8 text-center shadow-card">
          <div className="w-10 h-10 border-[3px] border-surface-muted border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl p-8 text-center shadow-card">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Invalid Link</h2>
          <p className="text-text-secondary">{error}</p>
          <button onClick={() => window.history.back()} className="mt-6 px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border-default rounded-2xl p-8 text-center shadow-card">
        <div className="text-5xl mb-4">🔗</div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Redirecting</h2>
        <div className="mb-6 p-3 bg-surface-alt border border-border-default rounded-xl">
          <p className="text-xs text-text-muted mb-1">Target Address</p>
          <p className="text-sm text-brand break-all">{targetUrl}</p>
        </div>
        <div className="mb-6">
          <div className="text-4xl font-bold text-brand mb-2">{countdown}</div>
          <p className="text-sm text-text-secondary">seconds until auto redirect</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.history.back()} className="flex-1 py-3 bg-surface-alt text-text-primary rounded-lg font-medium hover:bg-surface-muted transition-colors">
            Cancel
          </button>
          <button onClick={handleRedirect} className="flex-1 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
            Redirect Now
          </button>
        </div>
        <p className="mt-6 text-xs text-text-muted">Please verify the target address is safe before continuing</p>
      </div>
    </div>
  )
}
