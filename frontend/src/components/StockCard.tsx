'use client'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
}

interface StockCardProps {
  stock: StockData
  onClick?: () => void
  compact?: boolean
}

/**
 * Stock Card Component - Airbnb style with three-layer shadows
 * Uses tabular numerals for financial data
 */
export function StockCard({ stock, onClick, compact = false }: StockCardProps) {
  const isProfit = stock.change >= 0
  const changeColor = isProfit ? 'text-positive-green' : 'text-danger-red'
  const changeSymbol = isProfit ? '+' : ''

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(1)}M`
    } else if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`
    }
    return vol.toString()
  }

  if (compact) {
    // Compact version - Airbnb card style with 20px radius
    return (
      <button
        onClick={onClick}
        className="w-full p-4 bg-white rounded-card shadow-card hover:shadow-hover transition-all text-left group"
        style={{ fontFeatureSettings: '"salt"' }}
      >
        {/* Stock symbol and price */}
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-ui-medium text-text-primary group-hover:text-rausch transition-colors"
            style={{ fontFeatureSettings: '"salt"' }}
          >
            {stock.symbol}
          </h3>
          <p 
            className="text-ui-medium text-text-primary tabular-nums"
          >
            ${stock.price.toFixed(2)}
          </p>
        </div>

        {/* Change percentage */}
        <div className={`flex items-center gap-1 text-small ${changeColor}`}>
          <span>{isProfit ? '↑' : '↓'}</span>
          <span className="tabular-nums">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span className="tabular-nums">
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>
      </button>
    )
  }

  // Full version - Airbnb card style
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white rounded-card shadow-card hover:shadow-hover transition-all text-left group"
      style={{ fontFeatureSettings: '"salt"' }}
    >
      {/* Stock symbol and name */}
      <div className="mb-4">
        <h3 
          className="text-card-heading text-text-primary group-hover:text-rausch transition-colors mb-1"
          style={{ fontFeatureSettings: '"salt"' }}
        >
          {stock.symbol}
        </h3>
        <p className="text-body text-text-secondary truncate">{stock.name}</p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p 
          className="text-feature-title text-text-primary tabular-nums"
        >
          ${stock.price.toFixed(2)}
        </p>
      </div>

      {/* Change percentage */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 ${changeColor}`}>
          <span className="text-ui-medium">
            {isProfit ? '↑' : '↓'}
          </span>
          <span className="tabular-nums text-body">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span className="tabular-nums text-small">
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>

        {/* Volume */}
        <div 
          className="text-small text-text-secondary tabular-nums"
        >
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </button>
  )
}
