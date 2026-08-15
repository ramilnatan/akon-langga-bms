/*
# Create analytics views and admin RPC gateways

1. New Views
- `analytics_order_status` — groups orders by status, returns status, order_count, total_sales.
- `analytics_product_sales` — aggregates product sales from order_items (excludes cancelled orders).
- `analytics_sales_summary` — returns total_orders, total_sales, average_order_value (excludes cancelled).

2. Functions (Admin RPC Gateways)
- `get_admin_sales_summary()` — SECURITY DEFINER, empty search_path, checks is_admin().
  Returns total_orders, total_sales, average_order_value.
- `get_admin_product_sales()` — SECURITY DEFINER, empty search_path, checks is_admin().
  Returns product_id, product_name, total_quantity_sold, total_sales, order_line_count.
- `get_admin_order_status()` — SECURITY DEFINER, empty search_path, checks is_admin().
  Returns status, order_count, total_sales.

3. Security
- Views are NOT directly accessible by anon or authenticated (no grants).
- RPCs: authenticated, postgres, service_role only. NOT anon, NOT PUBLIC.
- Each RPC checks is_admin() and raises 'Admin access required' if not admin.
*/

-- analytics_order_status view
CREATE OR REPLACE VIEW public.analytics_order_status AS
SELECT
  status,
  COUNT(*)::bigint AS order_count,
  COALESCE(SUM(total), 0)::numeric AS total_sales
FROM public.orders
GROUP BY status;

-- analytics_product_sales view (excludes cancelled orders)
CREATE OR REPLACE VIEW public.analytics_product_sales AS
SELECT
  oi.product_id,
  oi.product_name,
  SUM(oi.quantity)::bigint AS total_quantity_sold,
  SUM(oi.line_total)::numeric AS total_sales,
  COUNT(*)::bigint AS order_line_count
FROM public.order_items oi
JOIN public.orders o ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY oi.product_id, oi.product_name;

-- analytics_sales_summary view (excludes cancelled orders)
CREATE OR REPLACE VIEW public.analytics_sales_summary AS
SELECT
  COUNT(*)::bigint AS total_orders,
  COALESCE(SUM(total), 0)::numeric AS total_sales,
  COALESCE(AVG(total), 0)::numeric AS average_order_value
FROM public.orders
WHERE status != 'cancelled';

-- Revoke all access from anon and authenticated on views
REVOKE ALL ON public.analytics_order_status FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.analytics_product_sales FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.analytics_sales_summary FROM anon, authenticated, PUBLIC;

-- get_admin_sales_summary() RPC
CREATE OR REPLACE FUNCTION public.get_admin_sales_summary()
RETURNS TABLE (
  total_orders bigint,
  total_sales numeric,
  average_order_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    s.total_orders,
    s.total_sales,
    s.average_order_value
  FROM public.analytics_sales_summary s;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_sales_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_sales_summary() TO authenticated, postgres, service_role;

-- get_admin_product_sales() RPC
CREATE OR REPLACE FUNCTION public.get_admin_product_sales()
RETURNS TABLE (
  product_id uuid,
  product_name text,
  total_quantity_sold bigint,
  total_sales numeric,
  order_line_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    ps.product_id,
    ps.product_name,
    ps.total_quantity_sold,
    ps.total_sales,
    ps.order_line_count
  FROM public.analytics_product_sales ps;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_product_sales() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_product_sales() TO authenticated, postgres, service_role;

-- get_admin_order_status() RPC
CREATE OR REPLACE FUNCTION public.get_admin_order_status()
RETURNS TABLE (
  status text,
  order_count bigint,
  total_sales numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    os.status,
    os.order_count,
    os.total_sales
  FROM public.analytics_order_status os;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_order_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_order_status() TO authenticated, postgres, service_role;
