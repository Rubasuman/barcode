-- Create barcode_stickers table
CREATE TABLE barcode_stickers (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  price DECIMAL(10, 2),
  barcode VARCHAR(255) NOT NULL UNIQUE,
  format VARCHAR(50) NOT NULL DEFAULT 'CODE128',
  source VARCHAR(50) NOT NULL DEFAULT 'manual',
  quantity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_barcode ON barcode_stickers(barcode);
CREATE INDEX idx_sku ON barcode_stickers(sku);
CREATE INDEX idx_created_at ON barcode_stickers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE barcode_stickers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all (public access)
CREATE POLICY "Allow public access" ON barcode_stickers
  FOR ALL
  USING (true)
  WITH CHECK (true);
