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
    # 选项1: 使用托管版本（免费，推荐）
    FINANCE_QUERY_URL: str = "https://finance-query.com"
    # 选项2: 使用自部署版本（需要自己部署 finance-query-server）
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
