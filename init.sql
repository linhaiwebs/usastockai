-- 股票AI诊断系统数据库初始化

-- 分流链接表
CREATE TABLE IF NOT EXISTS redirect_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(2048) NOT NULL,
    suffix TEXT,                                          -- 自定义后缀，用于拼接在URL后面
    click_count INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建权重索引
CREATE INDEX IF NOT EXISTS idx_weight ON redirect_links(weight);

-- 仅在表为空时插入示例数据（避免覆盖已有数据）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM redirect_links LIMIT 1) THEN
        INSERT INTO redirect_links (url, weight) VALUES 
            ('https://example.com/broker1', 3),
            ('https://example.com/broker2', 2),
            ('https://example.com/broker3', 1);
    END IF;
END $$;

-- 谷歌统计配置表
CREATE TABLE IF NOT EXISTS google_analytics (
    id SERIAL PRIMARY KEY,
    ads_tracking_id VARCHAR(100),              -- Google Ads 转化跟踪 ID (如: AW-17303658824)
    ga4_property_id VARCHAR(100),              -- GA4 媒体资源 ID (如: G-BDPP2WPMQR)
    conversion_id VARCHAR(200),                -- 完整的转化ID (如: AW-17303658824/KrXGCNHaoZQcEMjCg7tA)
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建启用状态索引
CREATE INDEX IF NOT EXISTS idx_is_enabled ON google_analytics(is_enabled);
