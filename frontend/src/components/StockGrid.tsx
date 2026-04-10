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
 * Hot Stocks Grid - Revolut style with horizontal scrolling cards
 * No shadows, flat design with border contrast
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
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-section-heading font-medium text-revolut-dark mb-8"
            style={{ 
              lineHeight: '1.20',
              letterSpacing: '-0.4px'
            }}
          >
            Trending Today
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-surface border-2 border-gray-tone rounded-card animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 
            className="text-section-heading font-medium text-revolut-dark"
            style={{ 
              lineHeight: '1.20',
              letterSpacing: '-0.4px'
            }}
          >
            Trending Today
          </h2>
          {stocks.length > 4 && (
            <span className="text-caption text-mid-slate bg-surface px-4 py-2 rounded-pill">
              Auto-updating
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => onStockClick?.(stock.symbol)}
              compact={true}
            />
          ))}
        </div>

        {/* Carousel indicators - Revolut minimal style */}
        {stocks.length > 4 && (
          <div className="flex justify-center gap-3 mt-8">
            {Array.from({ length: indicatorCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleIndicatorClick(i)}
                className={`h-2 rounded-pill transition-all ${
                  Math.floor(currentIndex / 4) === i 
                    ? 'bg-revolut-dark w-8' 
                    : 'bg-gray-tone hover:bg-mid-slate w-2'
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
