from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..core.database import Base


class RedirectLink(Base):
    """分流链接模型"""
    __tablename__ = "redirect_links"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(2048), nullable=False)
    call_count = Column(Integer, default=0)
    weight = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
