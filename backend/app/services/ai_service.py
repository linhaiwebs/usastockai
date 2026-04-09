"""
AI 分析服务 - 基于 SiliconFlow DeepSeek R1
强制英文输出，多种诊断格式
"""
import json
import random
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
        
        # 5种诊断格式模板
        self.diagnostic_templates = [
            self._template_comprehensive,      # 版本1: 深度诊断型
            self._template_narrative,          # 版本2: 叙事引导型
            self._template_qa,                 # 版本3: 问答对话型
            self._template_data_table,         # 版本4: 数据表格型
            self._template_minimalist          # 版本5: 极简精华型
        ]
    
    def _template_comprehensive(self, symbol: str, quote_data: dict) -> str:
        """版本1: 深度诊断型（推荐）"""
        return f"""Analyze {symbol} stock comprehensively. Stock data:
- Symbol: {symbol}
- Name: {quote_data.get('name', 'Unknown')}
- Price: ${quote_data.get('price', 0):.2f}
- Change: ${quote_data.get('change', 0):.2f} ({quote_data.get('change_percent', 0):.2f}%)
- Volume: {quote_data.get('volume', 0):,}

Please provide analysis in this EXACT format:

🍎 {symbol} · ${quote_data.get('price', 0):.2f} · Market Cap Analysis

——————————
📊 AI Comprehensive Score: [Score]/100
——————————

✅ Core Strengths:
• [Strength 1 with data]
• [Strength 2 with data]
• [Strength 3 with data]

⚠️ Major Risks:
• [Risk 1 with data]
• [Risk 2 with data]
• [Risk 3 with data]

🔥 Catalysts:
• [Catalyst 1]
• [Catalyst 2]

📍 Technical Levels:
Support $[Level] · Resistance $[Level] · Stop Loss $[Level]

IMPORTANT: 
- Respond entirely in English
- Use actual market data and analysis
- Provide specific numbers and percentages
- Be objective and professional"""

    def _template_narrative(self, symbol: str, quote_data: dict) -> str:
        """版本2: 叙事引导型"""
        return f"""Analyze {symbol} stock with narrative style. Stock data:
- Symbol: {symbol}
- Name: {quote_data.get('name', 'Unknown')}
- Price: ${quote_data.get('price', 0):.2f}
- Change: ${quote_data.get('change', 0):.2f} ({quote_data.get('change_percent', 0):.2f}%)

Please provide analysis in this EXACT format:

🔍 Let AI analyze {symbol} for you

47 indicators reveal:

📈 Bullish Logic:
[Detailed bullish analysis with specific data points and reasoning]

📉 Bearish Logic:
[Detailed bearish analysis with specific risks and concerns]

🤖 AI Conclusion: [Score]/100
Strategy: [Specific trading strategy with entry/exit points]

IMPORTANT: 
- Respond entirely in English
- Use actual market data
- Provide specific reasoning
- Be professional and objective"""

    def _template_qa(self, symbol: str, quote_data: dict) -> str:
        """版本3: 问答对话型"""
        return f"""Analyze {symbol} stock in Q&A format. Stock data:
- Symbol: {symbol}
- Name: {quote_data.get('name', 'Unknown')}
- Price: ${quote_data.get('price', 0):.2f}
- Change: ${quote_data.get('change', 0):.2f} ({quote_data.get('change_percent', 0):.2f}%)

Please provide analysis in this EXACT format:

💬 Asking about {symbol}?

AI discovered these key insights:

❓ Is the company still growing?
[Answer with specific data and growth metrics]

❓ Is the valuation reasonable?
[Answer with PE ratio, historical comparison, and valuation analysis]

❓ What's the biggest risk?
[Answer with specific risk factors and potential impact]

❓ Should I buy?
AI Recommendation: [Clear buy/sell/hold recommendation with specific price levels]

IMPORTANT: 
- Respond entirely in English
- Use actual market data
- Provide clear, actionable answers
- Be objective and professional"""

    def _template_data_table(self, symbol: str, quote_data: dict) -> str:
        """版本4: 数据表格型"""
        return f"""Analyze {symbol} stock with data table format. Stock data:
- Symbol: {symbol}
- Name: {quote_data.get('name', 'Unknown')}
- Price: ${quote_data.get('price', 0):.2f}
- Change: ${quote_data.get('change', 0):.2f} ({quote_data.get('change_percent', 0):.2f}%)

Please provide analysis in this EXACT format:

📊 {symbol} AI Diagnostic Report

┌─────────────────────────┐
│ Current Price: ${quote_data.get('price', 0):.2f}
│ Fair Range: $[Low]-$[High]
│ AI Score: [Score]/100
│ Risk Level: [Low/Medium/High]
└─────────────────────────┘

📈 Fundamentals:
• Profitability: ⭐⭐⭐⭐⭐ ([Specific margin%])
• Growth: ⭐⭐⭐⭐ ([Growth rate%])
• Cash Flow: ⭐⭐⭐⭐⭐ ([Amount])
• Valuation: ⭐⭐⭐ ([Analysis])

🔥 Top 3 Catalysts:
1. [Catalyst 1]
2. [Catalyst 2]
3. [Catalyst 3]

⚠️ Top 3 Risks:
1. [Risk 1]
2. [Risk 2]
3. [Risk 3]

📍 Technical Indicators:
RSI [Number] ([Status]) · MACD [Status]
Support $[Level] · Resistance $[Level]

IMPORTANT: 
- Respond entirely in English
- Use actual market data
- Provide specific metrics
- Be concise and professional"""

    def _template_minimalist(self, symbol: str, quote_data: dict) -> str:
        """版本5: 极简精华型"""
        return f"""Analyze {symbol} stock with minimalist format. Stock data:
- Symbol: {symbol}
- Name: {quote_data.get('name', 'Unknown')}
- Price: ${quote_data.get('price', 0):.2f}
- Change: ${quote_data.get('change', 0):.2f} ({quote_data.get('change_percent', 0):.2f}%)

Please provide analysis in this EXACT format:

🍎 {symbol} · AI Deep Analysis

One-sentence summary (key points only):

🔥 Why buy?
[Single most compelling bull case with data]

⚠️ Why hesitate?
[Single biggest concern with data]

🎯 AI Conclusion: [Score]/100
Strategy: [Specific entry point and strategy]

📊 Technical Snapshot:
Support $[Level] · Resistance $[Level] · RSI [Number]

IMPORTANT: 
- Respond entirely in English
- Be extremely concise
- Only highlight THE most important points
- Provide actionable insights"""
    
    async def analyze_stream(self, query: str) -> AsyncGenerator[str, None]:
        """
        流式分析股票查询（非股票代码格式）
        """
        system_prompt = """You are a professional US stock investment advisor AI assistant. Your task is to:
1. Analyze stock-related questions from users
2. Provide professional, objective, and rational analysis
3. Include technical and fundamental analysis
4. Provide risk warnings and investment advice

CRITICAL: You MUST respond entirely in English. No Chinese characters allowed."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze: {query}"}
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
            error_msg = f"\n\n[Error] AI analysis service temporarily unavailable: {str(e)}"
            yield error_msg
    
    async def analyze_stock(self, symbol: str, quote_data: dict) -> AsyncGenerator[str, None]:
        """
        分析特定股票 - 随机选择一种诊断格式
        严格限制输出长度和格式
        """
        # 随机选择一个模板
        template_func = random.choice(self.diagnostic_templates)
        prompt = template_func(symbol, quote_data)
        
        system_prompt = """You are a professional US stock investment advisor AI assistant.
