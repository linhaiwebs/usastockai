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
 * Stock Card Component - Revolut style compact flat cards
 * Uses tabular numerals for financial data
 */
export function StockCard({ stock, onClick, compact = false }: StockCardProps) {
  const isProfit = stock.change >= 0
  const changeColor = isProfit ? 'text-teal' : 'text-danger'
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
    // Compact version - Revolut style with 20px radius, no shadow
    return (
      <button
        onClick={onClick}
        className="w-full p-4 bg-white border-2 border-gray-tone rounded-card hover:border-revolut-dark transition-colors text-left group"
      >
        {/* Stock symbol and price */}
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-caption font-medium text-revolut-dark group-hover:text-revolut-blue transition-colors"
          >
            {stock.symbol}
          </h3>
          <p 
            className="text-body font-medium text-revolut-dark font-mono"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            ${stock.price < 100 ? `$${stock.price.toFixed(2)}` : `$${stock.price.toFixed(2)}`}
          </p>
        </div>

        {/* Change percentage */}
        <div className={`flex items-center gap-1 text-caption ${changeColor}`}>
          <span className="text-base">{isProfit ? '↑' : '↓'}</span>
          <span 
            className="font-mono font-medium"
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

  // Full version - Revolut style with 20px radius, no shadow
  return (
    <button
      onClick={onClick}
      className="w-full p-5 bg-white border-2 border-gray-tone rounded-card hover:border-revolut-dark transition-colors text-left group"
    >
      {/* Stock symbol and name */}
      <div className="mb-4">
        <h3 
          className="text-card-title font-medium text-revolut-dark group-hover:text-revolut-blue transition-colors mb-1"
        >
          {stock.symbol}
        </h3>
        <p className="text-caption text-mid-slate truncate">{stock.name}</p>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p 
          className="text-display-large font-medium text-revolut-dark font-mono"
          style={{ fontFeatureSettings: '"tnum"', letterSpacing: '-0.32px' }}
        >
          ${stock.price < 100 ? `$${stock.price.toFixed(2)}` : `$${stock.price.toFixed(2)}`}
        </p>
      </div>

      {/* Change percentage */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${changeColor}`}>
          <span className="text-xl">{isProfit ? '↑' : '↓'}</span>
          <span 
            className="font-mono font-medium text-body"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span 
            className="font-mono text-body"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>

        {/* Volume */}
        <div 
          className="text-caption text-mid-slate font-mono"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </button>
  )
}
