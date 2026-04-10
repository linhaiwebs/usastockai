"""
Admin API Endpoints - Redirect Link Management and Google Analytics
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import hashlib
import secrets
import time
from ..models.redirect import RedirectLink
from ..models.google_analytics import GoogleAnalytics
from ..core.database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer()

# Simple token storage (in production, use Redis or database)
active_tokens = {}

# Admin credentials
ADMIN_USERNAME = "adsadmin"
ADMIN_PASSWORD_HASH = hashlib.sha256("Mm123567..".encode()).hexdigest()

class LoginRequest(BaseModel):
    username: str
    password: str

class RedirectCreate(BaseModel):
    name: str
    url: str
    weight: float = 1.0
    is_active: bool = True

class RedirectUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    weight: Optional[float] = None
    is_active: Optional[bool] = None

class GoogleAnalyticsCreate(BaseModel):
    tracking_id: str
    conversion_label: Optional[str] = None
    is_enabled: bool = True

class GoogleAnalyticsUpdate(BaseModel):
    tracking_id: Optional[str] = None
    conversion_label: Optional[str] = None
    is_enabled: Optional[bool] = None

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin token"""
    token = credentials.credentials
    if token not in active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Check if token is expired (24 hours)
    token_data = active_tokens[token]
    if time.time() - token_data["created"] > 86400:
        del active_tokens[token]
        raise HTTPException(status_code=401, detail="Token expired")
    
    return token_data

@router.post("/login")
async def login(request: LoginRequest):
    """Admin login"""
    # Verify credentials
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    if request.username != ADMIN_USERNAME or password_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = secrets.token_urlsafe(32)
    active_tokens[token] = {
        "username": request.username,
        "created": time.time()
    }
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": request.username
    }

@router.post("/logout")
async def logout(user: dict = Depends(verify_token)):
    """Admin logout"""
    # Remove token (find by username)
    tokens_to_remove = [t for t, data in active_tokens.items() if data["username"] == user["username"]]
    for token in tokens_to_remove:
        del active_tokens[token]
    
    return {"message": "Logged out successfully"}

