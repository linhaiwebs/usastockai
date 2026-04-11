"""
AI Analysis Service - Optimized for Qwen 2.5 (Fast Response)
Qwen is a non-reasoning model with quick streaming output
"""
import random
from typing import AsyncGenerator
from openai import AsyncOpenAI
from ..core.config import get_settings

settings = get_settings()


class AIService:
    """AI Analysis Service - Qwen 2.5 Optimized"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.SILICONFLOW_API_KEY,
            base_url=settings.SILICONFLOW_BASE_URL
        )
        self.model = settings.SILICONFLOW_MODEL
    
    async def analyze_stream(self, query: str) -> AsyncGenerator[str, None]:
        """
        Stream analysis for general queries (non-stock code format)
        Qwen responds quickly with good streaming
        """
        system_prompt = """You are a professional stock analyst AI. Provide concise, actionable analysis.

Rules:
1. Start directly with analysis - no introductions
2. Maximum 15 lines total
3. Use bullet points with emojis (📈📉✅⚠️🎯📊)
4. One sentence per bullet point
5. Include key metrics when possible (P/E, growth %, etc.)
6. End with a clear verdict or action
7. NO disclaimers or headers"""

        user_prompt = f"Analyze this stock or market topic: {query}"

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=400,
                top_p=0.9,
                frequency_penalty=0.4,
                presence_penalty=0.4
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n❌ AI service temporarily unavailable: {str(e)}"
            yield error_msg
    
    async def analyze_stock(self, symbol: str, quote_data: dict) -> AsyncGenerator[str, None]:
        """
        Analyze specific stock with Qwen
        Fast streaming response with structured output
        """
        price = quote_data.get('price', 0)
        change = quote_data.get('change', 0)
        change_percent = quote_data.get('change_percent', 0)
        
        # 随机选择格式
        format_choice = random.randint(1, 3)
        
        if format_choice == 1:
            prompt = self._format_scorecard(symbol, price, change_percent)
        elif format_choice == 2:
            prompt = self._format_bullets(symbol, price, change_percent)
        else:
            prompt = self._format_technical(symbol, price, change)
        
        system_prompt = """You are a professional stock analyst. Provide concise, structured analysis.

Output format:
- Emoji + Stock symbol + Price (first line)
- AI Score or key metric
- 2-3 strengths with specific data
- 2-3 risks with specific data  
- Technical levels or summary
- Maximum 12 lines total

Use emojis: 📊📈📉✅⚠️🎯📍
Be specific with numbers and percentages.
NO introductions or disclaimers."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=300,
                top_p=0.9,
                frequency_penalty=0.3,
                presence_penalty=0.3
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n❌ AI service unavailable: {str(e)}"
            yield error_msg
    
    def _format_scorecard(self, symbol: str, price: float, change_pct: float) -> str:
        """Format 1: Scorecard with AI rating"""
        direction = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
        return f"""Provide a professional analysis for {symbol} stock at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output format:
📊 {symbol} · ${price:.2f} {direction}

🎯 AI Score: [X]/100

✅ Key Strengths:
• [Specific strength with data/metrics]
• [Another strength]

⚠️ Key Risks:
• [Specific risk with impact]
• [Another risk]

📍 Technical Levels:
Support: $[price] · Resistance: $[price]

Provide real analysis, not placeholders. Be specific with numbers."""

    def _format_bullets(self, symbol: str, price: float, change_pct: float) -> str:
        """Format 2: Bullish/Bearish analysis"""
        direction = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
        return f"""Analyze {symbol} stock currently at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output:
🔍 {symbol} Analysis

📈 Bullish Case:
• [Growth driver with specific numbers]
• [Positive catalyst with timeline]

📉 Bearish Case:
• [Risk factor with potential impact]
• [Concern with data]

🎯 Verdict: [X]/100 - [Buy/Hold/Sell]

Be specific with metrics (P/E, growth rates, revenue numbers). No placeholders."""

    def _format_technical(self, symbol: str, price: float, change: float) -> str:
        """Format 3: Technical analysis focus"""
        direction = "🟢" if change > 0 else "🔴" if change < 0 else "⚪"
        return f"""Technical analysis for {symbol} at ${price:.2f}.

Output:
📊 {symbol} Technical View

┌──────────────────┐
│ Price: ${price:.2f} {direction}
│ Change: {change:+.2f}
│ Score: [X]/100
│ Trend: [Bullish/Bearish/Neutral]
└──────────────────┘

Key Technical Points:
• [Support/resistance level with price]
• [Trend indicator with direction]
• [Volume or momentum signal]

📍 Action:
Entry: $[price] · Target: $[price] · Stop: $[price]

Use actual technical analysis principles. Be specific with levels."""
    
    async def analyze_general(self, stock_name: str, price: float) -> AsyncGenerator[str, None]:
        """
        General analysis for promotional buttons
        Fixed template with quick response
        """
        prompt = f"""Create a brief analysis teaser for {stock_name} at ${price:.2f}.

Output exactly this format:

🔍 {stock_name} · ${price:.2f}

You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report.

Output ONLY this template. Fill in the stock name and price. No extra text."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a stock analyst AI. Output ONLY the exact template provided. NO additional text."},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.3,
                max_tokens=100,
                top_p=0.9
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            # Fallback format if AI fails
            fallback = f"""🔍 {stock_name} · ${price:.2f}

You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report."""
            yield fallback


# Create global instance
ai_service = AIService() if settings.SILICONFLOW_API_KEY else None
