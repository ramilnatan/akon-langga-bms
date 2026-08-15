/*
# Create products table

1. New Tables
- `products`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `name` (text, NOT NULL)
  - `slug` (text, NOT NULL, unique)
  - `description` (text, nullable)
  - `price` (numeric(12,2), NOT NULL)
  - `sale_price` (numeric(12,2), nullable)
  - `stock` (integer, NOT NULL, default 0)
  - `image_url` (text, nullable)
  - `category` (text, nullable)
  - `published` (boolean, NOT NULL, default false)
  - `active` (boolean, NOT NULL, default true)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- RLS enabled on `products`.
- SELECT: public (anon + authenticated) can read published + active products.
- INSERT/UPDATE/DELETE: admin only (via is_admin() check).

3. Indexes
- idx_products_slug on slug
- idx_products_category on category
- idx_products_published_active on (published, active)
*/

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  sale_price numeric(12,2),
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  category text,
  published boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read published + active products
DROP POLICY IF EXISTS "select_published_products" ON public.products;
CREATE POLICY "select_published_products"
ON public.products FOR SELECT
TO anon, authenticated
USING (published = true AND active = true);

-- Admin can read all products
DROP POLICY IF EXISTS "admin_select_all_products" ON public.products;
CREATE POLICY "admin_select_all_products"
ON public.products FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can insert products
DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admin_insert_products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin can update products
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin can delete products
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admin_delete_products"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_published_active ON public.products(published, active);

-- Grant access
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
