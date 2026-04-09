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
    
    # App
    APP_NAME: str = "Stock AI Diagnostic System"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
