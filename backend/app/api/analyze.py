"""
AI 分析 API 端点 (SSE 流式输出)
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from ..services.ai_service import ai_service
from ..services.stock_service import stock_service
from ..core.config import get_settings

router = APIRouter(prefix="/api", tags=["ai"])
settings = get_settings()


@router.get("/analyze")
async def analyze_query(q: str):
    """流式AI分析"""
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    async def event_generator():
        """生成SSE事件流"""
        try:
            async for chunk in ai_service.analyze_stream(q):
                yield {
                    "event": "message",
                    "data": chunk
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": str(e)
            }
    
    return EventSourceResponse(event_generator())


@router.get("/analyze/{symbol}")
async def analyze_stock(symbol: str):
    """分析特定股票"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    # 获取股票数据
    quote = await stock_service.get_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    async def event_generator():
        """生成SSE事件流"""
        try:
            async for chunk in ai_service.analyze_stock(symbol, quote):
                yield {
                    "event": "message",
                    "data": chunk
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": str(e)
            }
    
    return EventSourceResponse(event_generator())
