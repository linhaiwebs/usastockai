'use client'

import { useState, useEffect, useRef } from 'react'
import { getAnalyzeStreamUrl, assignRedirect, recordRedirectClick } from '@/lib/api'

interface AnalysisModalProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

/**
 * AI Analysis Modal - Optimized for faster perceived performance
 */
export function AnalysisModal({ query, isOpen, onClose }: AnalysisModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [redirectId, setRedirectId] = useState<number | null>(null)
  const [thinkingDots, setThinkingDots] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const thinkingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function
  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current)
      thinkingIntervalRef.current = null
    }
  }

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      cleanup()
      setContent('')
      setLoading(false)
      setError(null)
      setThinkingDots('')
    }
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [])

  useEffect(() => {
    if (isOpen && query) {
      startAnalysis()
    }
  }, [isOpen, query])

  // Animate thinking dots
  useEffect(() => {
    if (loading && content.length === 0) {
      thinkingIntervalRef.current = setInterval(() => {
        setThinkingDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 500)
    } else {
      setThinkingDots('')
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
      }
    }
  }, [loading, content.length])

  const startAnalysis = async () => {
    setLoading(true)
    setContent('')
    setError(null)
    setRedirectUrl(null)
    setRedirectId(null)

    try {
      const url = getAnalyzeStreamUrl(query)
      eventSourceRef.current = new EventSource(url)

      let hasReceivedData = false
      let firstChunkTime = 0

      eventSourceRef.current.onmessage = (event) => {
        const chunk = event.data
        if (chunk) {
          if (!hasReceivedData) {
            hasReceivedData = true
            firstChunkTime = Date.now()
            console.log('First chunk received in:', firstChunkTime, 'ms')
          }
          setContent((prev) => prev + chunk)
          setLoading(false)
        }
      }

      eventSourceRef.current.onerror = (err) => {
        if (!hasReceivedData) {
          console.error('SSE Connection Error:', err)
          setError('Connection failed, please retry')
        }
        cleanup()
        setLoading(false)
        loadRedirectUrl()
      }

      // Reduced timeout to 15 seconds
      timeoutRef.current = setTimeout(() => {
        if (loading) {
          setError('Analysis timeout, please retry')
          cleanup()
          setLoading(false)
          loadRedirectUrl()
        }
      }, 15000)

      // Load redirect URL in parallel
      setTimeout(() => loadRedirectUrl(), 500)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed')
      cleanup()
      setLoading(false)
      loadRedirectUrl()
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
      await recordRedirectClick(redirectId)
      
      // 使用 gtag_report_conversion 进行转化跟踪和跳转
      if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
        (window as any).gtag_report_conversion(redirectUrl)
      } else {
        // 如果 gtag_report_conversion 未定义，直接打开链接
        console.warn('gtag_report_conversion not found, opening URL directly')
        window.open(redirectUrl, '_blank')
      }
      
      onClose()
    } catch (err) {
      console.error('Failed to record click:', err)
      if (redirectUrl) {
        // 即使记录失败，也要尝试转化跟踪
        if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
          (window as any).gtag_report_conversion(redirectUrl)
        } else {
          window.open(redirectUrl, '_blank')
        }
        onClose()
      }
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    if (contentRef.current && content) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] bg-surface border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">AI Analysis Report</h2>
            <p className="text-sm text-text-secondary mt-1">Query: {query}</p>
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

        {/* Content area */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-5"
        >
          {/* Thinking state - More honest feedback */}
          {loading && content.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <p className="text-lg text-text font-medium mb-2">
                AI is analyzing{thinkingDots}
              </p>
              <p className="text-sm text-text-secondary text-center max-w-sm">
                Qwen AI is analyzing your request. This usually takes 1-3 seconds.
              </p>
            </div>
          )}

          {/* Error state */}
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

          {/* Analysis content */}
          {content && (
            <div className="prose prose-invert max-w-none">
              {/* Handle DeepSeek R1 <think/> tags */}
              {content.split('<think/>').map((part, index) => {
                if (index === 0) {
                  if (content.includes('<think/>')) {
                    return (
                      <div key={index} className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-primary font-semibold mb-2">💭 AI Thinking Process</p>
                        <div className="text-sm text-text-secondary whitespace-pre-wrap">
                          {part}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="text-text whitespace-pre-wrap leading-tight">
                      {part}
                    </div>
                  )
                }
                return (
                  <div key={index} className="text-text whitespace-pre-wrap leading-tight">
                    {part}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with WhatsApp button */}
        <div className="p-5 border-t border-gray-700">
          {redirectUrl && (
            <>
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
              <p className="mt-2 text-xs text-text-secondary text-center">
                Disclaimer: This is not investment advice. AI-generated analysis for reference only.
              </p>
            </>
          )}
          
          {!redirectUrl && !loading && content && (
            <button
              disabled
              className="w-full py-3.5 px-4 bg-gray-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Loading...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
