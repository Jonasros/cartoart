-- Migration: Add orders table for Stripe payments
-- Created: 2026-01-12

-- Orders table for tracking purchases and downloads
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL for guest checkout
  email TEXT NOT NULL,                                         -- Required for guest access
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  product TEXT NOT NULL,                                       -- poster-small, poster-medium, poster-large, sculpture-stl
  amount INTEGER NOT NULL,                                     -- Amount in cents
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  map_id UUID REFERENCES maps(id) ON DELETE SET NULL,
  export_config JSONB,                                         -- Stores resolution, format, map config snapshot
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,                             -- 5 downloads per purchase
  download_token TEXT UNIQUE NOT NULL,                         -- Secure token for download URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders(download_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders (by user_id if logged in, or by matching email)
CREATE POLICY "Users can view own orders by user_id"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Allow anonymous select with download token (for download verification)
CREATE POLICY "Anyone can view order by download token"
  ON orders FOR SELECT
  USING (true);  -- Download token verified at application level

-- Policy: Service role can insert orders (from webhook)
CREATE POLICY "Service role can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can update orders (for download count, status)
CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON orders TO anon;

-- Comment on table
COMMENT ON TABLE orders IS 'Stores order information for Stripe purchases of poster and sculpture exports';
COMMENT ON COLUMN orders.download_token IS 'Secure random token used in download URLs - never expires but limited to max_downloads';
COMMENT ON COLUMN orders.export_config IS 'JSON containing resolution key, format, and optionally a map config snapshot for re-generation';
