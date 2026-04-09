-- 股票AI诊断系统数据库初始化

-- 分流链接表
CREATE TABLE IF NOT EXISTS redirect_links (
    id SERIAL PRIMARY KEY,
    url VARCHAR(2048) NOT NULL,
    call_count INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建权重索引
CREATE INDEX idx_weight ON redirect_links(weight);

-- 插入示例数据
INSERT INTO redirect_links (url, weight) VALUES 
    ('https://example.com/broker1', 3),
    ('https://example.com/broker2', 2),
    ('https://example.com/broker3', 1);
