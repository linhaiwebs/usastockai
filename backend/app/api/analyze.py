"""
AI Analysis API Endpoints (SSE Streaming Output)
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
    """Streaming AI analysis (non-stock code format)"""
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    async def event_generator():
        """Generate SSE event stream"""
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
    """Analyze specific stock (randomly select a diagnostic format)"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not configured")
    
    # Get stock data
    quote = await stock_service.get_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    async def event_generator():
        """Generate SSE event stream"""
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
