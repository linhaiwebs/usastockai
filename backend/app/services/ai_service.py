"""
AI Analysis Service - Diagnostic Placeholder Text Output
All analysis output comes from DB-stored diagnostic_placeholder_text
"""
from typing import AsyncGenerator, Dict
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
    "You are a professional stock analyst AI. Provide concise, structured analysis.\n\n"
    "Rules:\n"
    "1. Start directly with analysis - no introductions\n"
    "2. Maximum 15 lines total\n"
    "3. Use bullet points with emojis\n"
    "4. One sentence per bullet point\n"
    "5. Include key metrics when possible (P/E, growth %, etc.)\n"
    "6. End with an overall assessment\n"
    "7. NO disclaimers or headers"
)

DEFAULT_STREAMING_USER = "Analyze this stock or market topic: {query}"

DEFAULT_STOCK_SYSTEM = (
    "You are a professional stock analyst. Provide concise, structured analysis in plain text.\n\n"
    "Rules:\n"
    "1. Use emojis for visual structure\n"
    "2. Include key metrics and recent data points\n"
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
    "📈 Positive Case:\n"
    "- Growth driver with specific numbers\n"
    "- Positive catalyst with timeline\n\n"
    "📉 Negative Case:\n"
    "- Risk factor with potential impact\n"
    "- Concern with supporting data\n\n"
    "🎯 Verdict: X/100 - Positive/Mixed/Negative\n"
)

DEFAULT_FORMAT_3 = (
    "Technical analysis for {symbol} at ${price} ({emoji} {change}%).\n\n"
    "Output this format:\n"
    "📊 {symbol} Technical View\n\n"
    "Price: ${price} {emoji}\n"
    "Change: {change}%\n"
    "Score: X/100\n"
    "Trend: Upward/Downward/Neutral\n\n"
    "🔑 Key Levels:\n"
    "- Support and resistance prices\n"
    "- Trend direction and strength\n"
    "- Volume or momentum signal\n\n"
    "💡 Key Levels: Support $ | Resistance $ | Watch $\n"
)

DEFAULT_DIAGNOSTIC_PLACEHOLDER = (
    "> INITIATING AI STOCK DIAGNOSIS...\n"
    "SCANNING MARKET DATA [Multi-Source]\n"
    "> Pattern correlation found: 0.984 correlation.\n"
    "> CALCULATING TREND VECTORS...\n"
    "Trend Alpha: +4.2% [Detected]\n"
    "> VOLUME ANALYSIS HEATMAP GENERATED.\n"
    "Key resistance detected at $235.10.\n"
    "System note: Volatility levels rising.\n"
    "DIAGNOSIS SCORE: 94.2% Positive sentiment."
)

DEFAULT_FALLBACK_URL = "https://wa.me/1234567890"


async def _stream_placeholder_text() -> AsyncGenerator[str, None]:
    """Stream diagnostic_placeholder_text from DB settings, simulating SSE output."""
    placeholder = await _get_setting("diagnostic_placeholder_text", DEFAULT_DIAGNOSTIC_PLACEHOLDER)
    # Stream line by line to simulate real AI output
    lines = placeholder.split('\n')
    for i, line in enumerate(lines):
        yield line
        if i < len(lines) - 1:
            yield '\n'


class AIService:
    """AI Analysis Service - Outputs diagnostic_placeholder_text via SSE"""

    async def analyze_stream(self, query: str) -> AsyncGenerator[str, None]:
        """
        Stream diagnostic placeholder text for general queries.
        Output comes from DB-stored diagnostic_placeholder_text.
        """
        async for chunk in _stream_placeholder_text():
            yield chunk

    async def analyze_stock(self, symbol: str, quote_data: dict) -> AsyncGenerator[str, None]:
        """
        Stream diagnostic placeholder text for stock analysis.
        Output comes from DB-stored diagnostic_placeholder_text.
        """
        async for chunk in _stream_placeholder_text():
            yield chunk


# Create global instance (always available, no AI API key required)
ai_service = AIService()
