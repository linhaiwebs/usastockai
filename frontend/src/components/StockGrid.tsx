'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { StockCard } from './StockCard'
import { getHotStocks } from '@/lib/api'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
}

interface StockGridProps {
  onStockClick?: (symbol: string) => void
}

/**
 * Hot Stocks Grid - Optimized for performance
 */
export function StockGrid({ onStockClick }: StockGridProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchStocks = useCallback(async () => {
    try {
      const data = await getHotStocks()
      setStocks(data.stocks || data || [])
    } catch (error) {
      console.error('Failed to fetch hot stocks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStocks()
  }, [fetchStocks])

  // Auto carousel - 使用useCallback优化
  useEffect(() => {
    if (stocks.length <= 4) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (stocks.length - 4 + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [stocks.length])

  // 使用useMemo优化显示的股票列表
  const displayStocks = useMemo(() => {
    return stocks.slice(0, 4)
  }, [stocks])

  // 使用useMemo优化指示器数量
  const indicatorCount = useMemo(() => {
    return Math.ceil((stocks.length - 4) / 4) + 1
  }, [stocks.length])

  // 使用useCallback优化点击处理
  const handleIndicatorClick = useCallback((index: number) => {
    setCurrentIndex(index * 4)
  }, [])

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <span className="text-xl">🔥</span>
          Hot Stocks
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-surface border border-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
        <span className="text-xl">🔥</span>
        Hot Stocks
        {stocks.length > 4 && (
          <span className="text-xs text-text-secondary font-normal ml-auto">
            Auto-rotating
          </span>
        )}
      </h2>
      
      <div className="grid grid-cols-2 gap-2">
        {displayStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick?.(stock.symbol)}
            compact={true}
          />
        ))}
      </div>

      {/* Carousel indicators */}
      {stocks.length > 4 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: indicatorCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleIndicatorClick(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 4) === i 
                  ? 'bg-primary w-4' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
