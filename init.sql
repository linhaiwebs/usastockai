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
