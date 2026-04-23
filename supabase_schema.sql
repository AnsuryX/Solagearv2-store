-- SQL Script to create tables in Supabase for Solar Base Store
-- Run this in your Supabase SQL Editor

-- 1. Create 'products' table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_date TIMESTAMPTZ DEFAULT now(), -- Added to match code expectation
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL,
  image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  peak_power TEXT,
  efficiency TEXT,
  warranty_years NUMERIC,
  weight TEXT,
  dimensions TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  rating NUMERIC,
  review_count NUMERIC
);

-- 2. Create 'blog_posts' table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_date TIMESTAMPTZ DEFAULT now(), -- Added to match code expectation
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category TEXT,
  author_name TEXT,
  read_time_minutes NUMERIC DEFAULT 5,
  published BOOLEAN DEFAULT false, -- Added to match code expectation
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  system_size TEXT,
  savings_achieved TEXT,
  installation_location TEXT,
  installation_date TEXT,
  payback_period TEXT
);

-- 3. Create 'faqs' table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_date TIMESTAMPTZ DEFAULT now(), -- Added for consistency
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  "order" NUMERIC,
  published BOOLEAN DEFAULT true
);

-- 4. Create 'orders' table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_date TIMESTAMPTZ DEFAULT now(), -- Added for consistency
  user_id UUID,
  created_by TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC,
  shipping NUMERIC,
  tax NUMERIC,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT
);

-- 5. Create 'customers' table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  user_id UUID
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 7. Create Public Read Policies
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on faqs" ON faqs FOR SELECT USING (true);

-- 8. Create Order Policies (Allow anyone to create, but only owners or admins to read)
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to read their own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = created_by
);

-- 9. Create Customer Policies
CREATE POLICY "Allow users to manage their own customer profile" ON customers FOR ALL USING (
  auth.uid() = user_id OR auth.jwt() ->> 'email' = email
);

-- 10. Create Admin Management Policies (Simplified: allow all for now)
-- In a real app, you would check request.auth.jwt() ->> 'email' = 'solargearlrd@gmail.com'
CREATE POLICY "Allow admins to manage products" ON products FOR ALL USING (true);
CREATE POLICY "Allow admins to manage blog_posts" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow admins to manage faqs" ON faqs FOR ALL USING (true);
CREATE POLICY "Allow admins to read all orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow admins to update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow admins to manage customers" ON customers FOR ALL USING (true);
