"""
AI Analysis Service - Optimized for Qwen 2.5 (Fast Response)
Prompt templates loaded from DB with hot reload support
"""
import random
from typing import AsyncGenerator, Dict
from openai import AsyncOpenAI
from ..core.config import get_settings
from ..core.database import async_session
from ..models.ai_setting import AISetting
from sqlalchemy import select

settings = get_settings()

# In-memory cache for AI settings (hot-reloaded from DB)
_settings_cache: Dict[str, str] = {}
_settings_cache_loaded = False


async def _load_settings() -> Dict[str, str]:
    """Load AI settings from DB into memory cache"""
    global _settings_cache, _settings_cache_loaded
    try:
        async with async_session() as session:
            result = await session.execute(select(AISetting))
            rows = result.scalars().all()
            _settings_cache = {r.key: (r.value or "") for r in rows}
            _settings_cache_loaded = True
    except Exception as e:
        print(f"[AI Settings] Failed to load from DB: {e}")
        if not _settings_cache_loaded:
            _settings_cache = {}
    return _settings_cache


async def _get_setting(key: str, default: str = "") -> str:
    """Get a setting value, loading from DB if not cached"""
    global _settings_cache_loaded
    if not _settings_cache_loaded:
        await _load_settings()
    return _settings_cache.get(key, default)


def invalidate_settings_cache():
    """Invalidate settings cache so next request reloads from DB"""
    global _settings_cache_loaded
    _settings_cache_loaded = False


# Default prompt fallbacks
DEFAULT_STREAMING_SYSTEM = (
    "You are a professional stock analyst AI. Provide concise, actionable analysis.\n\n"
    "Rules:\n"
    "1. Start directly with analysis - no introductions\n"
    "2. Maximum 15 lines total\n"
    "3. Use bullet points with emojis\n"
    "4. One sentence per bullet point\n"
    "5. Include key metrics when possible (P/E, growth %, etc.)\n"
    "6. End with a clear verdict or action\n"
    "7. NO disclaimers or headers"
)

DEFAULT_STREAMING_USER = "Analyze this stock or market topic: {query}"

DEFAULT_STOCK_SYSTEM = (
    "You are a professional stock analyst. Provide concise, structured analysis in plain text.\n\n"
    "Rules:\n"
    "1. Use emojis for visual structure\n"
    "2. Include specific numbers, percentages, and price levels\n"
    "3. Keep it under 15 lines\n"
    "4. No introductions, disclaimers, or filler words\n"
    "5. Output real analysis, not templates or placeholders"
)

DEFAULT_FORMAT_1 = (
    "Analyze {symbol} stock at ${price} ({direction} {change_pct}%).\n\n"
    "Output this format:\n"
    "🔍 {symbol} at ${price} {direction}\n\n"
    "AI Score: X/100\n\n"
    "✅ Key Strengths:\n"
    "- First strength with specific metric\n"
    "- Second strength with data\n\n"
    "⚠️ Key Risks:\n"
    "- First risk with impact\n"
    "- Second risk with data\n\n"
    "📊 Support: $price | Resistance: $price\n"
)

DEFAULT_FORMAT_2 = (
    "Analyze {symbol} stock at ${price} ({direction} {change_pct}%).\n\n"
    "Output this format:\n"
    "🔍 {symbol} Analysis\n\n"
    "🚀 Price: ${price} ({direction} {change_pct}%)\n\n"
    "📈 Bullish Case:\n"
    "- Growth driver with specific numbers\n"
    "- Positive catalyst with timeline\n\n"
    "📉 Bearish Case:\n"
    "- Risk factor with potential impact\n"
    "- Concern with supporting data\n\n"
    "🎯 Verdict: X/100 - Buy/Hold/Sell\n"
)

DEFAULT_FORMAT_3 = (
    "Technical analysis for {symbol} at ${price} ({emoji} {change}%).\n\n"
    "Output this format:\n"
    "📊 {symbol} Technical View\n\n"
    "Price: ${price} {emoji}\n"
    "Change: {change}%\n"
    "Score: X/100\n"
    "Trend: Bullish/Bearish/Neutral\n\n"
    "🔑 Key Levels:\n"
    "- Support and resistance prices\n"
    "- Trend direction and strength\n"
    "- Volume or momentum signal\n\n"
    "💡 Action: Entry $ | Target $ | Stop $\n"
)

DEFAULT_DIAGNOSTIC_PLACEHOLDER = (
    "> INITIATING AI STOCK DIAGNOSIS...\n"
    "SCANNING MARKET DATA [Multi-Source]\n"
    "> Pattern correlation found: 0.984 confidence.\n"
    "> CALCULATING TREND VECTORS...\n"
    "Trend Alpha: +4.2% [Confirmed]\n"
    "> VOLUME ANALYSIS HEATMAP GENERATED.\n"
    "Key resistance detected at $235.10.\n"
    "System note: Volatility levels rising.\n"
    "DIAGNOSIS SCORE: 94.2% Bullish bias."
)

DEFAULT_FALLBACK_URL = "https://wa.me/1234567890"


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
        Uses DB-stored prompts with hot reload
        """
        system_prompt = await _get_setting("streaming_system_prompt", DEFAULT_STREAMING_SYSTEM)
        user_template = await _get_setting("streaming_user_prompt", DEFAULT_STREAMING_USER)
        user_prompt = user_template.replace("{query}", query)

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=600,
                top_p=0.9,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            error_msg = f"\n\n❌ AI service temporarily unavailable: {str(e)}"
            yield error_msg

    async def analyze_stock(self, symbol: str, quote_data: dict) -> AsyncGenerator[str, None]:
        """
        Analyze specific stock with Qwen
        Uses DB-stored prompt templates with hot reload
        """
        price = quote_data.get('price', 0)
        change = quote_data.get('change', 0)
        change_percent = quote_data.get('change_percent', 0)

        # Build template variables
        direction = "📈" if change_percent > 0 else "📉" if change_percent < 0 else "➡️"
        emoji = "🟢" if change > 0 else "🔴" if change < 0 else "⚪"
        template_vars = {
            "symbol": symbol,
            "price": f"{price:.2f}",
            "direction": direction,
            "change_pct": f"{change_percent:+.2f}",
            "change": f"{change:+.2f}",
            "emoji": emoji,
        }

        # Randomly select a format
        format_choice = random.randint(1, 3)
        format_key = f"stock_prompt_format_{format_choice}"
        defaults = {1: DEFAULT_FORMAT_1, 2: DEFAULT_FORMAT_2, 3: DEFAULT_FORMAT_3}
        prompt_template = await _get_setting(format_key, defaults[format_choice])

        # Apply template variables
        prompt = prompt_template
        for k, v in template_vars.items():
            prompt = prompt.replace("{" + k + "}", v)

        system_prompt = await _get_setting("stock_system_prompt", DEFAULT_STOCK_SYSTEM)

        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=600,
                top_p=0.9,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            error_msg = f"\n\n❌ AI service unavailable: {str(e)}"
            yield error_msg


# Create global instance
ai_service = AIService() if settings.SILICONFLOW_API_KEY else None
