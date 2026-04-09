'use client'

import { useState, useEffect, useRef } from 'react'
import { getAnalyzeStreamUrl } from '@/lib/api'

interface AnalysisModalProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

/**
 * AI 分析弹窗 - 支持流式输出
 */
export function AnalysisModal({ query, isOpen, onClose }: AnalysisModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    try {
      const url = getAnalyzeStreamUrl(query)
      const eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        const chunk = event.data
        setContent((prev) => prev + chunk)
      }

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err)
        setError('连接中断，请重试')
        eventSource.close()
        setLoading(false)
      }

      // 监听完成事件
      eventSource.addEventListener('done', () => {
        eventSource.close()
        setLoading(false)
      })

      // 存储 EventSource 以便清理
      return () => {
        eventSource.close()
      }
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || '分析失败')
      setLoading(false)
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
            <h2 className="text-lg font-bold text-text">AI 分析报告</h2>
            <p className="text-sm text-text-secondary">查询: {query}</p>
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
                <p className="text-text-secondary">AI 正在分析...</p>
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
                重试
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
                        <p className="text-xs text-primary font-semibold mb-2">💭 思考过程</p>
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
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            {loading && (
              <>
                <div className="w-2 h-2 bg-profit rounded-full animate-pulse" />
                <span>正在生成...</span>
              </>
            )}
            {!loading && content && (
              <>
                <div className="w-2 h-2 bg-profit rounded-full" />
                <span>生成完成</span>
              </>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