CRITICAL REQUIREMENTS:
1. You MUST respond entirely in English - no Chinese characters
2. Follow the EXACT format structure provided
3. Use actual market data and analysis
4. Be objective, professional, and specific
5. Provide actionable insights with specific numbers
6. Keep response CONCISE - maximum 500 words
7. Do NOT add any extra commentary or explanation beyond the format"""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.8,  # 稍高温度以增加多样性
                max_tokens=800  # 限制最大token数量
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n[Error] AI analysis service temporarily unavailable: {str(e)}"
            yield error_msg
    
    async def analyze_general(self, stock_name: str, price: float) -> AsyncGenerator[str, None]:
        """
        非输入框的通用分析（Meet Your AI Agent Team按钮）
        固定格式输出
        """
        prompt = f"""Generate a brief analysis for {stock_name} at ${price:.2f}.

Use this EXACT format:

🔍 {stock_name} · ${price:.2f}


You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report.

IMPORTANT: 
- Respond entirely in English
- Keep it concise and impactful
- Do NOT add any additional content"""

        system_prompt = """You are a professional US stock investment advisor AI assistant.
CRITICAL: You MUST respond entirely in English with the EXACT format provided.
Do NOT add any additional content or analysis beyond the specified format."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.3,  # 低温度确保格式一致
                max_tokens=150
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            # 如果AI失败，返回固定格式
            fallback = f"""🔍 {stock_name} · ${price:.2f}


You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report."""
            yield fallback


# 创建全局实例
ai_service = AIService() if settings.SILICONFLOW_API_KEY else None
