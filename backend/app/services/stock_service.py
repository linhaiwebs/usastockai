"""
股票数据服务 - 基于 finance-query 自部署或托管服务
"""
import asyncio
import json
import logging
from typing import List, Dict, Optional
import httpx
from datetime import datetime, timedelta
from ..core.config import get_settings
from ..core.redis import redis_manager

settings = get_settings()
logger = logging.getLogger(__name__)


class StockService:
    """股票数据服务"""
    
    def __init__(self):
        # Finance Query API endpoint
        self.base_url = settings.FINANCE_QUERY_URL
        
        # 缓存配置
        self._memory_cache: Dict[str, Dict] = {}
        self._cache_ttl = 120   # 内存缓存 2 分钟
        self._hot_cache_ttl = 300  # 热门股票缓存 5 分钟
        
        # 持久化 httpx 客户端（连接复用，避免每次重建 TCP+TLS）
        self._http_client: Optional[httpx.AsyncClient] = None
        
        # 并发控制
        self._request_semaphore = asyncio.Semaphore(10)
        
        # 请求头
        self.headers = {
            'User-Agent': 'StockAI/1.0',
            'Accept': 'application/json',
        }
    
    async def _get_http_client(self) -> httpx.AsyncClient:
        """获取或创建持久化 httpx 客户端"""
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                headers=self.headers,
                timeout=httpx.Timeout(8.0, connect=3.0),
                limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            )
        return self._http_client
    
    # ── 缓存层 ──────────────────────────────────────────────
    
    def _is_cache_valid(self, cache_key: str, ttl: int = None) -> bool:
        """检查内存缓存是否有效"""
        if cache_key not in self._memory_cache:
            return False
        effective_ttl = ttl or self._cache_ttl
        cached = self._memory_cache[cache_key]
        return datetime.now() - cached['timestamp'] < timedelta(seconds=effective_ttl)
    
    def _get_from_cache(self, cache_key: str) -> Optional[any]:
        """从内存缓存获取数据"""
        if self._is_cache_valid(cache_key):
            return self._memory_cache[cache_key]['data']
        return None
    
    def _save_to_cache(self, cache_key: str, data: any, ttl: int = None):
        """保存数据到内存缓存"""
        self._memory_cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }
    
    async def _get_from_redis(self, key: str) -> Optional[any]:
        """从 Redis 获取缓存"""
        try:
            if redis_manager._client is None:
                return None
            data = await redis_manager._client.get(key)
            if data:
                return json.loads(data)
        except Exception as e:
            logger.debug(f"Redis read miss for {key}: {e}")
        return None
    
    async def _save_to_redis(self, key: str, data: any, ttl: int = 300):
        """保存到 Redis 缓存"""
        try:
            if redis_manager._client is None:
                return
            await redis_manager._client.setex(key, ttl, json.dumps(data, default=str))
        except Exception as e:
            logger.debug(f"Redis write miss for {key}: {e}")
    
    # ── HTTP 请求 ────────────────────────────────────────────
    
    async def _make_request(self, endpoint: str, params: dict = None) -> Optional[dict]:
        """发送HTTP请求（带多层缓存）"""
        cache_key = f"{endpoint}?{sorted(params.items()) if params else ''}"
        
        # 1. 内存缓存（最快）
        cached_data = self._get_from_cache(cache_key)
        if cached_data is not None:
            return cached_data
        
        # 2. Redis 缓存（次快，跨进程/重启共享）
        redis_key = f"stock:{cache_key}"
        redis_data = await self._get_from_redis(redis_key)
        if redis_data is not None:
            self._save_to_cache(cache_key, redis_data)
            return redis_data
        
        # 3. HTTP 请求
        async with self._request_semaphore:
            client = await self._get_http_client()
            url = f"{self.base_url}{endpoint}"
            
            try:
                response = await client.get(url, params=params)
                
                if response.status_code == 429:
                    logger.warning(f"Rate limited on {endpoint}")
                    await asyncio.sleep(1)
                    return None
                
                response.raise_for_status()
                data = response.json()
                
                # 写入双层缓存
                self._save_to_cache(cache_key, data)
                await self._save_to_redis(redis_key, data, self._cache_ttl)
                
                return data
            except httpx.TimeoutException:
                logger.warning(f"Timeout on {endpoint}")
                return None
            except Exception as e:
                logger.error(f"Request error on {endpoint}: {e}")
                return None
    
    # ── 业务接口 ─────────────────────────────────────────────
    
    async def search_stocks(self, query: str) -> List[Dict]:
        """搜索股票自动补全"""
        if not query or len(query) < 1:
            return []
        
        data = await self._make_request("/v2/search", {"q": query})
        if not data:
            return []
        
        results = []
        for item in data.get("quotes", [])[:10]:
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
        try:
            return float(field)
        except (ValueError, TypeError):
            return None
    
    async def get_quote(self, symbol: str) -> Optional[Dict]:
        """获取股票实时报价"""
        data = await self._make_request(f"/v2/quote/{symbol.upper()}")
        if not data:
            return None
        
        try:
            price = self._parse_price_field(data.get("regularMarketPrice"))
            change = self._parse_price_field(data.get("regularMarketChange"))
            change_percent = self._parse_price_field(data.get("regularMarketChangePercent"))
            volume = self._parse_price_field(data.get("regularMarketVolume"))
            
            if price is None or price <= 0:
                return None

            return {
                "symbol": symbol.upper(),
                "name": data.get("shortName", data.get("longName", "")),
                "price": price,
                "change": change or 0,
                "change_percent": change_percent or 0,
                "volume": int(volume) if volume else 0
            }
        except Exception as e:
            logger.error(f"Parse quote error for {symbol}: {e}")
            return None
    
    async def get_hot_stocks(self) -> List[Dict]:
        """获取热门股票列表（Redis 长缓存 + 并行获取后备）"""
        hot_symbols = ["SPY", "QQQ", "AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL", "META", "AMD"]
        
        # 1. 检查 Redis 热门股票专用缓存（5 分钟）
        redis_key = "stock:hot_stocks"
        redis_data = await self._get_from_redis(redis_key)
        if redis_data:
            return redis_data
        
        # 2. 内存缓存
        mem_data = self._get_from_cache("hot_stocks")
        if mem_data:
            return mem_data
        
        # 3. 批量获取
        symbols_str = ",".join(hot_symbols)
        data = await self._make_request("/v2/quotes", {"symbols": symbols_str})
        
        if data:
            try:
                quotes = []
                quotes_data = data.get("quotes", {})
                
                for symbol in hot_symbols:
                    if symbol in quotes_data:
                        qd = quotes_data[symbol]
                        price = self._parse_price_field(qd.get("regularMarketPrice"))
                        change = self._parse_price_field(qd.get("regularMarketChange"))
                        change_pct = self._parse_price_field(qd.get("regularMarketChangePercent"))
                        volume = self._parse_price_field(qd.get("regularMarketVolume"))
                        
                        if price is not None and price > 0:
                            quotes.append({
                                "symbol": symbol,
                                "name": qd.get("shortName", qd.get("longName", "")),
                                "price": price,
                                "change": change or 0,
                                "change_percent": change_pct or 0,
                                "volume": int(volume) if volume else 0
                            })
                
                if quotes:
                    # 双层缓存
                    self._save_to_cache("hot_stocks", quotes, self._hot_cache_ttl)
                    await self._save_to_redis(redis_key, quotes, self._hot_cache_ttl)
                    return quotes
            except Exception as e:
                logger.error(f"Parse hot stocks error: {e}")
        
        # 4. 并行逐个获取作为后备
        tasks = [self.get_quote(s) for s in hot_symbols]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        quotes = [r for r in results if isinstance(r, dict)]
        
        if quotes:
            self._save_to_cache("hot_stocks", quotes, self._hot_cache_ttl)
            await self._save_to_redis(redis_key, quotes, self._hot_cache_ttl)
        
        return quotes
    
    async def close(self):
        """关闭持久化 HTTP 客户端"""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()
            self._http_client = None


# 创建全局实例
stock_service = StockService()

