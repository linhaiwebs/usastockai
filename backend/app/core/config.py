from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    DB_USER: str = "stockai"
    DB_PASSWORD: str = "stockai123"
    DB_NAME: str = "stockai"
    
    @property
    def DATABASE_URL(self) -> str:
        """构建数据库连接URL"""
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # SiliconFlow AI
    SILICONFLOW_API_KEY: str = ""
    SILICONFLOW_BASE_URL: str = "https://api.siliconflow.cn/v1"
    SILICONFLOW_MODEL: str = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"
    
    # Finance Query API (股票数据源)
    # 支持本地部署或托管服务
    FINANCE_QUERY_HOST: str = "finance-query"
    FINANCE_QUERY_PORT: int = 8000
    FINANCE_QUERY_USE_HTTPS: bool = False
    
    @property
    def FINANCE_QUERY_URL(self) -> str:
        """构建 Finance Query API URL"""
        protocol = "https" if self.FINANCE_QUERY_USE_HTTPS else "http"
        # 如果主机名已经是完整URL（向后兼容），直接返回
        if self.FINANCE_QUERY_HOST.startswith("http"):
            return self.FINANCE_QUERY_HOST
        return f"{protocol}://{self.FINANCE_QUERY_HOST}:{self.FINANCE_QUERY_PORT}"
    
    # App
    APP_NAME: str = "Stock AI Diagnostic System"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"  # development, production
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
