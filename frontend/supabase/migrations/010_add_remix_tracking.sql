-- Migration: Add remix tracking to maps table
-- This enables the "Remix This Adventure" feature with lineage tracking

-- Add remix tracking columns
ALTER TABLE maps ADD COLUMN IF NOT EXISTS remixed_from_id UUID REFERENCES maps(id) ON DELETE SET NULL;
ALTER TABLE maps ADD COLUMN IF NOT EXISTS remix_count INTEGER DEFAULT 0;

-- Create index for efficient remix queries
CREATE INDEX IF NOT EXISTS idx_maps_remixed_from ON maps(remixed_from_id) WHERE remixed_from_id IS NOT NULL;

-- Create function to increment remix_count on the original map
CREATE OR REPLACE FUNCTION increment_remix_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if remixed_from_id is set
  IF NEW.remixed_from_id IS NOT NULL THEN
    UPDATE maps
    SET remix_count = remix_count + 1
    WHERE id = NEW.remixed_from_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement remix_count when a remix is deleted
CREATE OR REPLACE FUNCTION decrement_remix_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement if remixed_from_id was set
  IF OLD.remixed_from_id IS NOT NULL THEN
    UPDATE maps
    SET remix_count = GREATEST(0, remix_count - 1)
    WHERE id = OLD.remixed_from_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_increment_remix_count ON maps;
DROP TRIGGER IF EXISTS trigger_decrement_remix_count ON maps;

-- Create triggers
CREATE TRIGGER trigger_increment_remix_count
  AFTER INSERT ON maps
  FOR EACH ROW
  EXECUTE FUNCTION increment_remix_count();

CREATE TRIGGER trigger_decrement_remix_count
  AFTER DELETE ON maps
  FOR EACH ROW
  EXECUTE FUNCTION decrement_remix_count();

-- Add comment explaining the columns
COMMENT ON COLUMN maps.remixed_from_id IS 'ID of the original map this was remixed from';
COMMENT ON COLUMN maps.remix_count IS 'Number of times this map has been remixed by others';
