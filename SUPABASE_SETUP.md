# Supabase Setup Guide

## Creating the Barcode Stickers Table

Follow these steps to set up your Supabase database:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com and log in to your project
2. Navigate to the **SQL Editor** section
3. Click **New Query**

### Step 2: Run the SQL Migration
Copy and paste the following SQL into the editor:

```sql
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
```

### Step 3: Execute Query
Click the **Run** button (play icon) to execute the SQL.

### Step 4: Verify
You should see the table `barcode_stickers` in the **Tables** section of the left sidebar.

## Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| title | VARCHAR(255) | Product title |
| sku | VARCHAR(100) | Product SKU |
| price | DECIMAL(10,2) | Product price |
| barcode | VARCHAR(255) | Barcode value (unique) |
| format | VARCHAR(50) | Barcode format (CODE128, EAN13, etc.) |
| source | VARCHAR(50) | Data source (manual or excel) |
| quantity | INT | Number of stickers printed |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Testing the API

### Save a Sticker (POST)
```bash
curl -X POST http://localhost:5000/api/stickers/save \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Name",
    "sku": "SKU-001",
    "price": "9.99",
    "barcode": "123456789012",
    "format": "CODE128",
    "source": "manual",
    "quantity": 1
  }'
```

### Get All Stickers (GET)
```bash
curl http://localhost:5000/api/stickers
```

### Delete a Sticker (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/stickers/1
```

## Environment Variables

Make sure your `.env` file in the backend has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```
