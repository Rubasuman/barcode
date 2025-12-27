-- Create products table in Supabase
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  barcode VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on barcode for faster lookups
CREATE INDEX idx_products_barcode ON products(barcode);

-- Create index on category
CREATE INDEX idx_products_category ON products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Enable all operations for products" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);
