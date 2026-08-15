/*
# Create cart_sessions, cart_items tables and cart RPCs

1. New Tables
- `cart_sessions`
  - `session_id` (uuid, primary key, default gen_random_uuid())
  - `user_id` (uuid, nullable, references auth.users ON DELETE CASCADE)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `cart_items`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `session_id` (uuid, NOT NULL, references cart_sessions ON DELETE CASCADE)
  - `product_id` (uuid, NOT NULL, references products ON DELETE CASCADE)
  - `quantity` (integer, NOT NULL, default 1, CHECK quantity > 0)
  - `created_at` (timestamptz, default now())
  - Unique constraint on (session_id, product_id)

2. Security
- RLS on cart_sessions: authenticated users can CRUD their own sessions (user_id = auth.uid()).
- RLS on cart_items: authenticated users can CRUD items in their own sessions.
- Guest cart creation via RPC create_guest_cart() — SECURITY DEFINER.
- Guest cart item addition via RPC add_guest_cart_item() — SECURITY DEFINER.

3. Functions
- `create_guest_cart()` — returns uuid (session_id). SECURITY DEFINER, empty search_path.
  Execution: anon, authenticated, postgres, service_role.
- `add_guest_cart_item(session_id, product_id, quantity)` — returns uuid (cart item id).
  SECURITY DEFINER, empty search_path.
  Validates: product is published, active, stock > 0, quantity <= stock.
  Execution: anon, authenticated, postgres, service_role.

4. Indexes
- idx_cart_items_product_id
- idx_cart_items_session_id
- uq_cart_items_session_product (unique)
*/

-- cart_sessions table
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own cart sessions
DROP POLICY IF EXISTS "select_own_cart_sessions" ON public.cart_sessions;
CREATE POLICY "select_own_cart_sessions"
ON public.cart_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_own_cart_sessions" ON public.cart_sessions;
CREATE POLICY "insert_own_cart_sessions"
ON public.cart_sessions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_own_cart_sessions" ON public.cart_sessions;
CREATE POLICY "update_own_cart_sessions"
ON public.cart_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_cart_sessions" ON public.cart_sessions;
CREATE POLICY "delete_own_cart_sessions"
ON public.cart_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.cart_sessions(session_id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cart_items_session_product UNIQUE (session_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage items in their own cart sessions
DROP POLICY IF EXISTS "select_own_cart_items" ON public.cart_items;
CREATE POLICY "select_own_cart_items"
ON public.cart_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cart_sessions
    WHERE cart_sessions.session_id = cart_items.session_id
    AND cart_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_own_cart_items" ON public.cart_items;
CREATE POLICY "insert_own_cart_items"
ON public.cart_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_sessions
    WHERE cart_sessions.session_id = cart_items.session_id
    AND cart_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "update_own_cart_items" ON public.cart_items;
CREATE POLICY "update_own_cart_items"
ON public.cart_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cart_sessions
    WHERE cart_sessions.session_id = cart_items.session_id
    AND cart_sessions.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cart_sessions
    WHERE cart_sessions.session_id = cart_items.session_id
    AND cart_sessions.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_own_cart_items" ON public.cart_items;
CREATE POLICY "delete_own_cart_items"
ON public.cart_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cart_sessions
    WHERE cart_sessions.session_id = cart_items.session_id
    AND cart_sessions.user_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);

-- create_guest_cart() RPC
CREATE OR REPLACE FUNCTION public.create_guest_cart()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  INSERT INTO public.cart_sessions (user_id)
  VALUES (NULL)
  RETURNING session_id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_cart() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_guest_cart() TO anon, authenticated, postgres, service_role;

-- add_guest_cart_item() RPC
CREATE OR REPLACE FUNCTION public.add_guest_cart_item(
  p_session_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_cart_item_id uuid;
  v_product record;
  v_existing_quantity integer;
  v_total_quantity integer;
BEGIN
  -- Validate product availability
  SELECT stock, published, active, name
  INTO v_product
  FROM public.products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF v_product.published = false OR v_product.active = false THEN
    RAISE EXCEPTION 'Product is not available';
  END IF;

  IF v_product.stock <= 0 THEN
    RAISE EXCEPTION 'Product is out of stock';
  END IF;

  -- Check existing quantity in cart
  SELECT quantity INTO v_existing_quantity
  FROM public.cart_items
  WHERE session_id = p_session_id AND product_id = p_product_id;

  v_total_quantity := COALESCE(v_existing_quantity, 0) + p_quantity;

  IF v_total_quantity > v_product.stock THEN
    RAISE EXCEPTION 'Requested quantity exceeds available stock';
  END IF;

  IF v_existing_quantity IS NOT NULL THEN
    -- Update existing cart item
    UPDATE public.cart_items
    SET quantity = v_total_quantity
    WHERE session_id = p_session_id AND product_id = p_product_id
    RETURNING id INTO v_cart_item_id;
  ELSE
    -- Insert new cart item
    INSERT INTO public.cart_items (session_id, product_id, quantity)
    VALUES (p_session_id, p_product_id, p_quantity)
    RETURNING id INTO v_cart_item_id;
  END IF;

  RETURN v_cart_item_id;
END;
$$;

REVOKE ALL ON FUNCTION public.add_guest_cart_item(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_guest_cart_item(uuid, uuid, integer) TO anon, authenticated, postgres, service_role;

-- Grant table access
GRANT SELECT ON public.cart_sessions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cart_sessions TO authenticated;
GRANT SELECT ON public.cart_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
