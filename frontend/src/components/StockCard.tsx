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
 * Stock Card Component - Stripe style with white cards and blue-tinted shadows
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
    // Compact version - Stripe style with 6px radius
    return (
      <button
        onClick={onClick}
        className="w-full p-4 bg-white border border-border-default rounded-relaxed hover:shadow-elevated transition-all text-left group"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        {/* Stock symbol and price */}
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-base font-normal text-deep-navy group-hover:text-stripe-purple transition-colors"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            {stock.symbol}
          </h3>
          <p 
            className="text-lg font-normal text-deep-navy font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            ${stock.price.toFixed(2)}
          </p>
        </div>

        {/* Change percentage */}
        <div className={`flex items-center gap-1 text-sm font-normal ${changeColor}`}>
          <span>{isProfit ? '↑' : '↓'}</span>
          <span 
            className="font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span 
            className="font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>
      </button>
    )
  }

  // Full version - Stripe style with 6px radius
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white border border-border-default rounded-relaxed hover:shadow-elevated transition-all text-left group"
      style={{ fontFeatureSettings: '"ss01"' }}
    >
      {/* Stock symbol and name */}
      <div className="mb-4">
        <h3 
          className="text-sub-heading text-deep-navy group-hover:text-stripe-purple transition-colors mb-1"
          style={{ fontFeatureSettings: '"ss01"' }}
        >
          {stock.symbol}
        </h3>
        <p className="text-caption text-body-text truncate">{stock.name}</p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p 
          className="text-section-heading text-deep-navy font-mono"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          ${stock.price.toFixed(2)}
        </p>
      </div>

      {/* Change percentage */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 font-normal ${changeColor}`}>
          <span className="text-base">
            {isProfit ? '↑' : '↓'}
          </span>
          <span 
            className="font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span 
            className="text-sm font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>

        {/* Volume */}
        <div 
          className="text-caption text-body-text font-mono"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </button>
  )
}
