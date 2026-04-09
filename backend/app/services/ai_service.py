"""
AI 分析服务 - 基于 SiliconFlow DeepSeek R1
"""
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from ..core.config import get_settings

settings = get_settings()


class AIService:
    """AI 分析服务"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.SILICONFLOW_API_KEY,
            base_url=settings.SILICONFLOW_BASE_URL
        )
        self.model = settings.SILICONFLOW_MODEL
    
    async def analyze_stream(self, query: str) -> AsyncGenerator[str, None]:
        """
        流式分析股票查询
        支持 DeepSeek R1 的 <think/> 推理过程
        """
        system_prompt = """你是一位专业的美股投资顾问AI助手。你的任务是:
1. 分析用户提出的股票相关问题
2. 提供专业、客观、理性的分析
3. 包含技术分析和基本面分析的要点
4. 给出风险提示和投资建议

请用中文回答，保持专业且易懂的风格。"""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"请分析: {query}"}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=2000
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n[错误] AI分析服务暂时不可用: {str(e)}"
            yield error_msg
    
    async def analyze_stock(self, symbol: str, quote_data: dict) -> AsyncGenerator[str, None]:
        """
        分析特定股票
        """
        query = f"""
股票代码: {symbol}
股票名称: {quote_data.get('name', 'Unknown')}
当前价格: ${quote_data.get('price', 0):.2f}
涨跌额: ${quote_data.get('change', 0):.2f}
涨跌幅: {quote_data.get('change_percent', 0):.2f}%
成交量: {quote_data.get('volume', 0):,}

请对这只股票进行全面分析,包括:
1. 当前走势分析
2. 技术指标解读
3. 投资风险评估
4. 操作建议
"""
        async for chunk in self.analyze_stream(query):
            yield chunk


# 创建全局实例
ai_service = AIService() if settings.SILICONFLOW_API_KEY else None
