"""
AI Analysis Service - Optimized for Speed and User Experience
Uses structured prompts to reduce DeepSeek R1 thinking time
"""
import random
from typing import AsyncGenerator
from openai import AsyncOpenAI
from ..core.config import get_settings

settings = get_settings()


class AIService:
    """AI Analysis Service - Optimized"""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.SILICONFLOW_API_KEY,
            base_url=settings.SILICONFLOW_BASE_URL
        )
        self.model = settings.SILICONFLOW_MODEL
    
    async def analyze_stream(self, query: str) -> AsyncGenerator[str, None]:
        """
        Stream analysis for general queries (non-stock code format)
        Optimized for quick response
        """
        system_prompt = """You are a concise stock analyst AI. Rules:
1. Start immediately with analysis, NO introduction
2. Maximum 15 lines
3. Use bullet points with emojis
4. One sentence per point
5. NO disclaimers or headers"""

        user_prompt = f"Analyze: {query}"

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
                temperature=0.3,
                max_tokens=400,
                top_p=0.9,
                frequency_penalty=0.5,
                presence_penalty=0.5
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
        Analyze specific stock - Optimized for quick response
        Uses simplified prompts to reduce thinking time
        """
        price = quote_data.get('price', 0)
        change = quote_data.get('change', 0)
        change_percent = quote_data.get('change_percent', 0)
        
        # 选择随机格式（简化版）
        format_choice = random.randint(1, 3)
        
        if format_choice == 1:
            prompt = self._format_scorecard(symbol, price, change_percent)
        elif format_choice == 2:
            prompt = self._format_bullets(symbol, price, change_percent)
        else:
            prompt = self._format_technical(symbol, price, change)
        
        system_prompt = """You are a stock analyst AI. Output ONLY the analysis, no introductions.
Use this exact structure:
- Emoji + Stock name + Price (first line)
- AI Score or key metric
- 2-3 bullet points for positives
- 2-3 bullet points for risks
- Technical levels or summary
Maximum 12 lines. NO disclaimers. Start immediately."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.01,
                max_tokens=250,
                top_p=0.9,
                frequency_penalty=0.6,
                presence_penalty=0.6
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content
            
        except Exception as e:
            error_msg = f"\n\n❌ AI service unavailable: {str(e)}"
            yield error_msg
    
    def _format_scorecard(self, symbol: str, price: float, change_pct: float) -> str:
        """Format 1: Scorecard style"""
        direction = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
        return f"""Analyze {symbol} at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output in this format:
[{symbol}] · ${price:.2f}

📊 AI Score: [N]/100

✅ Strengths:
• [Point 1]
• [Point 2]

⚠️ Risks:
• [Point 1]
• [Point 2]

📍 Technical:
Support $[N] · Resistance $[N]

Start immediately. NO introduction."""
    
    def _format_bullets(self, symbol: str, price: float, change_pct: float) -> str:
        """Format 2: Bullet style"""
        direction = "📈" if change_pct > 0 else "📉" if change_pct < 0 else "➡️"
        return f"""Analyze {symbol} at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output:
🔍 {symbol} Analysis

📈 Bullish:
• [Key strength 1]
• [Key strength 2]

📉 Bearish:
• [Key risk 1]
• [Key risk 2]

🎯 Verdict: [N]/100 - [Action]

Start immediately. NO introduction."""
    
    def _format_technical(self, symbol: str, price: float, change: float) -> str:
        """Format 3: Technical style"""
        direction = "🟢" if change > 0 else "🔴" if change < 0 else "⚪"
        return f"""Analyze {symbol} at ${price:.2f}.

Output:
📊 {symbol} Diagnostic

┌──────────────┐
│ Price: ${price:.2f} {direction}
│ Score: [N]/100
│ Trend: [Bullish/Bearish]
└──────────────┘

Key Points:
• [Point 1]
• [Point 2]
• [Point 3]

📍 Levels:
Support $[N] · Resistance $[N]

Start immediately. NO introduction."""
    
    async def analyze_general(self, stock_name: str, price: float) -> AsyncGenerator[str, None]:
        """
        Non-input box general analysis (Meet Your AI Agent Team button)
        Fixed format output with fallback
        """
        prompt = f"""Output this exact template for {stock_name} at ${price:.2f}:

🔍 {stock_name} · ${price:.2f}

You see: Stock price movements, news noise.

AI sees: Institutional money flow, chip concentration, key support/resistance levels.

👉 Where's the gap? Click WhatsApp, send the code, get your AI perspective report.

CRITICAL: Output ONLY the template above. NO extra text."""

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a stock analyst AI. Output ONLY the exact template. NO additional text."},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.01,
                max_tokens=80,
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
