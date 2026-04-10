-- 添加 suffix 字段到 redirect_links 表
-- 执行时间：2026-04-10
-- 说明：支持分流链接自定义后缀功能

-- 添加 suffix 字段
ALTER TABLE redirect_links 
ADD COLUMN IF NOT EXISTS suffix TEXT;

-- 添加注释
COMMENT ON COLUMN redirect_links.suffix IS '自定义后缀，用于拼接在URL后面';

-- 示例数据更新（可选）
-- UPDATE redirect_links 
-- SET suffix = '我是自定义后缀文案' 
-- WHERE url LIKE 'https://wa.me/%' AND suffix IS NULL;
