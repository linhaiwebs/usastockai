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
from ..core.redis import get_redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis

router = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer()

# Admin credentials
ADMIN_USERNAME = "adsadmin"
ADMIN_PASSWORD_HASH = hashlib.sha256("Mm123567..".encode()).hexdigest()

# Token过期时间（秒）
TOKEN_EXPIRY = 86400  # 24小时

class LoginRequest(BaseModel):
    username: str
    password: str

class RedirectCreate(BaseModel):
    name: str
    url: str
    suffix: Optional[str] = None  # 自定义后缀
    weight: float = 1.0
    is_active: bool = True

class RedirectUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    suffix: Optional[str] = None  # 自定义后缀
    weight: Optional[float] = None
    is_active: Optional[bool] = None

class GoogleAnalyticsCreate(BaseModel):
    ads_tracking_id: Optional[str] = None      # Google Ads 转化跟踪 ID
    ga4_property_id: Optional[str] = None      # GA4 媒体资源 ID
    conversion_id: Optional[str] = None        # 完整的转化ID
    is_enabled: bool = True

class GoogleAnalyticsUpdate(BaseModel):
    ads_tracking_id: Optional[str] = None
    ga4_property_id: Optional[str] = None
    conversion_id: Optional[str] = None
    is_enabled: Optional[bool] = None

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    redis_client: redis.Redis = Depends(get_redis)
):
    """Verify admin token from Redis"""
    token = credentials.credentials
    
    # 从Redis获取token数据
    token_key = f"admin_token:{token}"
    token_data = await redis_client.get(token_key)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # 解析token数据 (格式: "username:created_timestamp")
    try:
        username, created_str = token_data.split(":")
        created = float(created_str)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    # 检查token是否过期
    if time.time() - created > TOKEN_EXPIRY:
        # 删除过期token
        await redis_client.delete(token_key)
        raise HTTPException(status_code=401, detail="Token expired")
    
    # 刷新token过期时间（可选，实现"活跃用户保持登录"）
    await redis_client.expire(token_key, TOKEN_EXPIRY)
    
    return {"username": username, "created": created}

@router.post("/login")
async def login(request: LoginRequest, redis_client: redis.Redis = Depends(get_redis)):
    """Admin login"""
    # Verify credentials
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    if request.username != ADMIN_USERNAME or password_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = secrets.token_urlsafe(32)
    token_key = f"admin_token:{token}"
    
    # 存储token到Redis，格式: "username:created_timestamp"
    token_data = f"{request.username}:{time.time()}"
    await redis_client.setex(token_key, TOKEN_EXPIRY, token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": request.username
    }

@router.post("/logout")
async def logout(user: dict = Depends(verify_token), redis_client: redis.Redis = Depends(get_redis)):
    """Admin logout"""
    # 从请求头获取token
    from fastapi import Request
    # 删除所有该用户的token
    pattern = f"admin_token:*"
    async for key in redis_client.scan_iter(match=pattern):
        token_data = await redis_client.get(key)
        if token_data and token_data.startswith(f"{user['username']}:"):
            await redis_client.delete(key)
    
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
                "suffix": r.suffix,  # 添加suffix字段
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
        suffix=data.suffix,  # 添加suffix字段
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
        "suffix": redirect.suffix,  # 添加suffix字段
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
    if data.suffix is not None:
        redirect.suffix = data.suffix
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
        "suffix": redirect.suffix,  # 添加suffix字段
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
                "ads_tracking_id": a.ads_tracking_id,
                "ga4_property_id": a.ga4_property_id,
                "conversion_id": a.conversion_id,
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
    analytics = GoogleAnalytics(
        ads_tracking_id=data.ads_tracking_id,
        ga4_property_id=data.ga4_property_id,
        conversion_id=data.conversion_id,
        is_enabled=data.is_enabled
    )
    
    db.add(analytics)
    await db.commit()
    await db.refresh(analytics)
    
    return {
        "id": analytics.id,
        "ads_tracking_id": analytics.ads_tracking_id,
        "ga4_property_id": analytics.ga4_property_id,
        "conversion_id": analytics.conversion_id,
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
    if data.ads_tracking_id is not None:
        analytics.ads_tracking_id = data.ads_tracking_id
    if data.ga4_property_id is not None:
        analytics.ga4_property_id = data.ga4_property_id
    if data.conversion_id is not None:
        analytics.conversion_id = data.conversion_id
    if data.is_enabled is not None:
        analytics.is_enabled = data.is_enabled
    
    await db.commit()
    await db.refresh(analytics)
    
    return {
        "id": analytics.id,
        "ads_tracking_id": analytics.ads_tracking_id,
        "ga4_property_id": analytics.ga4_property_id,
        "conversion_id": analytics.conversion_id,
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
# =========================================

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
                "ads_tracking_id": a.ads_tracking_id,
                "ga4_property_id": a.ga4_property_id,
                "conversion_id": a.conversion_id
            }
            for a in analytics
        ]
    }

