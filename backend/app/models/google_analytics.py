from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from ..core.database import Base


class GoogleAnalytics(Base):
    """谷歌统计配置模型"""
    __tablename__ = "google_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(100), nullable=False, unique=True)  # 如：AW-17303658824, G-BDPP2WPMQR
    conversion_label = Column(String(100), nullable=True)  # 转化标签：如 KrXGCNHaoZQcEMjCg7tA
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
