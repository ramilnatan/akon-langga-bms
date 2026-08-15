import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/services';
import { useAuth } from '@/hooks/use-auth';
import type { CartItemWithProduct } from '@/types';

const GUEST_CART_KEY = 'akon_guest_cart_session';

interface CartContextValue {
  items: CartItemWithProduct[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  sessionId: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<{ error: string | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<{ error: string | null }>;
  removeItem: (itemId: string) => Promise<{ error: string | null }>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const ensureGuestSession = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) return stored;

    const { data, error } = await supabase.rpc('create_guest_cart');
    if (error || !data) return null;

    const id = data as string;
    localStorage.setItem(GUEST_CART_KEY, id);
    return id;
  }, []);

  const ensureAuthSession = useCallback(async (userId: string): Promise<string | null> => {
    const { data: existing } = await supabase
      .from('cart_sessions')
      .select('session_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) return existing.session_id;

    const { data: created, error } = await supabase
      .from('cart_sessions')
      .insert({ user_id: userId })
      .select('session_id')
      .single();

    if (error || !created) return null;
    return created.session_id;
  }, []);

  const fetchCartItems = useCallback(async (sid: string) => {
    const { data, error } = user
      ? await supabase.rpc('get_user_cart_items')
      : await supabase.rpc('get_guest_cart_items', {
          p_session_id: sid,
        });

    if (error) {
      setItems([]);
      return;
    }

    const typed = ((data ?? []) as Array<{
      id: string;
      session_id: string;
      product_id: string;
      quantity: number;
      created_at: string;
      product: CartItemWithProduct['product'] | CartItemWithProduct['product'][];
    }>).map((row) => ({
      id: row.id,
      session_id: row.session_id,
      product_id: row.product_id,
      quantity: row.quantity,
      created_at: row.created_at,
      product: Array.isArray(row.product) ? row.product[0] : row.product,
    })) as CartItemWithProduct[];

    setItems(typed);
  }, [user]);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      let sid: string | null = null;

      if (user) {
        sid = await ensureAuthSession(user.id);
      } else {
        sid = await ensureGuestSession();
      }

      setSessionId(sid);
      if (sid) {
        await fetchCartItems(sid);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user, ensureAuthSession, ensureGuestSession, fetchCartItems]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1): Promise<{ error: string | null }> => {
    let sid = sessionId;
    if (!sid) {
      sid = user ? await ensureAuthSession(user.id) : await ensureGuestSession();
      setSessionId(sid);
    }
    if (!sid) return { error: 'Could not initialize cart. Please try again.' };

    const { error } = user
      ? await supabase.rpc('add_user_cart_item', {
          p_product_id: productId,
          p_quantity: quantity,
        })
      : await supabase.rpc('add_guest_cart_item', {
          p_session_id: sid,
          p_product_id: productId,
          p_quantity: quantity,
        });

    if (error) {
      const msg = error.message;
      if (msg.includes('exceeds available stock')) {
        return { error: 'Sorry, the requested quantity exceeds the available stock.' };
      }
      if (msg.includes('not available') || msg.includes('out of stock')) {
        return { error: 'This product is no longer available.' };
      }
      return { error: 'Could not add item to cart. Please try again.' };
    }

    await fetchCartItems(sid);
    return { error: null };
  };

  const updateQuantity = async (itemId: string, quantity: number): Promise<{ error: string | null }> => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    if (!sessionId) return { error: 'Could not initialize cart. Please try again.' };

    const { error } = user
      ? await supabase.rpc('update_user_cart_item', {
          p_item_id: itemId,
          p_quantity: quantity,
        })
      : await supabase.rpc('update_guest_cart_item', {
          p_session_id: sessionId,
          p_item_id: itemId,
          p_quantity: quantity,
        });

    if (error) return { error: 'Could not update quantity. Please try again.' };

    await refreshCart();
    return { error: null };
  };

  const removeItem = async (itemId: string): Promise<{ error: string | null }> => {
    if (!sessionId) return { error: 'Could not initialize cart. Please try again.' };

    const { error } = user
      ? await supabase.rpc('remove_user_cart_item', {
          p_item_id: itemId,
        })
      : await supabase.rpc('remove_guest_cart_item', {
          p_session_id: sessionId,
          p_item_id: itemId,
        });

    if (error) return { error: 'Could not remove item. Please try again.' };

    await refreshCart();
    return { error: null };
  };

  const clearCart = async () => {
    if (!sessionId) return;
    await supabase.from('cart_items').delete().eq('session_id', sessionId);
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        subtotal,
        sessionId,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
