"""
Redis连接管理器
用于缓存和会话管理
"""
import redis.asyncio as redis
from typing import Optional
import os

class RedisManager:
    """Redis连接管理器"""
    
    _instance: Optional['RedisManager'] = None
    _client: Optional[redis.Redis] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self):
        """连接Redis"""
        if self._client is None:
            redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
            self._client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True
            )
        return self._client
    
    async def disconnect(self):
        """断开Redis连接"""
        if self._client:
            await self._client.close()
            self._client = None
    
    @property
    def client(self) -> redis.Redis:
        """获取Redis客户端"""
        if self._client is None:
            raise RuntimeError("Redis not connected. Call connect() first.")
        return self._client


# 全局Redis管理器实例
redis_manager = RedisManager()


async def get_redis() -> redis.Redis:
    """获取Redis客户端依赖"""
    if redis_manager._client is None:
        await redis_manager.connect()
    return redis_manager.client
