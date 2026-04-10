from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # 服务端口（多项目部署时修改此端口避免冲突）
    PORT: int = 8000
    
    # 数据库（多项目部署时修改数据库名避免冲突）
    DATABASE_URL: str = "postgresql+asyncpg://stockai:stockai123@db:5432/stockai"
    
    # AI服务配置
    SILICONFLOW_API_KEY: str = ""
    SILICONFLOW_BASE_URL: str = "https://api.siliconflow.cn/v1"
    SILICONFLOW_MODEL: str = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"
    
    # 股票数据API
    FINANCE_QUERY_URL: str = "https://finance-query.com"
    
    # 应用配置
    APP_NAME: str = "Stock AI Diagnostic System"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
