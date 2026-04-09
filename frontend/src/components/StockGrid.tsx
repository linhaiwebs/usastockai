'use client'

import { useState, useEffect } from 'react'
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
 * 热门股票网格 - 显示前4个，其余轮播
 */
export function StockGrid({ onStockClick }: StockGridProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchStocks()
  }, [])

  // 自动轮播
  useEffect(() => {
    if (stocks.length <= 4) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (stocks.length - 4 + 1))
    }, 5000) // 每5秒轮播一次

    return () => clearInterval(timer)
  }, [stocks.length])

  const fetchStocks = async () => {
    try {
      const data = await getHotStocks()
      setStocks(data.stocks || data || [])
    } catch (error) {
      console.error('Failed to fetch hot stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
          <span className="text-xl">🔥</span>
          热门股票
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

  // 显示的股票（前4个固定 + 轮播）
  const displayStocks = stocks.length > 4 
    ? [...stocks.slice(0, 4), ...stocks.slice(currentIndex, currentIndex + Math.min(4, stocks.length - 4))]
    : stocks

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
        <span className="text-xl">🔥</span>
        热门股票
        {stocks.length > 4 && (
          <span className="text-xs text-text-secondary font-normal ml-auto">
            自动轮播中
          </span>
        )}
      </h2>
      
      <div className="grid grid-cols-2 gap-2">
        {stocks.slice(0, 4).map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick?.(stock.symbol)}
            compact={true}
          />
        ))}
      </div>

      {/* 轮播指示器 */}
      {stocks.length > 4 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: Math.ceil((stocks.length - 4) / 4) + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * 4)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / 4) === i 
                  ? 'bg-primary w-4' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
