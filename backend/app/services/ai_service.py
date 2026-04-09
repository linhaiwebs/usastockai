"""
AI Analysis Service - Based on SiliconFlow DeepSeek R1
Forces English output, multiple diagnostic formats
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
        """版本1: 深度诊断型 - 极简prompt"""
        price = quote_data.get('price', 0)
        return f"""Fill this template for {symbol} stock. Keep all emojis and structure exactly as shown.

🍎 {symbol} · ${price:.2f} · Market Cap: [cap]

——————————
📊 AI Score: [0-100]/100
——————————

✅ Strengths:
• [strength 1]
• [strength 2]

⚠️ Risks:
• [risk 1]
• [risk 2]

📍 Technical:
Support $[price] · Resistance $[price]"""

    def _template_narrative(self, symbol: str, quote_data: dict) -> str:
        """版本2: 叙事引导型 - 极简prompt"""
        price = quote_data.get('price', 0)
        return f"""Fill this template for {symbol} stock. Keep all emojis and structure exactly as shown.

🔍 {symbol} Analysis

📈 Bullish:
[2 sentences max]

📉 Bearish:
[2 sentences max]

🎯 AI Score: [0-100]/100
Strategy: [1 sentence]"""

    def _template_qa(self, symbol: str, quote_data: dict) -> str:
        """版本3: 问答对话型 - 极简prompt"""
        price = quote_data.get('price', 0)
        return f"""Fill this template for {symbol} stock. Keep all emojis and structure exactly as shown.

💬 {symbol} Quick Analysis

❓ Growth?
[1 sentence]

❓ Valuation?
[1 sentence]

❓ Biggest Risk?
[1 sentence]

❓ Buy?
[Yes/No + 1 reason]"""

    def _template_data_table(self, symbol: str, quote_data: dict) -> str:
        """版本4: 数据表格型 - 极简prompt"""
        price = quote_data.get('price', 0)
        return f"""Fill this template for {symbol} stock. Keep all emojis and structure exactly as shown.

📊 {symbol} Diagnostic

┌─────────────────┐
│ Price: ${price:.2f}
│ Fair: $[low]-$[high]
│ Score: [0-100]/100
│ Risk: [Low/Med/High]
└─────────────────┘

📈 Fundamentals:
• Profit: ⭐⭐⭐⭐⭐
• Growth: ⭐⭐⭐⭐
• Value: ⭐⭐⭐

🔥 Catalysts:
1. [catalyst]
2. [catalyst]

⚠️ Risks:
1. [risk]
2. [risk]

📍 Technical:
RSI [number] · Support $[price] · Resistance $[price]"""

    def _template_minimalist(self, symbol: str, quote_data: dict) -> str:
        """版本5: 极简精华型 - 极简prompt"""
        price = quote_data.get('price', 0)
        return f"""Fill this template for {symbol} stock. Keep all emojis and structure exactly as shown.

🍎 {symbol} · ${price:.2f}

Summary: [1 sentence]

🔥 Buy reason:
[1 sentence]

⚠️ Risk:
[1 sentence]

🎯 Score: [0-100]/100

📊 Support $[price] · Resistance $[price] · RSI [number]"""
    
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
        
        system_prompt = """You are a stock analyst AI. STRICT RULES:
1. Output ONLY the filled template
2. Keep ALL emojis and structure EXACTLY as shown
3. Replace [brackets] with real data
4. NO extra text before or after
5. NO explanations or introductions
6. Be concise - 1-2 sentences max per section"""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.05,  # 极低温度
                max_tokens=400,    # 大幅减少token
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.3
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n[Error] AI service unavailable: {str(e)}"
            yield error_msg
    
    async def analyze_general(self, stock_name: str, price: float) -> AsyncGenerator[str, None]:
        """
        非输入框的通用分析（Meet Your AI Agent Team按钮）
        固定格式输出
        """
        prompt = f"""Fill this template. Keep emojis and structure exactly as shown.

🔍 {stock_name} · ${price:.2f}

You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report.

STRICT RULES:
- Output ONLY the template above
- NO extra text
- Keep it concise"""

        system_prompt = """You are a stock analyst AI. Output ONLY the exact template provided. NO additional text or explanations."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.05,  # 极低温度
                max_tokens=100,
                top_p=0.9
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
