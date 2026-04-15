"""
Stock Data API Endpoints
"""
from fastapi import APIRouter, HTTPException
from ..services.stock_service import stock_service

router = APIRouter(prefix="/api", tags=["stocks"])


@router.get("/search")
async def search_stocks(q: str, page: int = 1, limit: int = 5):
    """Search stocks with autocomplete, paginated"""
    if not q or len(q) < 1:
        return {"results": [], "total": 0, "page": page, "limit": limit}
    
    results = await stock_service.search_stocks(q, page=page, limit=limit)
    return results


@router.get("/stocks/hot")
async def get_hot_stocks():
    """Get hot stocks list"""
    stocks = await stock_service.get_hot_stocks()
    return {"stocks": stocks}


@router.get("/stocks/{symbol}")
async def get_stock_detail(symbol: str):
    """Get stock detail"""
    quote = await stock_service.get_quote(symbol)
    
    if not quote:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return quote
