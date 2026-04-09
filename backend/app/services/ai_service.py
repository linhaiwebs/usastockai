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
    """AI Analysis Service"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.SILICONFLOW_API_KEY,
            base_url=settings.SILICONFLOW_BASE_URL
        )
        self.model = settings.SILICONFLOW_MODEL
        
        # 5种诊断格式模板 - 使用完整示例
        self.diagnostic_templates = [
            self._template_comprehensive,
            self._template_narrative,
            self._template_qa,
            self._template_data_table,
            self._template_minimalist
        ]
    
    def _template_comprehensive(self, symbol: str, quote_data: dict) -> str:
        """版本1: 深度诊断型 - 使用完整示例"""
        price = quote_data.get('price', 0)
        return f"""Copy this exact format for {symbol}. Replace the example data with real {symbol} data.

Example for AAPL at $178.50:

🍎 AAPL · $178.50 · Market Cap: $2.8T

——————————
📊 AI Score: 85/100
——————————

✅ Strengths:
• Strong iPhone 15 sales, up 12% YoY
• Services revenue hit $22B quarterly

⚠️ Risks:
• China market slowdown, -8% revenue
• Regulatory pressure in EU

📍 Technical:
Support $175 · Resistance $182

Now generate the EXACT same format for {symbol} at ${price:.2f}. Use real data. Keep emojis and structure identical. No extra text."""

    def _template_narrative(self, symbol: str, quote_data: dict) -> str:
        """版本2: 叙事引导型 - 使用完整示例"""
        price = quote_data.get('price', 0)
        return f"""Copy this exact format for {symbol}. Replace example data with real {symbol} data.

Example for AAPL at $178.50:

🔍 AAPL Analysis

📈 Bullish:
iPhone 15 sales exceeded expectations with 12% growth. Services segment growing at 15% annually with strong subscription revenue.

📉 Bearish:
China market declined 8% due to competition. EU regulatory pressure could impact App Store revenue by $5B annually.

🎯 AI Score: 85/100
Strategy: Buy on dips below $175, target $190.

Now generate the EXACT same format for {symbol} at ${price:.2f}. Use real data. Keep emojis and structure identical."""

    def _template_qa(self, symbol: str, quote_data: dict) -> str:
        """版本3: 问答对话型 - 使用完整示例"""
        price = quote_data.get('price', 0)
        return f"""Copy this exact format for {symbol}. Replace example data with real {symbol} data.

Example for AAPL at $178.50:

💬 AAPL Quick Analysis

❓ Growth?
iPhone 15 sales up 12% YoY. Services revenue grew 15% to $22B quarterly.

❓ Valuation?
P/E ratio at 28x is reasonable for 15% growth rate. Free cash flow yield of 4% is attractive.

❓ Biggest Risk?
China market slowdown and EU regulatory pressure could reduce revenue by $8B annually.

❓ Buy?
Yes, strong fundamentals support current valuation. Entry point: $175-180.

Now generate the EXACT same format for {symbol} at ${price:.2f}. Use real data. Keep emojis and structure identical."""

    def _template_data_table(self, symbol: str, quote_data: dict) -> str:
        """版本4: 数据表格型 - 使用完整示例"""
        price = quote_data.get('price', 0)
        return f"""Copy this exact format for {symbol}. Replace example data with real {symbol} data.

Example for AAPL at $178.50:

📊 AAPL Diagnostic

┌─────────────────┐
│ Price: $178.50
│ Fair: $165-$195
│ Score: 85/100
│ Risk: Medium
└─────────────────┘

📈 Fundamentals:
• Profit: ⭐⭐⭐⭐⭐ (25% margin)
• Growth: ⭐⭐⭐⭐ (12% YoY)
• Value: ⭐⭐⭐ (P/E 28x)

🔥 Catalysts:
1. iPhone 15 launch
2. Services growth 15%

⚠️ Risks:
1. China slowdown
2. EU regulation

📍 Technical:
RSI 55 · Support $175 · Resistance $182

Now generate the EXACT same format for {symbol} at ${price:.2f}. Use real data. Keep emojis and structure identical."""

    def _template_minimalist(self, symbol: str, quote_data: dict) -> str:
        """版本5: 极简精华型 - 使用完整示例"""
        price = quote_data.get('price', 0)
        return f"""Copy this exact format for {symbol}. Replace example data with real {symbol} data.

Example for AAPL at $178.50:

🍎 AAPL · $178.50

Summary: Strong iPhone 15 sales and growing services revenue support bullish outlook.

🔥 Buy reason:
iPhone 15 exceeded sales expectations by 12%, services growing 15% annually.

⚠️ Risk:
China market down 8%, EU regulation threatens $5B revenue.

🎯 Score: 85/100

📊 Support $175 · Resistance $182 · RSI 55

Now generate the EXACT same format for {symbol} at ${price:.2f}. Use real data. Keep emojis and structure identical."""
    
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
        Analyze specific stock with strict format control
        """
        # 随机选择一个模板
        template_func = random.choice(self.diagnostic_templates)
        prompt = template_func(symbol, quote_data)
        
        system_prompt = """You are a concise stock analyst. OUTPUT RULES:
1. Start with emoji (🍎, 🔍, 💬, 📊)
2. Maximum 15 lines total
3. Use ONLY these sections: Strengths, Risks, Technical OR Bullish, Bearish, Score
4. NO headers like "Investment Advice" or "Fundamental Analysis"
5. NO disclaimers
6. NO extra explanations
7. One sentence per bullet point maximum
8. End with technical levels or score

CRITICAL: Output ONLY the diagnostic format. NO introductions or conclusions."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.01,  # 几乎确定性
                max_tokens=300,     # 更严格的限制
                top_p=0.95,
                frequency_penalty=0.5,
                presence_penalty=0.5,
                stop=["\n\n\n", "Disclaimer:", "Investment Advice:", "Note:"]  # 停止符
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
