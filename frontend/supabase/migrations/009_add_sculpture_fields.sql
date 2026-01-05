-- Migration: Add sculpture-related fields to maps table
-- Phase 4.6: Database & Social Integration for 3D Sculptures

-- Add product_type column to distinguish between posters and sculptures
-- Default to 'poster' for existing rows
ALTER TABLE maps
ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'poster';

-- Add constraint to ensure valid product types
ALTER TABLE maps
ADD CONSTRAINT maps_product_type_check
CHECK (product_type IN ('poster', 'sculpture'));

-- Add sculpture_config column to store 3D sculpture settings
-- This is a JSONB column that stores the SculptureConfig type
ALTER TABLE maps
ADD COLUMN IF NOT EXISTS sculpture_config JSONB;

-- Add sculpture_thumbnail_url column for 3D sculpture preview images
ALTER TABLE maps
ADD COLUMN IF NOT EXISTS sculpture_thumbnail_url TEXT;

-- Create an index on product_type for efficient filtering in feeds
CREATE INDEX IF NOT EXISTS idx_maps_product_type ON maps(product_type);

-- Create a composite index for feed queries filtered by product type
CREATE INDEX IF NOT EXISTS idx_maps_product_type_published
ON maps(product_type, is_published, published_at DESC)
WHERE is_published = true;

-- Add comment to document the new columns
COMMENT ON COLUMN maps.product_type IS 'Type of product: poster for 2D map posters, sculpture for 3D printed route sculptures';
COMMENT ON COLUMN maps.sculpture_config IS 'Configuration for 3D sculptures including shape, size, material, and route settings';
COMMENT ON COLUMN maps.sculpture_thumbnail_url IS 'URL to the thumbnail image of the 3D sculpture preview';
