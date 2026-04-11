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
 * Hot Stocks Grid - Ultra compact mobile-first layout
 * 2 columns on all screen sizes for consistency
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
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-section-heading font-medium text-revolut-dark mb-3"
            style={{ 
              lineHeight: '1.20',
              letterSpacing: '-0.2px'
            }}
          >
            Trending Today
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-surface border-2 border-gray-tone rounded-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 
            className="text-section-heading font-medium text-revolut-dark"
            style={{ 
              lineHeight: '1.20',
              letterSpacing: '-0.2px'
            }}
          >
            Trending Today
          </h2>
          {stocks.length > 4 && (
            <span className="text-caption-small text-mid-slate bg-surface px-2 py-1 rounded-pill">
              Auto-updating
            </span>
          )}
        </div>
        
        {/* Always 2 columns on all devices */}
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
          <div className="flex justify-center gap-1.5 mt-4">
            {Array.from({ length: indicatorCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleIndicatorClick(i)}
                className={`h-1 rounded-pill transition-all ${
                  Math.floor(currentIndex / 4) === i 
                    ? 'bg-revolut-dark w-5' 
                    : 'bg-gray-tone hover:bg-mid-slate w-1'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
