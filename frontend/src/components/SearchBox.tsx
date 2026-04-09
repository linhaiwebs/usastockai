'use client'

import { useState, useEffect, useRef } from 'react'
import { searchStocks } from '@/lib/api'

interface SearchResult {
  symbol: string
  name: string
  type: string
  exchange?: string
}

interface SearchBoxProps {
  onAnalyze?: (query: string) => void
}

/**
 * 搜索框组件 - 带自动补全和分页
 * 改进：500ms防抖，最少2字符，默认显示4个结果，分页显示其他
 */
export function SearchBox({ onAnalyze }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  
  const RESULTS_PER_PAGE = 4

  // 防抖搜索 (500ms, 最少2字符)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (query.length >= 2) {
      debounceTimer.current = setTimeout(async () => {
        setLoading(true)
        try {
          const data = await searchStocks(query)
          setResults(data.results || data || [])
          setCurrentPage(0)
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      }, 500) // 增加到500ms防抖
    } else {
      setResults([])
      setShowResults(false)
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setQuery(`${result.symbol} - ${result.name}`)
    setShowResults(false)
    if (onAnalyze) {
      onAnalyze(result.symbol)
    }
  }

  const handleSubmit = () => {
    if (query.trim() && onAnalyze) {
      onAnalyze(query)
    }
  }

  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE)
  const currentResults = results.slice(
    currentPage * RESULTS_PER_PAGE,
    (currentPage + 1) * RESULTS_PER_PAGE
  )

  return (
    <div className="relative mb-8">
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索股票代码或名称 (至少2个字符)"
          className="w-full px-4 py-3.5 pl-12 bg-surface border border-gray-700 rounded-xl text-text placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
        
        {/* 搜索图标 */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* 加载动画 */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
          {currentResults.map((result, index) => (
            <button
              key={`${result.symbol}-${index}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-gray-700/50 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-primary">{result.symbol}</span>
                  <span className="mx-2 text-text-secondary">·</span>
                  <span className="text-text">{result.name}</span>
                </div>
                {result.exchange && (
                  <span className="text-xs text-text-secondary bg-background px-2 py-1 rounded">
                    {result.exchange}
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-background/50 border-t border-gray-700">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← 上一页
              </button>
              <span className="text-sm text-text-secondary">
                {currentPage + 1} / {totalPages} ({results.length} 结果)
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 无结果提示 */}
      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-gray-700 rounded-xl shadow-xl z-10 p-4 text-center text-text-secondary">
          未找到 "{query}" 的结果
        </div>
      )}

      {/* 分析按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim()}
        className="w-full mt-3 py-3.5 bg-hero-gradient text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        开始 AI 诊断
      </button>
    </div>
  )
}
