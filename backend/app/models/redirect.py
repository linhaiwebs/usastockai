from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from ..core.database import Base


class RedirectLink(Base):
    """分流链接模型"""
    __tablename__ = "redirect_links"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    url = Column(String(2048), nullable=False)
    suffix = Column(Text, nullable=True)  # 自定义后缀，用于拼接在URL后面
    click_count = Column(Integer, default=0)
    weight = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

