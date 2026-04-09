'use client'

import { useState, useEffect } from 'react'
import { getRedirectInfo, recordRedirectClick } from '@/lib/api'

interface RedirectPageProps {
  id: number
}

/**
 * 分流中间页 - 显示目标URL预览和确认
 */
export function RedirectPage({ id }: RedirectPageProps) {
  const [targetUrl, setTargetUrl] = useState<string>('')
  const [countdown, setCountdown] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRedirectInfo()
  }, [id])

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
      setLoading(false)
    } catch (err: any) {
      console.error('Failed to fetch redirect info:', err)
      setError(err.message || '链接不存在')
      setLoading(false)
    }
  }

  const handleRedirect = async () => {
    try {
      await recordRedirectClick(id)
      window.location.href = targetUrl
    } catch (err) {
      console.error('Failed to record click:', err)
      // 即使记录失败也跳转
      window.location.href = targetUrl
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-loss/30 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text mb-2">链接无效</h2>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            返回上一页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-gray-700 rounded-2xl p-8 text-center">
        {/* 图标 */}
        <div className="text-6xl mb-4">🔗</div>

        {/* 标题 */}
        <h2 className="text-xl font-bold text-text mb-2">
          即将跳转
        </h2>

        {/* 目标URL */}
        <div className="mb-6 p-3 bg-background border border-gray-700 rounded-lg">
          <p className="text-xs text-text-secondary mb-1">目标地址</p>
          <p className="text-sm text-primary break-all">{targetUrl}</p>
        </div>

        {/* 倒计时 */}
        <div className="mb-6">
          <div className="text-4xl font-bold text-primary mb-2">
            {countdown}
          </div>
          <p className="text-sm text-text-secondary">
            秒后自动跳转
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 bg-gray-700 text-text rounded-lg hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleRedirect}
            className="flex-1 py-3 bg-hero-gradient text-white rounded-lg hover:shadow-lg transition-all"
          >
            立即跳转
          </button>
        </div>

        {/* 安全提示 */}
        <p className="mt-6 text-xs text-text-secondary">
          请确认目标地址安全后再继续
        </p>
      </div>
    </div>
  )
}
