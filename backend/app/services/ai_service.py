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
        price = quote_data.get('price', 0)
        return f"""You are a stock analyst. Analyze {symbol} and fill in the template below.

CRITICAL: You MUST follow this EXACT format. Only replace the bracketed placeholders with actual data and analysis. Do NOT change any other text, symbols, or structure.

🍎 {symbol} · ${price:.2f} · Market Cap [Insert market cap]

——————————
📊 AI Comprehensive Score: [Insert score 0-100]/100
——————————

✅ Core Strengths:
• [Insert strength 1 with specific data]
• [Insert strength 2 with specific data]
• [Insert strength 3 with specific data]

⚠️ Major Risks:
• [Insert risk 1 with specific data]
• [Insert risk 2 with specific data]
• [Insert risk 3 with specific data]

🔥 Catalysts:
• [Insert catalyst 1]
• [Insert catalyst 2]

📍 Technical Levels:
Support $[Insert price] · Resistance $[Insert price] · Stop Loss $[Insert price]

IMPORTANT: Output ONLY the filled template above. Do NOT add any introduction, conclusion, or additional analysis. Start directly with 🍎 and end with the Technical Levels line."""

    def _template_narrative(self, symbol: str, quote_data: dict) -> str:
        """版本2: 叙事引导型"""
        price = quote_data.get('price', 0)
        return f"""You are a stock analyst. Analyze {symbol} and fill in the template below.

CRITICAL: You MUST follow this EXACT format. Only replace the bracketed placeholders with actual data and analysis. Do NOT change any other text, symbols, or structure.

🔍 Let AI analyze {symbol} for you

47 indicators reveal:

📈 Bullish Logic:
[Insert detailed bullish analysis with specific data points and reasoning in 2-3 sentences]

📉 Bearish Logic:
[Insert detailed bearish analysis with specific risks and concerns in 2-3 sentences]

🤖 AI Conclusion: [Insert score 0-100]/100
Strategy: [Insert specific trading strategy with entry/exit points]

IMPORTANT: Output ONLY the filled template above. Do NOT add any introduction, conclusion, or additional analysis. Start directly with 🔍 and end with the Strategy line."""

    def _template_qa(self, symbol: str, quote_data: dict) -> str:
        """版本3: 问答对话型"""
        price = quote_data.get('price', 0)
        return f"""You are a stock analyst. Analyze {symbol} and fill in the template below.

CRITICAL: You MUST follow this EXACT format. Only replace the bracketed placeholders with actual data and analysis. Do NOT change any other text, symbols, or structure.

💬 Asking about {symbol}?

AI discovered these key insights:

❓ Is the company still growing?
[Insert answer with specific data and growth metrics in 1-2 sentences]

❓ Is the valuation reasonable?
[Insert answer with PE ratio, historical comparison, and valuation analysis in 1-2 sentences]

❓ What's the biggest risk?
[Insert answer with specific risk factors and potential impact in 1-2 sentences]

❓ Should I buy?
AI Recommendation: [Insert clear buy/sell/hold recommendation with specific price levels]

IMPORTANT: Output ONLY the filled template above. Do NOT add any introduction, conclusion, or additional analysis. Start directly with 💬 and end with the AI Recommendation line."""

    def _template_data_table(self, symbol: str, quote_data: dict) -> str:
        """版本4: 数据表格型"""
        price = quote_data.get('price', 0)
        return f"""You are a stock analyst. Analyze {symbol} and fill in the template below.

CRITICAL: You MUST follow this EXACT format. Only replace the bracketed placeholders with actual data and analysis. Do NOT change any other text, symbols, or structure.

📊 {symbol} AI Diagnostic Report

┌─────────────────────────┐
│ Current Price: ${price:.2f}
│ Fair Range: $[Insert low]-$[Insert high]
│ AI Score: [Insert score 0-100]/100
│ Risk Level: [Insert Low/Medium/High]
└─────────────────────────┘

📈 Fundamentals:
• Profitability: ⭐⭐⭐⭐⭐ ([Insert specific margin%])
• Growth: ⭐⭐⭐⭐ ([Insert growth rate%])
• Cash Flow: ⭐⭐⭐⭐⭐ ([Insert amount])
• Valuation: ⭐⭐⭐ ([Insert analysis])

🔥 Top 3 Catalysts:
1. [Insert catalyst 1]
2. [Insert catalyst 2]
3. [Insert catalyst 3]

⚠️ Top 3 Risks:
1. [Insert risk 1]
2. [Insert risk 2]
3. [Insert risk 3]

📍 Technical Indicators:
RSI [Insert number] ([Insert status]) · MACD [Insert status]
Support $[Insert price] · Resistance $[Insert price]

IMPORTANT: Output ONLY the filled template above. Do NOT add any introduction, conclusion, or additional analysis. Start directly with 📊 and end with the Support line."""

    def _template_minimalist(self, symbol: str, quote_data: dict) -> str:
        """版本5: 极简精华型"""
        price = quote_data.get('price', 0)
        return f"""You are a stock analyst. Analyze {symbol} and fill in the template below.

CRITICAL: You MUST follow this EXACT format. Only replace the bracketed placeholders with actual data and analysis. Do NOT change any other text, symbols, or structure.

🍎 {symbol} · AI Deep Analysis

One-sentence summary (key points only):

🔥 Why buy?
[Insert single most compelling bull case with data in 1 sentence]

⚠️ Why hesitate?
[Insert single biggest concern with data in 1 sentence]

🎯 AI Conclusion: [Insert score 0-100]/100
Strategy: [Insert specific entry point and strategy in 1 sentence]

📊 Technical Snapshot:
Support $[Insert price] · Resistance $[Insert price] · RSI [Insert number]

IMPORTANT: Output ONLY the filled template above. Do NOT add any introduction, conclusion, or additional analysis. Start directly with 🍎 and end with the RSI number."""
    
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
        严格限制：只填充模板，不添加任何额外内容
        """
        # 随机选择一个模板
        template_func = random.choice(self.diagnostic_templates)
        prompt = template_func(symbol, quote_data)
        
        system_prompt = """You are a professional US stock investment advisor AI assistant.

STRICT RULES:
1. You MUST respond entirely in English - no Chinese characters
2. You MUST follow the EXACT template structure provided
3. You can ONLY replace text inside [brackets] with actual data
4. Do NOT add, remove, or modify ANY other text, emojis, symbols, or structure
5. Do NOT add introduction or conclusion
6. Do NOT add any commentary outside the template
7. Output ONLY the filled template - nothing more, nothing less

The template has been carefully designed. Your job is to fill in the placeholders with real analysis and data, while keeping all other elements exactly as they are."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.3,  # 降低温度以减少创造性，确保格式一致性
                max_tokens=1000
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
