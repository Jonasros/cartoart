-- Migration: Add API usage tracking table
-- Purpose: Track tile API requests to monitor usage quotas (MapTiler, OpenFreeMap, etc.)

-- Create the api_usage table for daily aggregated request counts
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL,                    -- API source: 'maptiler', 'openfreemap', etc.
    date DATE NOT NULL,                      -- The date (YYYY-MM-DD)
    request_count INTEGER DEFAULT 0,         -- Total requests for this source/date
    tilejson_count INTEGER DEFAULT 0,        -- TileJSON requests (counted separately)
    error_count INTEGER DEFAULT 0,           -- Failed requests
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one row per source per date
    CONSTRAINT unique_source_date UNIQUE (source, date)
);

-- Add index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON public.api_usage(date DESC);

-- Add index for source filtering
CREATE INDEX IF NOT EXISTS idx_api_usage_source ON public.api_usage(source);

-- Add index for combined source+date queries
CREATE INDEX IF NOT EXISTS idx_api_usage_source_date ON public.api_usage(source, date DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- No public read access - this is admin-only data
-- Access is controlled via service role key in the API

-- Create policy for service role access (required for the tracker to write)
CREATE POLICY "Service role can manage api_usage"
    ON public.api_usage
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create a policy to allow authenticated service operations
-- Note: The tracker uses service role key, so this is mainly for flexibility
CREATE POLICY "Allow insert from authenticated services"
    ON public.api_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_api_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_usage_updated_at_trigger
    BEFORE UPDATE ON public.api_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_api_usage_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.api_usage IS 'Tracks daily API request counts by source for quota monitoring';
COMMENT ON COLUMN public.api_usage.source IS 'API provider name: maptiler, openfreemap, kontur, etc.';
COMMENT ON COLUMN public.api_usage.date IS 'The date of the requests (UTC)';
COMMENT ON COLUMN public.api_usage.request_count IS 'Total number of tile requests';
COMMENT ON COLUMN public.api_usage.tilejson_count IS 'Number of TileJSON metadata requests';
COMMENT ON COLUMN public.api_usage.error_count IS 'Number of failed requests';
