"""
Stock AI Diagnostic System - FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .core.database import init_db
from .api import stocks, analyze, redirects, websocket

settings = get_settings()

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    description="股票AI诊断系统 - 提供股票搜索、AI分析、分流链接管理等功能",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(stocks.router)
app.include_router(analyze.router)
app.include_router(redirects.router)
app.include_router(websocket.router)


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    await init_db()
    print("✅ Database initialized")


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Stock AI Diagnostic System API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": settings.APP_NAME}
