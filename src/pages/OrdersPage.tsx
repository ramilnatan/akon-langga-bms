import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Order, OrderItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);

interface OrderBundleItem {
  id: string;
  bundle_name_snapshot: string;
  bundle_price_snapshot: number;
  bundle_quantity: number;
}

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [orderBundleItems, setOrderBundleItems] = useState<Record<string, OrderBundleItem[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});
  const [itemsError, setItemsError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, user]);

  const fetchOrderItems = async (orderId: string) => {
    setItemsLoading((prev) => ({ ...prev, [orderId]: true }));
    setItemsError((prev) => ({ ...prev, [orderId]: null }));
    try {
      const [itemsRes, bundleRes] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', orderId),
        supabase.from('order_bundle_items').select('*').eq('order_id', orderId)
      ]);
      if (itemsRes.error) throw itemsRes.error;
      if (bundleRes.error) throw bundleRes.error;
      setOrderItems((prev) => ({ ...prev, [orderId]: itemsRes.data || [] }));
      setOrderBundleItems((prev) => ({ ...prev, [orderId]: bundleRes.data || [] }));
    } catch (err) {
      console.error('Error loading order items:', err);
      setItemsError((prev) => ({ ...prev, [orderId]: 'Failed to load items.' }));
    } finally {
      setItemsLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      if (!orderItems[orderId] && !orderBundleItems[orderId]) {
        fetchOrderItems(orderId);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-10 text-center">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertCircle className="h-10 w-10" />
          <h2 className="text-xl font-semibold">{error}</h2>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-10 text-center">
        <h2 className="text-2xl font-bold">Please sign in to view your orders.</h2>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Helmet>
        <title>My Orders | AKON LANGGA</title>
      </Helmet>

      <PageHeader
        eyebrow="Account"
        title="My Orders"
        description="View your past order history."
      />

      <div className="space-y-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              You haven't placed any orders yet.
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer bg-muted/50 pb-4 transition-colors hover:bg-muted"
                onClick={() => toggleOrder(order.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleOrder(order.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={expandedOrder === order.id}
                aria-controls={`order-content-${order.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                    <CardDescription>{format(new Date(order.created_at), 'PPP')}</CardDescription>
                  </div>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              {expandedOrder === order.id && (
                <CardContent id={`order-content-${order.id}`} className="pt-6">
                  <div className="mb-4 space-y-2">
                    {itemsLoading[order.id] ? (
                      <LoadingSpinner size="sm" />
                    ) : itemsError[order.id] ? (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <span>{itemsError[order.id]}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-0 text-destructive underline hover:text-destructive/90"
                          onClick={() => fetchOrderItems(order.id)}
                        >
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <>
                        {orderItems[order.id]?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span>{formatCurrency(item.line_total)}</span>
                          </div>
                        ))}
                        {orderBundleItems[order.id]?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.bundle_name_snapshot} × {item.bundle_quantity}</span>
                            <span>{formatCurrency(item.bundle_price_snapshot * item.bundle_quantity)}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="border-t pt-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(order.shipping_fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </Container>
  );
}
