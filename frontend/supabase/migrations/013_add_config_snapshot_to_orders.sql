-- Migration: Add config_snapshot to orders table
-- This stores the EXACT poster/sculpture configuration at time of purchase
-- Prevents issues where user edits map after purchase and gets wrong design

-- Add config_snapshot column to store full PosterConfig at purchase time
ALTER TABLE orders ADD COLUMN IF NOT EXISTS config_snapshot JSONB;

-- Add sculpture_config_snapshot for sculpture purchases
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sculpture_config_snapshot JSONB;

-- Add product_type to know if this was a poster or sculpture purchase
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'poster';

-- Add config_hash for integrity verification (optional but useful for debugging)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS config_hash TEXT;

-- Comment explaining the columns
COMMENT ON COLUMN orders.config_snapshot IS 'Full PosterConfig snapshot at time of purchase - immutable record of what was purchased';
COMMENT ON COLUMN orders.sculpture_config_snapshot IS 'Full SculptureConfig snapshot at time of purchase (for sculpture products)';
COMMENT ON COLUMN orders.product_type IS 'Type of product purchased: poster or sculpture';
COMMENT ON COLUMN orders.config_hash IS 'SHA256 hash of config for integrity verification';
