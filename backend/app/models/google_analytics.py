from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from ..core.database import Base


class GoogleAnalytics(Base):
    """谷歌统计配置模型"""
    __tablename__ = "google_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    # Google Ads 转化跟踪 ID (如: AW-17303658824)
    ads_tracking_id = Column(String(100), nullable=True)
    # GA4 媒体资源 ID (如: G-BDPP2WPMQR)
    ga4_property_id = Column(String(100), nullable=True)
    # 完整的转化ID (如: AW-17303658824/KrXGCNHaoZQcEMjCg7tA)
    conversion_id = Column(String(200), nullable=True)
    # 是否启用
    is_enabled = Column(Boolean, default=True)
    # 创建和更新时间
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
