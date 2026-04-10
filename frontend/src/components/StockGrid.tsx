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
 * Hot Stocks Grid - Wise style with clean cards
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
        <h2 className="text-lg font-bold text-near-black mb-4 flex items-center gap-2" style={{ lineHeight: '0.85', fontFeatureSettings: '"calt"' }}>
          <span className="text-xl">🔥</span>
          Hot Stocks
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-surface border border-near-black/10 rounded-card-large animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-near-black mb-4 flex items-center gap-2" style={{ lineHeight: '0.85', fontFeatureSettings: '"calt"' }}>
        <span className="text-xl">🔥</span>
        Hot Stocks
        {stocks.length > 4 && (
          <span className="text-xs text-gray font-normal ml-auto font-sans">
            Auto-rotating
          </span>
        )}
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {displayStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick?.(stock.symbol)}
            compact={true}
          />
        ))}
      </div>

      {/* Carousel indicators - Wise green accent */}
      {stocks.length > 4 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: indicatorCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleIndicatorClick(i)}
              className={`h-1.5 rounded-pill transition-all ${
                Math.floor(currentIndex / 4) === i 
                  ? 'bg-wise-green w-4' 
                  : 'bg-surface hover:bg-light-mint w-1.5'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
