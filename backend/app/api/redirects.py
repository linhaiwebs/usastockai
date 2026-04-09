"""
分流链接管理 API
"""
import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, HttpUrl
from ..core.database import get_db
from ..models.redirect import RedirectLink

router = APIRouter(prefix="/api/redirects", tags=["redirects"])


# Pydantic 模型
class RedirectCreate(BaseModel):
    url: str
    weight: int = 1


class RedirectUpdate(BaseModel):
    url: str | None = None
    weight: int | None = None


class RedirectResponse(BaseModel):
    id: int
    url: str
    call_count: int
    weight: int
    
    class Config:
        from_attributes = True


@router.get("", response_model=List[RedirectResponse])
async def get_all_redirects(db: AsyncSession = Depends(get_db)):
    """获取所有分流链接"""
    result = await db.execute(select(RedirectLink))
    links = result.scalars().all()
    return links


@router.post("", response_model=RedirectResponse)
async def create_redirect(data: RedirectCreate, db: AsyncSession = Depends(get_db)):
    """创建新的分流链接"""
    link = RedirectLink(url=data.url, weight=data.weight)
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.get("/assign")
async def assign_redirect(db: AsyncSession = Depends(get_db)):
    """按权重分配链接"""
    result = await db.execute(select(RedirectLink))
    links = result.scalars().all()
    
    if not links:
        raise HTTPException(status_code=404, detail="No redirect links available")
    
    # 加权随机选择
    total_weight = sum(link.weight for link in links)
    random_val = random.uniform(0, total_weight)
    cumulative = 0
    
    selected_link = links[0]
    for link in links:
        cumulative += link.weight
        if random_val <= cumulative:
            selected_link = link
            break
    
    return {
        "id": selected_link.id,
        "url": selected_link.url,
        "weight": selected_link.weight
    }


@router.get("/{link_id}", response_model=RedirectResponse)
async def get_redirect(link_id: int, db: AsyncSession = Depends(get_db)):
    """获取单个链接"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == link_id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Redirect link not found")
    
    return link


@router.get("/{link_id}/info")
async def get_redirect_info(link_id: int, db: AsyncSession = Depends(get_db)):
    """获取链接信息 (用于中间页显示)"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == link_id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Redirect link not found")
    
    return {
        "id": link.id,
        "url": link.url,
        "call_count": link.call_count
    }


@router.post("/{link_id}/click")
async def record_click(link_id: int, db: AsyncSession = Depends(get_db)):
    """记录点击并返回跳转URL"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == link_id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Redirect link not found")
    
    # 增加计数
    link.call_count += 1
    await db.commit()
    
    return {
        "success": True,
        "url": link.url,
        "call_count": link.call_count
    }


@router.put("/{link_id}", response_model=RedirectResponse)
async def update_redirect(
    link_id: int,
    data: RedirectUpdate,
    db: AsyncSession = Depends(get_db)
):
    """更新链接"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == link_id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Redirect link not found")
    
    if data.url is not None:
        link.url = data.url
    if data.weight is not None:
        link.weight = data.weight
    
    await db.commit()
    await db.refresh(link)
    return link


@router.delete("/{link_id}")
async def delete_redirect(link_id: int, db: AsyncSession = Depends(get_db)):
    """删除链接"""
    result = await db.execute(
        select(RedirectLink).where(RedirectLink.id == link_id)
    )
    link = result.scalar_one_or_none()
    
    if not link:
        raise HTTPException(status_code=404, detail="Redirect link not found")
    
    await db.delete(link)
    await db.commit()
    
    return {"success": True, "message": "Redirect link deleted"}
