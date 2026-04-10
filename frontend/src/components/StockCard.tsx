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
 * Stock Card Component - Wise style with clean borders and typography
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
    // Compact version - Wise style
    return (
      <button
        onClick={onClick}
        className="w-full p-4 bg-white border border-near-black/10 rounded-card-large hover:shadow-ring transition-all text-left group btn-scale-hover"
        style={{ fontFeatureSettings: '"calt"' }}
      >
        {/* Stock symbol and price */}
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-base font-bold text-near-black group-hover:text-dark-green transition-colors">
            {stock.symbol}
          </h3>
          <p className="text-lg font-bold text-near-black font-mono">
            ${stock.price.toFixed(2)}
          </p>
        </div>

        {/* Change percentage */}
        <div className={`flex items-center gap-1 text-sm font-semibold ${changeColor}`}>
          <span>{isProfit ? '▲' : '▼'}</span>
          <span className="font-mono">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span className="font-mono">
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>
      </button>
    )
  }

  // Full version - Wise style
  return (
    <button
      onClick={onClick}
      className="w-full p-5 bg-white border border-near-black/10 rounded-card-large hover:shadow-ring transition-all text-left group btn-scale-hover"
      style={{ fontFeatureSettings: '"calt"' }}
    >
      {/* Stock symbol and name */}
      <div className="mb-3">
        <h3 className="text-lg font-bold text-near-black group-hover:text-dark-green transition-colors">
          {stock.symbol}
        </h3>
        <p className="text-sm text-gray truncate">{stock.name}</p>
      </div>

      {/* Price */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-near-black font-mono">
          ${stock.price.toFixed(2)}
        </p>
      </div>

      {/* Change percentage */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 font-semibold ${changeColor}`}>
          <span className="text-lg">
            {isProfit ? '▲' : '▼'}
          </span>
          <span className="font-mono">
            {changeSymbol}{stock.change.toFixed(2)}
          </span>
          <span className="text-sm font-mono">
            ({changeSymbol}{stock.change_percent.toFixed(2)}%)
          </span>
        </div>

        {/* Volume */}
        <div className="text-xs text-gray font-mono">
          Vol: {formatVolume(stock.volume)}
        </div>
      </div>
    </button>
  )
}
