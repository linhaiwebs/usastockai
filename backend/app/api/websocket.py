"""
WebSocket 实时股票推送
"""
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.stock_service import stock_service

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@router.websocket("/ws/stocks")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 实时股票推送"""
    await manager.connect(websocket)
    
    try:
        # 启动后台任务定期推送股票数据
        async def send_stock_updates():
            while True:
                try:
                    # 获取热门股票数据
                    hot_stocks = await stock_service.get_hot_stocks()
                    
                    # 发送给客户端
                    import json
                    await websocket.send_json({
                        "type": "stock_update",
                        "data": hot_stocks
                    })
                    
                    # 每30秒更新一次
                    await asyncio.sleep(30)
                except Exception as e:
                    print(f"Error sending stock update: {e}")
                    break
        
        # 启动推送任务
        update_task = asyncio.create_task(send_stock_updates())
        
        # 保持连接,监听客户端消息
        while True:
            data = await websocket.receive_text()
            
            # 客户端可以请求特定股票
            if data.startswith("subscribe:"):
                symbol = data.split(":")[1]
                quote = await stock_service.get_quote(symbol)
                if quote:
                    import json
                    await websocket.send_json({
                        "type": "quote",
                        "symbol": symbol,
                        "data": quote
                    })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        update_task.cancel()
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)
        update_task.cancel()
