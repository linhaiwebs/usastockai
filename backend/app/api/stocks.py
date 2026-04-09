"""
股票数据 API 端点
"""
from fastapi import APIRouter, HTTPException
from ..services.stock_service import stock_service

router = APIRouter(prefix="/api", tags=["stocks"])


@router.get("/search")
async def search_stocks(q: str):
    """搜索股票自动补全"""
    if not q or len(q) < 1:
        return {"results": []}
    
    results = await stock_service.search_stocks(q)
    return {"results": results}


@router.get("/stocks/hot")
async def get_hot_stocks():
    """获取热门股票列表"""
    stocks = await stock_service.get_hot_stocks()
    return {"stocks": stocks}


@router.get("/stocks/{symbol}")
async def get_stock_detail(symbol: str):
    """获取股票详情"""
    quote = await stock_service.get_quote(symbol)
    
    if not quote:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    return quote
