-- 迁移脚本：重新设计谷歌统计表结构
-- 执行时间：2024-04-10

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS google_analytics CASCADE;

-- 2. 创建新的谷歌统计配置表
CREATE TABLE google_analytics (
    id SERIAL PRIMARY KEY,
    ads_tracking_id VARCHAR(100),              -- Google Ads 转化跟踪 ID (如: AW-17303658824)
    ga4_property_id VARCHAR(100),              -- GA4 媒体资源 ID (如: G-BDPP2WPMQR)
    conversion_id VARCHAR(200),                -- 完整的转化ID (如: AW-17303658824/KrXGCNHaoZQcEMjCg7tA)
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 创建索引
CREATE INDEX idx_ga_is_enabled ON google_analytics(is_enabled);

-- 4. 插入示例配置（可选）
-- INSERT INTO google_analytics (ads_tracking_id, ga4_property_id, conversion_id, is_enabled)
-- VALUES ('AW-17303658824', 'G-BDPP2WPMQR', 'AW-17303658824/KrXGCNHaoZQcEMjCg7tA', true);