@router.get("/redirects")
async def list_redirects(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """List all redirect links"""
    result = await db.execute(select(RedirectLink))
    redirects = result.scalars().all()
    
    return {
        "redirects": [
            {
                "id": r.id,
                "name": r.name,
                "url": r.url,
                "weight": r.weight,
                "is_active": r.is_active,
                "click_count": r.click_count,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in redirects
        ]
    }

@router.post("/redirects")
async def create_redirect(
    data: RedirectCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Create a new redirect link"""
    redirect = RedirectLink(
        name=data.name,
        url=data.url,
        weight=data.weight,
        is_active=data.is_active
    )
    
    db.add(redirect)
    await db.commit()
    await db.refresh(redirect)
    
    return {
        "id": redirect.id,
        "name": redirect.name,
        "url": redirect.url,
        "weight": redirect.weight,
        "is_active": redirect.is_active,
        "click_count": redirect.click_count,
        "created_at": redirect.created_at.isoformat() if redirect.created_at else None
    }

@router.put("/redirects/{redirect_id}")
async def update_redirect(
    redirect_id: int,
    data: RedirectUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Update a redirect link"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == redirect_id)
    )
    redirect = result.scalar_one_or_none()
    
    if not redirect:
        raise HTTPException(status_code=404, detail="Redirect not found")
    
    # Update fields
    if data.name is not None:
        redirect.name = data.name
    if data.url is not None:
        redirect.url = data.url
    if data.weight is not None:
        redirect.weight = data.weight
    if data.is_active is not None:
        redirect.is_active = data.is_active
    
    await db.commit()
    await db.refresh(redirect)
    
    return {
        "id": redirect.id,
        "name": redirect.name,
        "url": redirect.url,
        "weight": redirect.weight,
        "is_active": redirect.is_active,
        "click_count": redirect.click_count,
        "created_at": redirect.created_at.isoformat() if redirect.created_at else None
    }

@router.delete("/redirects/{redirect_id}")
async def delete_redirect(
    redirect_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Delete a redirect link"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == redirect_id)
    )
    redirect = result.scalar_one_or_none()
    
    if not redirect:
        raise HTTPException(status_code=404, detail="Redirect not found")
    
    await db.delete(redirect)
    await db.commit()
    
    return {"message": "Redirect deleted successfully"}

@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Get overall statistics"""
    result = await db.execute(select(RedirectLink))
    redirects = result.scalars().all()
    
    total_clicks = sum(r.click_count for r in redirects)
    active_count = sum(1 for r in redirects if r.is_active)
    
    return {
        "total_redirects": len(redirects),
        "active_redirects": active_count,
        "total_clicks": total_clicks
    }

# ==========================================
# Google Analytics Management
# ==========================================

@router.get("/google-analytics")
async def list_google_analytics(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """List all Google Analytics configurations"""
    result = await db.execute(select(GoogleAnalytics))
    analytics = result.scalars().all()
    
    return {
        "analytics": [
            {
                "id": a.id,
                "tracking_id": a.tracking_id,
                "conversion_label": a.conversion_label,
                "is_enabled": a.is_enabled,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "updated_at": a.updated_at.isoformat() if a.updated_at else None
            }
            for a in analytics
        ]
    }

@router.post("/google-analytics")
async def create_google_analytics(
    data: GoogleAnalyticsCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Create a new Google Analytics configuration"""
    # Check if tracking_id already exists
    result = await db.execute(
        select(GoogleAnalytics).where(GoogleAnalytics.tracking_id == data.tracking_id)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Tracking ID already exists")
    
    analytics = GoogleAnalytics(
        tracking_id=data.tracking_id,
        conversion_label=data.conversion_label,
        is_enabled=data.is_enabled
    )
    
    db.add(analytics)
    await db.commit()
    await db.refresh(analytics)
    
    return {
        "id": analytics.id,
        "tracking_id": analytics.tracking_id,
        "conversion_label": analytics.conversion_label,
        "is_enabled": analytics.is_enabled,
        "created_at": analytics.created_at.isoformat() if analytics.created_at else None
    }

@router.put("/google-analytics/{analytics_id}")
async def update_google_analytics(
    analytics_id: int,
    data: GoogleAnalyticsUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Update a Google Analytics configuration"""
    result = await db.execute(
        select(GoogleAnalytics).where(GoogleAnalytics.id == analytics_id)
    )
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="Google Analytics configuration not found")
    
    # Update fields
    if data.tracking_id is not None:
        # Check if new tracking_id already exists
        existing_result = await db.execute(
            select(GoogleAnalytics).where(
                GoogleAnalytics.tracking_id == data.tracking_id,
                GoogleAnalytics.id != analytics_id
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Tracking ID already exists")
        analytics.tracking_id = data.tracking_id
    
    if data.conversion_label is not None:
        analytics.conversion_label = data.conversion_label
    
    if data.is_enabled is not None:
        analytics.is_enabled = data.is_enabled
    
    await db.commit()
    await db.refresh(analytics)
    
    return {
        "id": analytics.id,
        "tracking_id": analytics.tracking_id,
        "conversion_label": analytics.conversion_label,
        "is_enabled": analytics.is_enabled,
        "created_at": analytics.created_at.isoformat() if analytics.created_at else None
    }

@router.delete("/google-analytics/{analytics_id}")
async def delete_google_analytics(
    analytics_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(verify_token)
):
    """Delete a Google Analytics configuration"""
    result = await db.execute(
        select(GoogleAnalytics).where(GoogleAnalytics.id == analytics_id)
    )
    analytics = result.scalar_one_or_none()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="Google Analytics configuration not found")
    
    await db.delete(analytics)
    await db.commit()
    
    return {"message": "Google Analytics configuration deleted successfully"}

# ==========================================
# Public API for Google Analytics (No Auth Required)
# ==========================================

@router.get("/public/google-analytics")
async def get_public_google_analytics(
    db: AsyncSession = Depends(get_db)
):
    """Get enabled Google Analytics configurations (public endpoint)"""
    result = await db.execute(
        select(GoogleAnalytics).where(GoogleAnalytics.is_enabled == True)
    )
    analytics = result.scalars().all()
    
    return {
        "analytics": [
            {
                "tracking_id": a.tracking_id,
                "conversion_label": a.conversion_label
            }
            for a in analytics
        ]
    }

