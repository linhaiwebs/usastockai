"""
股票数据服务 - 基于 finance-query 自部署或托管服务
"""
import asyncio
from typing import List, Dict, Optional
import httpx
from datetime import datetime, timedelta
from ..core.config import get_settings

settings = get_settings()


class StockService:
    """股票数据服务"""
    
    def __init__(self):
        # Finance Query API endpoint
        self.base_url = getattr(settings, 'FINANCE_QUERY_URL', 'http://finance-query:8000')
        
        # 缓存配置
        self.cache: Dict[str, Dict] = {}
        self.cache_ttl = 300  # 5分钟缓存
        
        # 速率限制
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms
        self.request_semaphore = asyncio.Semaphore(10)
        
        # 请求头
        self.headers = {
            'User-Agent': 'StockAI/1.0',
            'Accept': 'application/json',
        }
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """检查缓存是否有效"""
        if cache_key not in self.cache:
            return False
        
        cached = self.cache[cache_key]
        return datetime.now() - cached['timestamp'] < timedelta(seconds=self.cache_ttl)
    
    def _get_from_cache(self, cache_key: str) -> Optional[any]:
        """从缓存获取数据"""
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        return None
    
    def _save_to_cache(self, cache_key: str, data: any):
        """保存数据到缓存"""
        self.cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }
    
    async def _rate_limit(self):
        """速率限制"""
        async with self.request_semaphore:
            current_time = asyncio.get_event_loop().time()
            time_since_last = current_time - self.last_request_time
            
            if time_since_last < self.min_request_interval:
                await asyncio.sleep(self.min_request_interval - time_since_last)
            
            self.last_request_time = asyncio.get_event_loop().time()
    
    async def _make_request(self, endpoint: str, params: dict = None) -> Optional[dict]:
        """发送HTTP请求（带缓存和速率限制）"""
        # 生成缓存键
        cache_key = f"{endpoint}?{sorted(params.items()) if params else ''}"
        
        # 检查缓存
        cached_data = self._get_from_cache(cache_key)
        if cached_data is not None:
            return cached_data
        
        # 速率限制
        await self._rate_limit()
        
        url = f"{self.base_url}{endpoint}"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            try:
                response = await client.get(url, params=params)
                
                if response.status_code == 429:
                    print(f"Rate limited, waiting before retry...")
                    await asyncio.sleep(1)
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                # 保存到缓存
                self._save_to_cache(cache_key, data)
                
                return data
            except Exception as e:
                print(f"Request error: {e}")
                return None
    
    async def search_stocks(self, query: str) -> List[Dict]:
        """搜索股票自动补全"""
        if not query or len(query) < 1:
            return []
        
        # 使用 finance-query 的 search 端点
        data = await self._make_request("/v2/search", {"q": query})
        
        if not data:
            return []
        
        results = []
        
        # finance-query 返回格式
        quotes = data.get("quotes", [])
        for item in quotes[:10]:  # 限制返回10个结果
            results.append({
                "symbol": item.get("symbol", ""),
                "name": item.get("shortname", item.get("longname", "")),
                "type": item.get("quoteType", "EQUITY"),
                "exchange": item.get("exchange", "")
            })
        
        return results
    
    def _parse_price_field(self, field) -> Optional[float]:
        """解析价格字段（可能是数值或字典）"""
        if field is None:
            return None
        
        if isinstance(field, dict):
            return field.get("raw")
        else:
            try:
                return float(field)
            except (ValueError, TypeError):
                return None
    
    async def get_quote(self, symbol: str) -> Optional[Dict]:
        """获取股票实时报价"""
        # 使用 finance-query 的 quote 端点
        data = await self._make_request(f"/v2/quote/{symbol.upper()}")
        
        if not data:
            return self._get_mock_quote(symbol)
        
        try:
            # 解析价格字段（支持多种格式）
            price = self._parse_price_field(data.get("regularMarketPrice"))
            change = self._parse_price_field(data.get("regularMarketChange"))
            change_percent = self._parse_price_field(data.get("regularMarketChangePercent"))
            volume = self._parse_price_field(data.get("regularMarketVolume"))
            
            return {
                "symbol": symbol.upper(),
                "name": data.get("shortName", data.get("longName", "")),
                "price": price or 0,
                "change": change or 0,
                "change_percent": change_percent or 0,
                "volume": int(volume) if volume else 0
            }
        except Exception as e:
            print(f"Parse quote error for {symbol}: {e}")
            return self._get_mock_quote(symbol)
    
    def _get_mock_quote(self, symbol: str) -> Dict:
        """返回模拟报价数据（当API不可用时）"""
        import random
        
        # 模拟价格数据
        mock_prices = {
            'SPY': 675.0,
            'QQQ': 450.0,
            'AAPL': 200.0,
            'MSFT': 420.0,
            'TSLA': 250.0,
            'NVDA': 880.0,
            'AMZN': 185.0,
            'GOOGL': 175.0,
            'META': 500.0,
            'AMD': 165.0
        }
        
        base_price = mock_prices.get(symbol.upper(), random.uniform(50, 200))
        change = random.uniform(-5, 5)
        change_percent = (change / base_price) * 100
        
        return {
            "symbol": symbol.upper(),
            "name": f"{symbol.upper()} Inc.",
            "price": round(base_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": random.randint(1000000, 50000000)
        }
    
    async def get_hot_stocks(self) -> List[Dict]:
        """获取热门股票列表"""
        # 热门美股列表
        hot_symbols = ["SPY", "QQQ", "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META", "AMD"]
        
        # 使用 finance-query 的批量 quotes 端点
        symbols_str = ",".join(hot_symbols)
        data = await self._make_request("/v2/quotes", {"symbols": symbols_str})
        
        if not data:
            # 逐个获取作为后备
            quotes = []
            for symbol in hot_symbols:
                quote = await self.get_quote(symbol)
                if quote:
                    quotes.append(quote)
            return quotes
        
        try:
            # finance-query 批量返回格式
            quotes = []
            quotes_data = data.get("quotes", {})
            
            for symbol in hot_symbols:
                if symbol in quotes_data:
                    quote_data = quotes_data[symbol]
                    
                    price = self._parse_price_field(quote_data.get("regularMarketPrice"))
                    change = self._parse_price_field(quote_data.get("regularMarketChange"))
                    change_percent = self._parse_price_field(quote_data.get("regularMarketChangePercent"))
                    volume = self._parse_price_field(quote_data.get("regularMarketVolume"))
                    
                    quotes.append({
                        "symbol": symbol,
                        "name": quote_data.get("shortName", quote_data.get("longName", "")),
                        "price": price or 0,
                        "change": change or 0,
                        "change_percent": change_percent or 0,
                        "volume": int(volume) if volume else 0
                    })
            
            return quotes
        except Exception as e:
            print(f"Parse hot stocks error: {e}")
            # 返回模拟数据
            return [self._get_mock_quote(symbol) for symbol in hot_symbols]


# 创建全局实例
stock_service = StockService()

