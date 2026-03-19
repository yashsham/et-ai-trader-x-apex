-- Supabase Schema Reconciliation Script
-- Idempotent updates to bring the database to the desired state.

-- 1. Analysis Results
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    decision TEXT, -- BUY, SELL, HOLD
    decision_output TEXT, -- Full AI Reasoning
    portfolio JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Watchlist
CREATE TABLE IF NOT EXISTS public.watchlist (
    symbol TEXT PRIMARY KEY,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL, -- LOW, MEDIUM, HIGH
    user_id TEXT DEFAULT 'anonymous',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Settings (with idempotent column additions)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id TEXT PRIMARY KEY, -- Usually 'default_user'
    full_name TEXT,
    risk_tolerance TEXT DEFAULT 'Medium',
    max_allocation_per_trade FLOAT DEFAULT 10.0,
    openai_api_key TEXT,
    gnews_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='risk_profile') THEN
        ALTER TABLE public.user_settings ADD COLUMN risk_profile TEXT DEFAULT 'Aggressive';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='theme_mode') THEN
        ALTER TABLE public.user_settings ADD COLUMN theme_mode TEXT DEFAULT 'dark';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='assistant_memory_enabled') THEN
        ALTER TABLE public.user_settings ADD COLUMN assistant_memory_enabled BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 5. Portfolio Holdings
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'default_user',
    symbol TEXT NOT NULL,
    quantity FLOAT NOT NULL,
    avg_price FLOAT NOT NULL,
    purchase_date TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='portfolio_holdings' AND column_name='sector') THEN
        ALTER TABLE public.portfolio_holdings ADD COLUMN sector TEXT DEFAULT 'General';
    END IF;
END $$;

-- 6. News Snapshots
CREATE TABLE IF NOT EXISTS public.news_snapshots (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    news_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chart Snapshots
CREATE TABLE IF NOT EXISTS public.chart_snapshots (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    chart_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Security Best Practice)
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_snapshots ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies (Anonymous access for now based on app structure)
CREATE POLICY "Allow All" ON public.analysis_results FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.watchlist FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.user_settings FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.portfolio_holdings FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.news_snapshots FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.chart_snapshots FOR ALL USING (true);
