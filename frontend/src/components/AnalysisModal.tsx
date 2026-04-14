'use client'

import { useState, useEffect, useRef } from 'react'
import { getAnalyzeStreamUrl, assignRedirect, recordRedirectClick } from '@/lib/api'

interface AnalysisModalProps {
  query: string
  isOpen: boolean
  onClose: () => void
}

export function AnalysisModal({ query, isOpen, onClose }: AnalysisModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [redirectId, setRedirectId] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = () => {
    if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
  }

  useEffect(() => {
    if (!isOpen) { cleanup(); setContent(''); setLoading(false); setError(null) }
  }, [isOpen])

  useEffect(() => () => cleanup(), [])

  useEffect(() => {
    if (isOpen && query) startAnalysis()
  }, [isOpen, query])

  useEffect(() => {
    if (contentRef.current && content) contentRef.current.scrollTop = contentRef.current.scrollHeight
  }, [content])

  const startAnalysis = async () => {
    setLoading(true); setContent(''); setError(null); setRedirectUrl(null); setRedirectId(null)
    try {
      const url = getAnalyzeStreamUrl(query)
      eventSourceRef.current = new EventSource(url)
      let hasData = false

      eventSourceRef.current.onmessage = (event) => {
        if (event.data) { hasData = true; setContent(prev => prev + event.data); setLoading(false) }
      }

      eventSourceRef.current.onerror = () => {
        if (!hasData) setError('Connection failed, please retry')
        cleanup(); setLoading(false); loadRedirectUrl()
      }

      timeoutRef.current = setTimeout(() => {
        setError('Analysis timeout, please retry'); cleanup(); setLoading(false); loadRedirectUrl()
      }, 15000)

      setTimeout(() => loadRedirectUrl(), 500)
    } catch (err: any) {
      setError(err.message || 'Analysis failed'); cleanup(); setLoading(false); loadRedirectUrl()
    }
  }

  const loadRedirectUrl = async () => {
    try {
      const data = await assignRedirect()
      setRedirectUrl(data.url); setRedirectId(data.id)
    } catch (err) { console.error('Failed to load redirect URL:', err) }
  }

  const handleWhatsAppClick = async () => {
    if (!redirectId || !redirectUrl) return
    try {
      await recordRedirectClick(redirectId)
      if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
        (window as any).gtag_report_conversion(redirectUrl)
      } else {
        window.location.href = redirectUrl
      }
      setTimeout(() => onClose(), 100)
    } catch (err) {
      if (redirectUrl) {
        if (typeof window !== 'undefined' && typeof (window as any).gtag_report_conversion === 'function') {
          (window as any).gtag_report_conversion(redirectUrl)
        } else {
          window.location.href = redirectUrl
        }
        setTimeout(() => onClose(), 100)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-card-hover overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-default flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">AI Analysis Report</h2>
            <p className="text-sm text-text-secondary mt-1">
              Query: <span className="text-brand font-semibold">{query}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-alt transition-colors text-text-muted hover:text-text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {loading && content.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-[3px] border-surface-muted border-t-brand rounded-full animate-spin mb-4" />
              <p className="text-base font-semibold text-text-primary mb-1">AI is analyzing...</p>
              <p className="text-sm text-text-secondary">This usually takes 1-3 seconds.</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-error">{error}</p>
              <button onClick={startAnalysis} className="mt-2 text-sm text-brand hover:underline font-medium">Retry analysis</button>
            </div>
          )}
          {content && (
            <div className="prose max-w-none">
              {content.split('<think/>').map((part, index) => {
                if (index === 0 && content.includes('<think/>')) {
                  return (
                    <div key={index} className="mb-4 p-4 bg-surface-alt rounded-xl border border-border-default">
                      <p className="text-xs font-semibold text-brand uppercase tracking-wider mb-2">AI Thinking Process</p>
                      <div className="text-sm text-text-secondary whitespace-pre-wrap">{part}</div>
                    </div>
                  )
                }
                return <div key={index} className="text-base text-text-primary whitespace-pre-wrap leading-relaxed">{part}</div>
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-default">
          {redirectUrl && (
            <>
              <button
                onClick={handleWhatsAppClick}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Get Personalized Analysis on WhatsApp
              </button>
              <p className="mt-3 text-xs text-text-muted text-center">
                Disclaimer: This is not investment advice. AI-generated analysis for reference only.
              </p>
            </>
          )}
          {!redirectUrl && !loading && content && (
            <button disabled className="w-full py-3.5 px-4 bg-surface-alt text-text-muted font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading...
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
