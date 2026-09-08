-- Migration: 20260810184000_007_add_cancel_order_rpc.sql
-- Function to cancel order and restore stock atomically (admin only)

CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status text;
  v_item record;
  v_comp record;
BEGIN
  -- Admin Authorization Check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Atomic row lock
  SELECT status INTO v_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Idempotency check: Already cancelled, do nothing.
  IF v_status = 'cancelled' THEN
    RETURN;
  END IF;

  -- 1. Restore Direct Product Items
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock = stock + v_item.quantity,
          updated_at = now()
      WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  -- 2. Restore Bundle Components (Historical Snapshot)
  FOR v_item IN
    SELECT id, bundle_quantity
    FROM public.order_bundle_items
    WHERE order_id = p_order_id
  LOOP
    FOR v_comp IN
      SELECT product_id, quantity_per_bundle
      FROM public.order_bundle_components
      WHERE order_bundle_item_id = v_item.id
    LOOP
      IF v_comp.product_id IS NOT NULL THEN
        UPDATE public.products
        SET stock = stock + (v_item.bundle_quantity * v_comp.quantity_per_bundle),
            updated_at = now()
        WHERE id = v_comp.product_id;
      END IF;
    END LOOP;
  END LOOP;

  -- 3. Finalize Status
  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO authenticated, postgres, service_role;
