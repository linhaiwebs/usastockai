'use client'

import { useState, useEffect, useRef } from 'react'
import { getAnalyzeStreamUrl, assignRedirect, recordRedirectClick } from '@/lib/api'

interface AnalysisModalProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

/**
 * AI 分析弹窗 - 支持流式输出 + WhatsApp转化按钮
 */
export function AnalysisModal({ query, isOpen, onClose }: AnalysisModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [redirectId, setRedirectId] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && query) {
      startAnalysis()
    }
  }, [isOpen, query])

  const startAnalysis = async () => {
    setLoading(true)
    setContent('')
    setError(null)
    setShowWhatsAppButton(false)
    setRedirectUrl(null)
    setRedirectId(null)

    try {
      const url = getAnalyzeStreamUrl(query)
      const eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        const chunk = event.data
        setContent((prev) => prev + chunk)
      }

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err)
        setError('Connection interrupted, please retry')
        eventSource.close()
        setLoading(false)
      }

      // 监听完成事件
      eventSource.addEventListener('done', () => {
        eventSource.close()
        setLoading(false)
        // 分析完成后显示WhatsApp按钮
        setShowWhatsAppButton(true)
        loadRedirectUrl()
      })

      // 存储 EventSource 以便清理
      return () => {
        eventSource.close()
      }
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed')
      setLoading(false)
    }
  }

  const loadRedirectUrl = async () => {
    try {
      const data = await assignRedirect()
      setRedirectUrl(data.url)
      setRedirectId(data.id)
    } catch (err) {
      console.error('Failed to load redirect URL:', err)
    }
  }

  const handleWhatsAppClick = async () => {
    if (!redirectId || !redirectUrl) return
    
    try {
      // 记录点击
      await recordRedirectClick(redirectId)
      
      // 打开WhatsApp链接
      window.open(redirectUrl, '_blank')
    } catch (err) {
      console.error('Failed to record click:', err)
      // 即使记录失败，也打开链接
      if (redirectUrl) {
        window.open(redirectUrl, '_blank')
      }
    }
  }

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] bg-surface border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text">AI Analysis Report</h2>
            <p className="text-sm text-text-secondary">Query: {query}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div
          ref={contentRef}
          className="p-4 overflow-y-auto max-h-[60vh]"
        >
          {/* 加载状态 */}
          {loading && content.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-text-secondary">AI is analyzing...</p>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-loss/10 border border-loss/30 rounded-lg">
              <p className="text-loss">{error}</p>
              <button
                onClick={startAnalysis}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* 分析内容 */}
          {content && (
            <div className="prose prose-invert max-w-none">
              {/* 处理 DeepSeek R1 的 <think/> 标签 */}
              {content.split('<think/>').map((part, index) => {
                if (index === 0) {
                  // 第一部分是思考过程（如果有 <think/>）
                  if (content.includes('<think/>')) {
                    return (
                      <div key={index} className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-primary font-semibold mb-2">💭 Thinking Process</p>
                        <div className="text-sm text-text-secondary whitespace-pre-wrap">
                          {part}
                        </div>
                      </div>
                    )
                  }
                  // 没有 <think/> 标签，直接显示内容
                  return (
                    <div key={index} className="text-text whitespace-pre-wrap leading-relaxed">
                      {part}
                    </div>
                  )
                }
                // 后续部分是正式回答
                return (
                  <div key={index} className="text-text whitespace-pre-wrap leading-relaxed">
                    {part}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-gray-700">
          {/* WhatsApp 转化按钮 */}
          {showWhatsAppButton && (
            <div className="mb-3">
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Get Personalized Analysis on WhatsApp</span>
              </button>
            </div>
          )}
          
          {/* 状态栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              {loading && (
                <>
                  <div className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                  <span>Generating...</span>
                </>
              )}
              {!loading && content && (
                <>
                  <div className="w-2 h-2 bg-profit rounded-full" />
                  <span>Analysis Complete</span>
                </>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
