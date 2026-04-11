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
 * Hot Stocks Grid - Airbnb style with clean white cards and three-layer shadows
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

  // Auto carousel
  useEffect(() => {
    if (stocks.length <= 4) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (stocks.length - 4 + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [stocks.length])

  const displayStocks = useMemo(() => {
    return stocks.slice(0, 4)
  }, [stocks])

  const indicatorCount = useMemo(() => {
    return Math.ceil((stocks.length - 4) / 4) + 1
  }, [stocks.length])

  const handleIndicatorClick = useCallback((index: number) => {
    setCurrentIndex(index * 4)
  }, [])

  if (loading) {
    return (
      <div className="mb-12">
        <h2 
          className="text-section-heading text-text-primary mb-6 flex items-center gap-3"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          <span className="w-2 h-2 rounded-circle bg-rausch inline-block"></span>
          Trending Today
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-surface rounded-card animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-12">
      <h2 
        className="text-section-heading text-text-primary mb-6 flex items-center gap-3"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        <span className="w-2 h-2 rounded-circle bg-rausch inline-block"></span>
        Trending Today
        {stocks.length > 4 && (
          <span 
            className="text-body text-text-secondary font-normal ml-auto"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            Auto-updating
          </span>
        )}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {displayStocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick?.(stock.symbol)}
            compact={true}
          />
        ))}
      </div>

      {/* Carousel indicators - Rausch accent */}
      {stocks.length > 4 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: indicatorCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleIndicatorClick(i)}
              className={`h-1.5 rounded-standard transition-all ${
                Math.floor(currentIndex / 4) === i 
                  ? 'bg-rausch w-6' 
                  : 'bg-border-default hover:bg-rausch opacity-30 w-1.5'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
