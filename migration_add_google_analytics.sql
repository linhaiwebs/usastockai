-- 迁移脚本：添加谷歌统计表和更新redirect_links表
-- 执行时间：2024-04-10

-- 1. 更新redirect_links表（如果需要）
-- 添加name列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='redirect_links' AND column_name='name') THEN
        ALTER TABLE redirect_links ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- 添加is_active列（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='redirect_links' AND column_name='is_active') THEN
        ALTER TABLE redirect_links ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 重命名call_count为click_count（如果需要）
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='redirect_links' AND column_name='call_count') THEN
        ALTER TABLE redirect_links RENAME COLUMN call_count TO click_count;
    END IF;
END $$;

-- 2. 创建谷歌统计配置表（如果不存在）
CREATE TABLE IF NOT EXISTS google_analytics (
    id SERIAL PRIMARY KEY,
    tracking_id VARCHAR(100) NOT NULL UNIQUE,
    conversion_label VARCHAR(100),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建启用状态索引
CREATE INDEX IF NOT EXISTS idx_is_enabled ON google_analytics(is_enabled);

-- 3. 插入示例数据（可选）
-- INSERT INTO google_analytics (tracking_id, conversion_label, is_enabled) VALUES
--     ('AW-17303658824', 'KrXGCNHaoZQcEMjCg7tA', true),
--     ('G-BDPP2WPMQR', null, true);
