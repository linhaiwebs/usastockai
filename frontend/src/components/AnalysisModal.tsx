'use client'

import { useState, useEffect, useRef } from 'react'
import { getAnalyzeStreamUrl, assignRedirect, recordRedirectClick } from '@/lib/api'

interface AnalysisModalProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

/**
 * AI Analysis Modal - Modern loading with skeleton and progress
 */
export function AnalysisModal({ query, isOpen, onClose }: AnalysisModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [redirectId, setRedirectId] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing AI analysis...')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && query) {
      startAnalysis()
    }
  }, [isOpen, query])

  // Progress animation during loading
  useEffect(() => {
    if (loading) {
      const texts = [
        'Fetching market data...',
        'Analyzing trends...',
        'Processing indicators...',
        'Generating insights...'
      ]
      let textIndex = 0
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
        
        textIndex = (textIndex + 1) % texts.length
        setLoadingText(texts[textIndex])
      }, 1500)

      return () => clearInterval(progressInterval)
    } else {
      setProgress(100)
    }
  }, [loading])

  const startAnalysis = async () => {
    setLoading(true)
    setContent('')
    setError(null)
    setRedirectUrl(null)
    setRedirectId(null)
    setProgress(0)
    setLoadingText('Initializing AI analysis...')

    try {
      const url = getAnalyzeStreamUrl(query)
      const eventSource = new EventSource(url)

      eventSource.onmessage = (event) => {
        const chunk = event.data
        setContent((prev) => prev + chunk)
        setLoading(false)
      }

      eventSource.onerror = (err) => {
        console.error('SSE Error:', err)
        setError('Connection interrupted, please retry')
        eventSource.close()
        setLoading(false)
        loadRedirectUrl()
      }

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        if (loading) {
          eventSource.close()
          setError('Analysis timeout, please retry')
          setLoading(false)
          loadRedirectUrl()
        }
      }, 30000)

      // Load redirect URL in parallel
      setTimeout(() => loadRedirectUrl(), 500)

      return () => {
        eventSource.close()
        clearTimeout(timeout)
      }
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed')
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
      window.open(redirectUrl, '_blank')
      onClose()
    } catch (err) {
      console.error('Failed to record click:', err)
      if (redirectUrl) {
        window.open(redirectUrl, '_blank')
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
          {/* Modern loading state with skeleton and progress */}
          {loading && content.length === 0 && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">{loadingText}</span>
                  <span className="text-sm text-primary font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-hero-gradient transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Skeleton cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg" />
                    <div className="h-4 bg-gray-700 rounded w-1/3" />
                  </div>
                  <div className="space-y-2 ml-11">
                    <div className="h-3 bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-700 rounded w-5/6" />
                    <div className="h-3 bg-gray-700 rounded w-4/6" />
                  </div>
                </div>
              ))}
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
                      <div key={index} className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-primary font-semibold mb-2">💭 Thinking Process</p>
                        <div className="text-sm text-text-secondary whitespace-pre-wrap">
                          {part}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="text-text whitespace-pre-wrap leading-relaxed">
                      {part}
                    </div>
                  )
                }
                return (
                  <div key={index} className="text-text whitespace-pre-wrap leading-relaxed">
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
