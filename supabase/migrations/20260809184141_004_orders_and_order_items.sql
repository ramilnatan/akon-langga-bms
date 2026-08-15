/*
# Create orders and order_items tables

1. New Tables
- `orders`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `user_id` (uuid, nullable, references auth.users ON DELETE SET NULL)
  - `guest_session_id` (uuid, nullable, references cart_sessions ON DELETE SET NULL)
  - `status` (text, NOT NULL, default 'pending', CHECK in pending/confirmed/shipped/delivered/cancelled)
  - `total` (numeric(12,2), NOT NULL, default 0)
  - `customer_name` (text, NOT NULL)
  - `customer_email` (text, NOT NULL)
  - `customer_phone` (text, nullable)
  - `shipping_address` (text, nullable)
  - `notes` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `order_items`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `order_id` (uuid, NOT NULL, references orders ON DELETE CASCADE)
  - `product_id` (uuid, NOT NULL, references products ON DELETE CASCADE)
  - `product_name` (text, NOT NULL)
  - `quantity` (integer, NOT NULL, CHECK quantity > 0)
  - `unit_price` (numeric(12,2), NOT NULL)
  - `line_total` (numeric(12,2), NOT NULL)
  - `created_at` (timestamptz, default now())

2. Security
- RLS on orders: authenticated users can read their own orders; admin can read all.
- RLS on order_items: authenticated users can read items from their own orders; admin can read all.
- INSERT: handled by checkout RPC (SECURITY DEFINER) — not directly from frontend.
- UPDATE/DELETE: admin only.

3. Functions
- `place_order(p_session_id, p_customer_name, p_customer_email, p_customer_phone, p_shipping_address, p_notes)`
  SECURITY DEFINER, empty search_path.
  Creates an order from a cart session, copies cart items to order_items, decrements stock, clears cart.
  Execution: anon, authenticated, postgres, service_role.

4. Indexes
- idx_orders_user_id
- idx_orders_status
- idx_order_items_order_id
- idx_order_items_product_id
*/

-- orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id uuid REFERENCES public.cart_sessions(session_id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(12,2) NOT NULL DEFAULT 0,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own orders
DROP POLICY IF EXISTS "select_own_orders" ON public.orders;
CREATE POLICY "select_own_orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can read all orders
DROP POLICY IF EXISTS "admin_select_all_orders" ON public.orders;
CREATE POLICY "admin_select_all_orders"
ON public.orders FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can update orders
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders"
ON public.orders FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin can delete orders
DROP POLICY IF EXISTS "admin_delete_orders" ON public.orders;
CREATE POLICY "admin_delete_orders"
ON public.orders FOR DELETE
TO authenticated
USING (public.is_admin());

-- order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read items from their own orders
DROP POLICY IF EXISTS "select_own_order_items" ON public.order_items;
CREATE POLICY "select_own_order_items"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Admin can read all order items
DROP POLICY IF EXISTS "admin_select_all_order_items" ON public.order_items;
CREATE POLICY "admin_select_all_order_items"
ON public.order_items FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can update order items
DROP POLICY IF EXISTS "admin_update_order_items" ON public.order_items;
CREATE POLICY "admin_update_order_items"
ON public.order_items FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin can delete order items
DROP POLICY IF EXISTS "admin_delete_order_items" ON public.order_items;
CREATE POLICY "admin_delete_order_items"
ON public.order_items FOR DELETE
TO authenticated
USING (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- place_order() RPC
CREATE OR REPLACE FUNCTION public.place_order(
  p_session_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text DEFAULT NULL,
  p_shipping_address text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id uuid;
  v_user_id uuid;
  v_total numeric(12,2) := 0;
  v_cart_item record;
  v_product record;
  v_effective_price numeric(12,2);
  v_line_total numeric(12,2);
BEGIN
  -- Get the cart session
  SELECT user_id INTO v_user_id
  FROM public.cart_sessions
  WHERE session_id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart session not found';
  END IF;

  -- If authenticated, verify ownership
  IF v_user_id IS NOT NULL AND v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: cart belongs to another user';
  END IF;

  -- Create the order
  INSERT INTO public.orders (
    user_id, guest_session_id, status, total,
    customer_name, customer_email, customer_phone,
    shipping_address, notes
  )
  VALUES (
    v_user_id, p_session_id, 'pending', 0,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_notes
  )
  RETURNING id INTO v_order_id;

  -- Copy cart items to order_items and compute total
  FOR v_cart_item IN
    SELECT ci.product_id, ci.quantity, p.name, p.price, p.sale_price, p.stock, p.published, p.active
    FROM public.cart_items ci
    JOIN public.products p ON p.id = ci.product_id
    WHERE ci.session_id = p_session_id
  LOOP
    -- Validate product is still available
    IF v_cart_item.published = false OR v_cart_item.active = false THEN
      RAISE EXCEPTION 'Product % is no longer available', v_cart_item.name;
    END IF;

    IF v_cart_item.stock < v_cart_item.quantity THEN
      RAISE EXCEPTION 'Requested quantity exceeds available stock for %', v_cart_item.name;
    END IF;

    -- Use sale price if available and lower
    v_effective_price := COALESCE(v_cart_item.sale_price, v_cart_item.price);
    v_line_total := v_effective_price * v_cart_item.quantity;
    v_total := v_total + v_line_total;

    -- Insert order item
    INSERT INTO public.order_items (
      order_id, product_id, product_name,
      quantity, unit_price, line_total
    )
    VALUES (
      v_order_id, v_cart_item.product_id, v_cart_item.name,
      v_cart_item.quantity, v_effective_price, v_line_total
    );

    -- Decrement stock
    UPDATE public.products
    SET stock = stock - v_cart_item.quantity,
        updated_at = now()
    WHERE id = v_cart_item.product_id;
  END LOOP;

  -- Update order total
  UPDATE public.orders
  SET total = v_total, updated_at = now()
  WHERE id = v_order_id;

  -- Clear cart items
  DELETE FROM public.cart_items
  WHERE session_id = p_session_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(uuid, text, text, text, text, text) TO anon, authenticated, postgres, service_role;

-- Grant table access
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
