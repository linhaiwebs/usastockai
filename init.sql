-- Stock AI Diagnostic System - Database Initialization

-- Redirect Links Table
CREATE TABLE IF NOT EXISTS redirect_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(2048) NOT NULL,
    suffix TEXT,
    click_count INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_redirect_links_weight ON redirect_links(weight);

-- Google Analytics Configuration Table
CREATE TABLE IF NOT EXISTS google_analytics (
    id SERIAL PRIMARY KEY,
    ads_tracking_id VARCHAR(100),
    ga4_property_id VARCHAR(100),
    conversion_id VARCHAR(200),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_google_analytics_is_enabled ON google_analytics(is_enabled);

-- AI Settings Table (prompt templates for AI analysis)
CREATE TABLE IF NOT EXISTS ai_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_settings_key ON ai_settings(key);

-- Default AI Settings
INSERT INTO ai_settings (key, value, description) VALUES
('streaming_system_prompt', 'You are a professional stock analyst AI. Provide concise, actionable analysis in plain text.

Rules:
1. Start directly with analysis - no introductions
2. Maximum 15 lines total
3. Use bullet points with emojis
4. One sentence per bullet point
5. Include key metrics when possible (P/E, growth %, etc.)
6. End with a clear verdict or action
7. NO disclaimers or headers
8. Output real analysis, not templates or placeholders', '流媒体AI分析 - 系统提示词'),

('streaming_user_prompt', 'Analyze this stock or market topic: {query}', '流媒体AI分析 - 用户提示词模板 (变量: {query})'),

('stock_system_prompt', 'You are a professional stock analyst. Provide concise, structured analysis in plain text.

Rules:
1. Use emojis for visual structure
2. Include specific numbers, percentages, and price levels
3. Keep it under 15 lines
4. No introductions, disclaimers, or filler words
5. Output real analysis, not templates or placeholders', '股票诊断 - 系统提示词'),

('stock_prompt_format_1', 'Analyze {symbol} stock at ${price} ({direction} {change_pct}%).

Output this format:
🔍 {symbol} at ${price} {direction}

AI Score: X/100

✅ Key Strengths:
- First strength with specific metric
- Second strength with data

⚠️ Key Risks:
- First risk with impact
- Second risk with data

📊 Support: $price | Resistance: $price', '股票诊断格式1 - 记分卡 (变量: {symbol}, {price}, {direction}, {change_pct})'),

('stock_prompt_format_2', 'Analyze {symbol} stock at ${price} ({direction} {change_pct}%).

Output this format:
🔍 {symbol} Analysis

🚀 Price: ${price} ({direction} {change_pct}%)

📈 Bullish Case:
- Growth driver with specific numbers
- Positive catalyst with timeline

📉 Bearish Case:
- Risk factor with potential impact
- Concern with supporting data

🎯 Verdict: X/100 - Buy/Hold/Sell', '股票诊断格式2 - 多空分析 (变量: {symbol}, {price}, {direction}, {change_pct})'),

('stock_prompt_format_3', 'Technical analysis for {symbol} at ${price} ({emoji} {change}%).

Output this format:
📊 {symbol} Technical View

Price: ${price} {emoji}
Change: {change}%
Score: X/100
Trend: Bullish/Bearish/Neutral

🔑 Key Levels:
- Support and resistance prices
- Trend direction and strength
- Volume or momentum signal

💡 Action: Entry $ | Target $ | Stop $', '股票诊断格式3 - 技术分析 (变量: {symbol}, {price}, {emoji}, {change})'),

('fallback_redirect_url', 'https://wa.me/1234567890', '转化按钮静态跳转URL - 当分流链接接口无可用链接时使用此URL作为后备'),

('diagnostic_placeholder_text', '> INITIATING AI STOCK DIAGNOSIS...
SCANNING MARKET DATA [Multi-Source]
> Pattern correlation found: 0.984 confidence.
> CALCULATING TREND VECTORS...
Trend Alpha: +4.2% [Confirmed]
> VOLUME ANALYSIS HEATMAP GENERATED.
Key resistance detected at $235.10.
System note: Volatility levels rising.
DIAGNOSIS SCORE: 94.2% Bullish bias.', '诊断弹窗占位文本 - AI流未开始时显示的静态文案，可自定义');

