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
 * 热门股票网格
 */
export function StockGrid({ onStockClick }: StockGridProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
      const data = await getHotStocks()
      setStocks(data.stocks || [])
    } catch (error) {
      console.error('Failed to fetch hot stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          热门股票
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-surface border border-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <span className="text-2xl">🔥</span>
        热门股票
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick?.(stock.symbol)}
          />
        ))}
      </div>
    </div>
  )
}
