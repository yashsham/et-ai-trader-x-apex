-- ET AI Trader X - Supabase Schema Initialization

-- 1. Analysis Results (Stores AI Stock Scans)
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    decision TEXT, -- BUY, SELL, HOLD
    decision_output TEXT, -- Full AI Reasoning
    portfolio JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Watchlist (Stocks being tracked)
CREATE TABLE IF NOT EXISTS public.watchlist (
    symbol TEXT PRIMARY KEY,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Audit Logs (System Events & Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL, -- LOW, MEDIUM, HIGH
    user_id TEXT DEFAULT 'anonymous',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id TEXT PRIMARY KEY, -- Usually 'default_user' or actual User ID
    full_name TEXT,
    email TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    notifications BOOLEAN DEFAULT TRUE,
    risk_profile TEXT DEFAULT 'Moderate',
    theme_mode TEXT DEFAULT 'dark',
    assistant_memory_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Portfolio Holdings (Current active positions)
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT DEFAULT 'default_user',
    symbol TEXT NOT NULL,
    quantity FLOAT8 NOT NULL,
    avg_price FLOAT8 NOT NULL,
    sector TEXT DEFAULT 'Other',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. News Snapshots (Historical news context)
CREATE TABLE IF NOT EXISTS public.news_snapshots (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    news_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chart Snapshots (Historical chart indicators)
CREATE TABLE IF NOT EXISTS public.chart_snapshots (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    chart_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional, but recommended for production)
-- ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
-- ... etc
