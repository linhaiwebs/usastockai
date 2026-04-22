"""
Public Config API — safe, whitelisted settings for frontend
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.ai_setting import AISetting
from ..core.database import get_db

router = APIRouter(prefix="/api/config", tags=["config"])

# Only these keys are safe to expose publicly
PUBLIC_SETTINGS_KEYS = {
    "fallback_redirect_url",
    "diagnostic_placeholder_text",
}


@router.get("/public")
async def get_public_config(db: AsyncSession = Depends(get_db)):
    """Return only whitelisted public settings (no auth required)"""
    result = await db.execute(
        select(AISetting).where(AISetting.key.in_(PUBLIC_SETTINGS_KEYS))
    )
    settings = result.scalars().all()

    return {
        "settings": [
            {"key": s.key, "value": s.value or ""}
            for s in settings
            if s.key in PUBLIC_SETTINGS_KEYS
        ]
    }
