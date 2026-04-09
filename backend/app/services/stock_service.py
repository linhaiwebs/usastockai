"""
股票数据服务 - 基于 finance-query 本地部署
"""
import asyncio
from typing import List, Dict, Optional
import httpx
from ..core.config import get_settings

settings = get_settings()


class StockService:
    """股票数据服务"""
    
    def __init__(self):
        # 使用 Yahoo Finance API (免费,无需API key)
        self.base_url = "https://query1.finance.yahoo.com/v1/finance/search"
        self.quote_url = "https://query1.finance.yahoo.com/v7/finance/quote"
    
    async def search_stocks(self, query: str) -> List[Dict]:
        """
        搜索股票自动补全
        """
        if not query or len(query) < 1:
            return []
        
        async with httpx.AsyncClient() as client:
            try:
                params = {
                    "q": query,
                    "quotesCount": 10,
                    "newsCount": 0,
                    "lang": "en-US"
                }
                
                response = await client.get(self.base_url, params=params, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("quotes", []):
                    results.append({
                        "symbol": item.get("symbol", ""),
                        "name": item.get("shortname", item.get("longname", "")),
                        "type": item.get("quoteType", "EQUITY"),
                        "exchange": item.get("exchange", "")
                    })
                
                return results
            except Exception as e:
                print(f"Search error: {e}")
                return []
    
    async def get_quote(self, symbol: str) -> Optional[Dict]:
        """
        获取股票实时报价
        """
        async with httpx.AsyncClient() as client:
            try:
                params = {
                    "symbols": symbol,
                    "fields": "regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,shortName"
                }
                
                response = await client.get(self.quote_url, params=params, timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                quote_response = data.get("quoteResponse", {})
                quotes = quote_response.get("result", [])
                
                if not quotes:
                    return None
                
                quote = quotes[0]
                return {
                    "symbol": symbol,
                    "name": quote.get("shortName", ""),
                    "price": quote.get("regularMarketPrice", 0),
                    "change": quote.get("regularMarketChange", 0),
                    "change_percent": quote.get("regularMarketChangePercent", 0),
                    "volume": quote.get("regularMarketVolume", 0)
                }
            except Exception as e:
                print(f"Quote error for {symbol}: {e}")
                return None
    
    async def get_hot_stocks(self) -> List[Dict]:
        """
        获取热门股票列表
        """
        # 热门美股列表
        hot_symbols = ["SPY", "QQQ", "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META", "AMD"]
        
        tasks = [self.get_quote(symbol) for symbol in hot_symbols]
        quotes = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 过滤掉None和异常
        valid_quotes = [q for q in quotes if q and not isinstance(q, Exception)]
        return valid_quotes


# 创建全局实例
stock_service = StockService()
