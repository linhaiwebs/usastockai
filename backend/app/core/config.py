from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://stockai:stockai123@db:5432/stockai"
    
    # SiliconFlow AI
    SILICONFLOW_API_KEY: str = ""
    SILICONFLOW_BASE_URL: str = "https://api.siliconflow.cn/v1"
    SILICONFLOW_MODEL: str = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"
    
    # Finance Query API (股票数据源)
    # 使用本地部署的 finance-query 服务
    FINANCE_QUERY_URL: str = "http://finance-query:8000"
    # 如果在本地开发环境（非Docker），使用 localhost
    # FINANCE_QUERY_URL: str = "http://localhost:8002"
    
    # App
    APP_NAME: str = "Stock AI Diagnostic System"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
