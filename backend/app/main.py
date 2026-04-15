"""
Stock AI Diagnostic System - FastAPI Main Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core.config import get_settings
from .core.database import init_db
from .api import stocks, analyze, redirects, websocket, admin
import logging

settings = get_settings()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    description="Stock AI Diagnostic System - Stock search, AI analysis, redirect management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS - 允许所有来源，支持跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
    expose_headers=["*"],  # 暴露所有响应头
)

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )

# 注册路由
app.include_router(stocks.router)
app.include_router(analyze.router)
app.include_router(redirects.router)
app.include_router(websocket.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化"""
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

    # Migrate old broken prompt templates (had Python format syntax like {price:.2f})
    try:
        from .core.database import async_session
        from .models.ai_setting import AISetting
        from sqlalchemy import select, update

        # Detect old format by checking if any prompt contains ":.2f" or ":+.2f"
        async with async_session() as session:
            result = await session.execute(
                select(AISetting).where(AISetting.key.like("stock_prompt_format_%"))
            )
            rows = result.scalars().all()
            needs_migration = any(":.2f" in (r.value or "") or ":+.2f" in (r.value or "") for r in rows)

        if needs_migration:
            from .services.ai_service import (
                DEFAULT_FORMAT_1, DEFAULT_FORMAT_2, DEFAULT_FORMAT_3,
                DEFAULT_STOCK_SYSTEM, DEFAULT_STREAMING_SYSTEM
            )
            async with async_session() as session:
                migrations = {
                    "stock_system_prompt": DEFAULT_STOCK_SYSTEM,
                    "streaming_system_prompt": DEFAULT_STREAMING_SYSTEM,
                    "stock_prompt_format_1": DEFAULT_FORMAT_1,
                    "stock_prompt_format_2": DEFAULT_FORMAT_2,
                    "stock_prompt_format_3": DEFAULT_FORMAT_3,
                }
                for key, value in migrations.items():
                    await session.execute(
                        update(AISetting).where(AISetting.key == key).values(value=value)
                    )
                await session.commit()
            from .services.ai_service import invalidate_settings_cache
            invalidate_settings_cache()
            logger.info("✅ Migrated prompt templates (fixed format syntax)")
    except Exception as e:
        logger.warning(f"⚠️ Prompt migration skipped: {e}")


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
