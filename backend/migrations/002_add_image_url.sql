-- Add image_url column to barcode_stickers
ALTER TABLE barcode_stickers
  ADD COLUMN IF NOT EXISTS image_url TEXT;
