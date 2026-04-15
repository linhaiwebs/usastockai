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
('streaming_system_prompt', 'You are a professional stock analyst AI. Provide concise, actionable analysis.

Rules:
1. Start directly with analysis - no introductions
2. Maximum 15 lines total
3. Use bullet points with emojis (📈📉✅⚠️🎯📊)
4. One sentence per bullet point
5. Include key metrics when possible (P/E, growth %, etc.)
6. End with a clear verdict or action
7. NO disclaimers or headers', '流媒体AI分析 - 系统提示词'),

('streaming_user_prompt', 'Analyze this stock or market topic: {query}', '流媒体AI分析 - 用户提示词模板 (变量: {query})'),

('stock_system_prompt', 'You are a professional stock analyst. Provide concise, structured analysis.

Output format:
- Emoji + Stock symbol + Price (first line)
- AI Score or key metric
- 2-3 strengths with specific data
- 2-3 risks with specific data
- Technical levels or summary
- Maximum 12 lines total

Use emojis: 📊📈📉✅⚠️🎯📍
Be specific with numbers and percentages.
NO introductions or disclaimers.', '股票诊断 - 系统提示词'),

('stock_prompt_format_1', 'Provide a professional analysis for {symbol} stock at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output format:
📊 {symbol} · ${price:.2f} {direction}

🎯 AI Score: [X]/100

✅ Key Strengths:
• [Specific strength with data/metrics]
• [Another strength]

⚠️ Key Risks:
• [Specific risk with impact]
• [Another risk]

📍 Technical Levels:
Support: $[price] · Resistance: $[price]

Provide real analysis, not placeholders. Be specific with numbers.', '股票诊断格式1 - 记分卡 (变量: {symbol}, {price}, {direction}, {change_pct})'),

('stock_prompt_format_2', 'Analyze {symbol} stock currently at ${price:.2f} ({direction} {change_pct:+.2f}%).

Output:
🔍 {symbol} Analysis

📈 Bullish Case:
• [Growth driver with specific numbers]
• [Positive catalyst with timeline]

📉 Bearish Case:
• [Risk factor with potential impact]
• [Concern with data]

🎯 Verdict: [X]/100 - [Buy/Hold/Sell]

Be specific with metrics (P/E, growth rates, revenue numbers). No placeholders.', '股票诊断格式2 - 多空分析 (变量: {symbol}, {price}, {direction}, {change_pct})'),

('stock_prompt_format_3', 'Technical analysis for {symbol} at ${price:.2f}.

Output:
📊 {symbol} Technical View

┌──────────────────┐
│ Price: ${price:.2f} {emoji}
│ Change: {change:+.2f}
│ Score: [X]/100
│ Trend: [Bullish/Bearish/Neutral]
└──────────────────┘

Key Technical Points:
• [Support/resistance level with price]
• [Trend indicator with direction]
• [Volume or momentum signal]

📍 Action:
Entry: $[price] · Target: $[price] · Stop: $[price]

Use actual technical analysis principles. Be specific with levels.', '股票诊断格式3 - 技术分析 (变量: {symbol}, {price}, {emoji}, {change})');

