import { SettingsTab } from '@/components/admin/SettingsTab';
import { HeroSlidesTab } from '@/components/admin/HeroSlidesTab';
import { AnnouncementsTab } from '@/components/admin/AnnouncementsTab';
import { TestimonialsTab } from '@/components/admin/TestimonialsTab';
import { FaqsTab } from '@/components/admin/FaqsTab';
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  PackageOpen,
  LogOut,
  Lock,
  Layers,
  AlertTriangle,
  Megaphone,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

import { Container } from '@/components/layout/Container';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { Product, Order, OrderItem, SalesSummary, ProductSales, OrderStatusRow, Category, Bundle, BundleItem } from '@/types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

type Tab = 'overview' | 'orders' | 'products' | 'categories' | 'bundles' | 'hero'  | 'announcements' | 'testimonials' | 'faqs' | 'settings';


const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning',
  confirmed: 'bg-primary/15 text-primary',
  shipped: 'bg-secondary/20 text-secondary-foreground',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
};

export function AdminPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AdminLoginPrompt />;
  }

  if (!isAdmin) {
    return (
      <Container size="sm">
        <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-destructive">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground">Access Denied</h1>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Your account does not have admin privileges. Please contact an administrator.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <a href="/">Return to site</a>
            </Button>
            <Button variant="outline" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — AKON LANGGA</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Container>
        <div className="flex flex-col gap-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex gap-1 rounded-full border border-border bg-card p-1 shadow-soft">
            {([
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'bundles', label: 'Bundles', icon: PackageOpen },
              { id: 'hero', label: 'Hero Slides', icon: Layers },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
              { id: 'faqs', label: 'FAQs', icon: HelpCircle },
              { id: 'settings', label: 'Settings', icon: DollarSign },
            ] as { id: Tab; label: string; icon: typeof LayoutDashboard }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-foreground/70 hover:text-primary'
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewTab />}
          {tab === 'orders' && <OrdersTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'bundles' && <BundlesTab />}
          {tab === 'hero' && <HeroSlidesTab />}
          {tab === 'announcements' && <AnnouncementsTab />}
          {tab === 'testimonials' && <TestimonialsTab />}
          {tab === 'faqs' && <FaqsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </Container>
    </>
  );
}

function AdminLoginPrompt() {
  return (
    <Container size="sm">
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-primary">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold text-foreground">Admin Sign In</h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          Please sign in with an admin account to access the dashboard.
        </p>
        <Button asChild className="mt-6 rounded-full shadow-soft">
          <a href="/auth?redirect=admin">Sign In</a>
        </Button>
      </div>
    </Container>
  );
}

function OverviewTab() {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const [sumRes, prodRes, statusRes] = await Promise.all([
        supabase.rpc('get_admin_sales_summary'),
        supabase.rpc('get_admin_product_sales'),
        supabase.rpc('get_admin_order_status'),
      ]);

      if (sumRes.error || prodRes.error || statusRes.error) {
        setError('Could not load analytics. Please try again.');
      } else {
        const summaryData = Array.isArray(sumRes.data) ? sumRes.data[0] : sumRes.data;
        setSummary(summaryData as SalesSummary);
        setProductSales((prodRes.data as ProductSales[]) ?? []);
        setOrderStatus((statusRes.data as OrderStatusRow[]) ?? []);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<TrendingUp className="h-6 w-6" />}
        title="Could not load analytics"
        description={error}
      />
    );
  }

  const cards = [
    {
      label: 'Total Orders',
      value: summary?.total_orders ?? 0,
      icon: ShoppingCart,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Sales',
      value: formatPrice(summary?.total_sales ?? 0),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Avg Order Value',
      value: formatPrice(summary?.average_order_value ?? 0),
      icon: TrendingUp,
      color: 'text-secondary',
      bg: 'bg-secondary/15',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
            <p className="mt-4 font-heading text-2xl font-semibold text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-heading text-lg font-semibold text-foreground">Orders by Status</h2>
          {orderStatus.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {orderStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[row.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{row.order_count} orders</span>
                    <span className="font-medium text-foreground">{formatPrice(row.total_sales)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-heading text-lg font-semibold text-foreground">Top Products</h2>
          {productSales.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {productSales.slice(0, 5).map((p) => (
                <li key={p.product_id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.product_name}</p>
                    <p className="text-xs text-muted-foreground">{p.total_quantity_sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatPrice(p.total_sales)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderBundleItems, setOrderBundleItems] = useState<{
    id: string;
    bundle_name_snapshot: string;
    bundle_price_snapshot: number;
    bundle_quantity: number;
  }[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Could not load orders.');
    } else {
      setOrders(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

    const updateStatus = async (orderId: string, status: Order['status']) => {
    if (status === 'cancelled') {
      const { error } = await supabase.rpc('cancel_order', {
        p_order_id: orderId,
      });

      if (error) {
        toast({ title: 'Could not cancel order', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Order cancelled and stock restored' });
    } else {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        toast({ title: 'Could not update order status', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Order status updated' });
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setItemsLoading(true);
    const [itemsRes, bundleRes] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', order.id),
      supabase.from('order_bundle_items').select('*').eq('order_id', order.id)
    ]);

    setOrderItems(itemsRes.data ?? []);
    setOrderBundleItems(bundleRes.data ?? []);
    setItemsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<ShoppingCart className="h-6 w-6" />} title="Error" description={error} />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-6 w-6" />}
        title="No orders yet"
        description="Orders will appear here once customers start purchasing."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface/30">
                  <td className="px-4 py-3 text-sm font-mono text-foreground">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{order.customer_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => viewOrder(order)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Order ID</p>
                  <p className="font-mono text-foreground">{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Date</p>
                  <p className="text-foreground">{new Date(selectedOrder.created_at).toLocaleString('en-PH')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Customer</p>
                  <p className="text-foreground">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Email</p>
                  <p className="text-foreground">{selectedOrder.customer_email}</p>
                </div>
                {selectedOrder.customer_phone && (
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Phone</p>
                    <p className="text-foreground">{selectedOrder.customer_phone}</p>
                  </div>
                )}
                {selectedOrder.shipping_address && (
                  <div className="col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Shipping Address</p>
                    <p className="text-foreground">{selectedOrder.shipping_address}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-xs uppercase text-muted-foreground">Notes</p>
                    <p className="text-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">Items</p>
                {itemsLoading ? (
                  <div className="mt-2"><LoadingSpinner size="sm" /></div>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {orderItems.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                        <span className="font-medium text-foreground">{formatPrice(item.line_total)}</span>
                      </li>
                    ))}
                    {orderBundleItems.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.bundle_name_snapshot} × {item.bundle_quantity}</span>
                        <span className="font-medium text-foreground">{formatPrice(item.bundle_price_snapshot * item.bundle_quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="text-foreground">{formatPrice(selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-heading font-semibold text-foreground">Total</span>
                    <span className="font-heading font-semibold text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">Update Status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedOrder.status === s
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground/70 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<(Product & { categories?: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, category_id, brand, name, slug, sku, barcode, short_description,
        full_description, ingredients, benefits, price, sale_price, stock,
        low_stock_alert, weight, featured_image_url, published, featured,
        active, meta_title, meta_description, created_at, updated_at, unit,
        categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Could not load products.');
    } else {
      const formattedData = (data ?? []).map((p: any) => ({
        ...p,
        categories: Array.isArray(p.categories) ? p.categories[0] : p.categories
      }));
      setProducts(formattedData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete product', variant: 'destructive' });
      return;
    }
    toast({ title: 'Product deleted' });
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<Package className="h-6 w-6" />} title="Error" description={error} />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Products ({products.length})</h2>
        <Button
          className="rounded-full shadow-soft"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title="No products yet"
          description="Add your first product to the catalog."
          action={
            <Button className="rounded-full" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-surface/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-surface/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.categories?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatPrice(product.sale_price ?? product.price)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{product.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {product.published && <Badge variant="secondary" className="text-xs">Published</Badge>}
                        {product.active ? (
                          <Badge className="bg-success/15 text-success text-xs">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditing(product);
                            setShowForm(true);
                          }}
                          className="rounded-lg p-2 text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg p-2 text-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchProducts();
          }}
        />
      )}
    </>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5 MB.', variant: 'destructive' });
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (product) {
      const fetchPrimaryImage = async () => {
        const { data } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', product.id)
          .eq('is_primary', true)
          .eq('active', true)
          .maybeSingle();
        
        if (data) {
          setPreviewUrl(data.image_url);
        }
      };
      fetchPrimaryImage();
    }
  }, [product]);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    short_description: product?.short_description ?? '',
    full_description: product?.full_description ?? '',
    meta_title: product?.meta_title ?? '',
    meta_description: product?.meta_description ?? '',
    price: product?.price?.toString() ?? '',
    sale_price: product?.sale_price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    unit: product?.unit ?? '',
    brand: product?.brand ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    ingredients: product?.ingredients ?? '',
    benefits: product?.benefits ?? '',
    low_stock_alert: product?.low_stock_alert?.toString() ?? '10',
    weight: product?.weight?.toString() ?? '0',
    featured_image_url: product?.featured_image_url ?? '',
    featured: product?.featured ?? false,
    category_id: product?.category_id ?? '',
    published: product?.published ?? false,
    active: product?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price) {
      toast({ title: 'Name and price are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      short_description: form.short_description.trim() || null,
      full_description: form.full_description.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock) || 0,
      unit: form.unit.trim() || null,
      brand: form.brand.trim() || null,
      sku: form.sku.trim() || null,
      barcode: form.barcode.trim() || null,
      low_stock_alert: parseInt(form.low_stock_alert) || 0,
      weight: parseFloat(form.weight) || 0,
      featured_image_url: form.featured_image_url.trim() || null,
      featured: form.featured,
      ingredients: form.ingredients.trim() || null,
      benefits: form.benefits.trim() || null,
      category_id: form.category_id.trim() || null,
      published: form.published,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    const result = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() }).select('id').single();

    if (result.error) {
      setSaving(false);
      toast({ title: 'Could not save product', description: result.error.message, variant: 'destructive' });
      return;
    }

    const productId = result.data?.id || product?.id;

    if (productId && selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${productId}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);

        if (product) {
          const { error: updateError } = await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', productId);
          
          if (updateError) throw updateError;
        }

        const { error: insertError } = await supabase.from('product_images').insert({
          product_id: productId,
          image_url: publicUrl,
          image_type: 'primary',
          alt_text: `${form.name} product image`,
          is_primary: true,
          display_order: 0,
          active: true
        });

        if (insertError) throw insertError;

      } catch (err: any) {
        setSaving(false);
        toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
        return;
      }
    }

    setSaving(false);
    toast({ title: product ? 'Product updated' : 'Product created' });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">Slug (optional, auto-generated)</Label>
            <Input id="slug" name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea id="short_description" name="short_description" value={form.short_description} onChange={handleChange} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="full_description">Full Description</Label>
            <Textarea id="full_description" name="full_description" value={form.full_description} onChange={handleChange} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea id="ingredients" name="ingredients" value={form.ingredients} onChange={handleChange} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea id="benefits" name="benefits" value={form.benefits} onChange={handleChange} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (PHP) *</Label>
              <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sale_price">Sale Price (optional)</Label>
              <Input id="sale_price" name="sale_price" type="number" step="0.01" value={form.sale_price} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" value={form.stock} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" value={form.unit} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" value={form.brand} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" value={form.sku} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" name="barcode" value={form.barcode} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="low_stock_alert">Low Stock Alert</Label>
              <Input id="low_stock_alert" name="low_stock_alert" type="number" value={form.low_stock_alert} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="image">Featured Image</Label>
              <div className="mt-1.5 flex flex-col gap-3">
                {previewUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs truncate max-w-[120px]">{selectedFile?.name || 'Current image'}</span>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>Change</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" asChild>
                    <label>
                      Choose Image
                      <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                    </label>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(val) => setForm((prev) => ({ ...prev, category_id: val }))}
            >
              <SelectTrigger id="category_id" className="mt-1.5">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="h-4 w-4 rounded border-border" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="h-4 w-4 rounded border-border" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 rounded border-border" />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      setError('Could not load categories.');
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);

    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', deleting.id);

    if (countError) {
      toast({ title: 'Error checking products', variant: 'destructive' });
      setIsDeleting(false);
      return;
    }

    if (count && count > 0) {
      setIsDeleting(false);
      setDeleting(null);
    
      toast({
        title: 'Cannot delete category',
        description: 'This category has products assigned to it. Please move or reassign those products before deleting it.',
        variant: 'destructive',
      });
    
      return;
    }

    const { error } = await supabase.from('categories').delete().eq('id', deleting.id);
    setIsDeleting(false);

    if (error) {
      toast({ title: 'Could not delete category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted' });
      setDeleting(null);
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<Layers className="h-6 w-6" />} title="Error" description={error} />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Categories ({categories.length})</h2>
        <Button
          className="rounded-full shadow-soft"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-surface/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cat.description || '-'}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{cat.display_order}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.active ? 'default' : 'destructive'} className="text-xs">
                      {cat.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full p-0"
                        onClick={() => {
                          setEditing(cat);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive/90"
                        onClick={() => setDeleting(cat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{deleting?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchCategories();
          }}
        />
      )}
    </>
  );
}

function BundlesTab() {
  const [bundles, setBundles] = useState<(Bundle & { bundle_items?: (BundleItem & { product?: { name: string } })[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBundles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bundles')
      .select(`
        *,
        bundle_items (
          *,
          product:products (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setError('Could not load bundles.');
    } else {
      setBundles(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<PackageOpen className="h-6 w-6" />} title="Error" description={error} />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Bundles ({bundles.length})</h2>
        <Button
          className="rounded-full shadow-soft"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Bundle
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Items</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="transition-colors hover:bg-surface/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{bundle.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {formatPrice(bundle.bundle_price)}
                    <span className="ml-2 text-xs text-muted-foreground line-through">{formatPrice(bundle.regular_price)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={bundle.active ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}>
                      {bundle.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <ul className="list-disc list-inside">
                      {bundle.bundle_items?.map((item) => (
                        <li key={item.id}>
                          {item.product?.name} (×{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => {
                        setEditing(bundle);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <BundleForm
          bundle={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchBundles();
          }}
        />
      )}
    </>
  );
}

type ProductOption = { id: string; name: string };

type BundleFormState = {
  name: string;
  slug: string;
  description: string;
  regular_price: string;
  bundle_price: string;
  image_url: string;
  badge: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
};

function BundleForm({
  bundle,
  onClose,
  onSaved,
}: {
  bundle: Bundle | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BundleFormState>({
    name: bundle?.name ?? '',
    slug: bundle?.slug ?? '',
    description: bundle?.description ?? '',
    regular_price: bundle?.regular_price?.toString() ?? '',
    bundle_price: bundle?.bundle_price?.toString() ?? '',
    image_url: bundle?.image_url ?? '',
    badge: bundle?.badge ?? null,
    start_date: bundle?.start_date ?? '',
    end_date: bundle?.end_date ?? '',
    active: bundle?.active ?? true,
  });

  const [items, setItems] = useState<{ product_id: string; product_name: string; quantity: number }[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(bundle?.image_url ?? null);

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, itemRes] = await Promise.all([
        supabase.from('products').select('id, name').eq('active', true),
        bundle ? supabase.from('bundle_items').select('product_id, quantity, product:products(name)').eq('bundle_id', bundle.id) : Promise.resolve({ data: [] })
      ]);
      setProducts(prodRes.data ?? []);
      if (itemRes.data) {
        setItems(itemRes.data.map((i: any) => ({ product_id: i.product_id, product_name: i.product?.name ?? 'Unknown', quantity: i.quantity })));
      }
    };
    fetchData();
  }, [bundle]);

  const regPrice = parseFloat(form.regular_price) || 0;
  const bundlePrice = parseFloat(form.bundle_price) || 0;
  const discount = regPrice > 0 ? Math.max(0, Math.round(((regPrice - bundlePrice) / regPrice) * 100)) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5 MB.', variant: 'destructive' });
      return;
    }
    if (previewUrl && !previewUrl.startsWith('http')) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const addItem = () => {
    if (!selectedProductId || items.some(i => i.product_id === selectedProductId)) return;
    const p = products.find(p => p.id === selectedProductId);
    if (p) setItems([...items, { product_id: p.id, product_name: p.name, quantity: 1 }]);
    setSelectedProductId('');
  };

  const removeItem = (pid: string) => setItems(items.filter(i => i.product_id !== pid));

  const updateItemQty = (pid: string, qty: number) => {
    const q = Math.max(1, qty);
    setItems(items.map(i => i.product_id === pid ? { ...i, quantity: q } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reg = parseFloat(form.regular_price);
    const bun = parseFloat(form.bundle_price);
    if (reg < 0 || bun < 0 || bun > reg) {
      toast({ title: 'Invalid pricing', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Must add at least one item', variant: 'destructive' });
      return;
    }

    setSaving(true);
    let imageUrl = form.image_url.trim() || null;

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      regular_price: reg,
      bundle_price: bun,
      discount_percentage: discount,
      image_url: imageUrl,
      badge: form.badge || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      active: form.active,
    };

    let bundleId = bundle?.id;
    if (bundle) {
      const { error } = await supabase.from('bundles').update(payload).eq('id', bundle.id);
      if (error) { toast({ title: 'Update failed', variant: 'destructive' }); setSaving(false); return; }
      await supabase.from('bundle_items').delete().eq('bundle_id', bundle.id);
    } else {
      const { data, error } = await supabase.from('bundles').insert(payload).select('id').single();
      if (error || !data) { toast({ title: 'Creation failed', variant: 'destructive' }); setSaving(false); return; }
      bundleId = data.id;
    }

    if (selectedFile && bundleId) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `bundles/${bundleId}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        await supabase.from('bundles').update({ image_url: publicUrl }).eq('id', bundleId);
      } catch (err: any) {
        setSaving(false);
        toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' });
        return;
      }
    }

    const { error: itemError } = await supabase.from('bundle_items').insert(items.map(i => ({ bundle_id: bundleId, product_id: i.product_id, quantity: i.quantity })));
    if (itemError) { toast({ title: 'Items could not be saved', variant: 'destructive' }); setSaving(false); return; }

    setSaving(false);
    toast({ title: bundle ? 'Bundle updated' : 'Bundle created' });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{bundle ? 'Edit Bundle' : 'Add Bundle'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" value={form.name} onChange={handleChange} required /></div>
          <div><Label htmlFor="slug">Slug *</Label><Input id="slug" name="slug" value={form.slug} onChange={handleChange} required /></div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={form.description} onChange={handleChange} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Image</Label>
              <div className="mt-1.5 flex flex-col gap-3">
                {previewUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                    <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>Clear</Button>
                  </div>
                ) : (
                  <Button variant="outline" asChild><label>Choose Image<input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} /></label></Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="badge">Badge</Label>
              <Select value={form.badge ?? 'None'} onValueChange={(val) => setForm(f => ({ ...f, badge: val === 'None' ? null : val }))}>
                <SelectTrigger><SelectValue placeholder="Select a badge" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Best Seller">Best Seller</SelectItem>
                  <SelectItem value="Popular">Popular</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Limited">Limited</SelectItem>
                  <SelectItem value="Sale">Sale</SelectItem>
                  <SelectItem value="Bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="start_date">Start Date</Label><Input type="date" id="start_date" name="start_date" value={form.start_date ? form.start_date.split('T')[0] : ''} onChange={handleChange} /></div>
            <div><Label htmlFor="end_date">End Date</Label><Input type="date" id="end_date" name="end_date" value={form.end_date ? form.end_date.split('T')[0] : ''} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Reg Price</Label><Input type="number" name="regular_price" value={form.regular_price} onChange={handleChange} /></div>
            <div><Label>Bundle Price</Label><Input type="number" name="bundle_price" value={form.bundle_price} onChange={handleChange} /></div>
            <div><Label>Discount %</Label><Input value={discount + '%'} readOnly disabled /></div>
          </div>
          <div><Label>Items</Label>
            <div className="flex gap-2 mb-2"><Select value={selectedProductId} onValueChange={setSelectedProductId}><SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select><Button type="button" onClick={addItem}>Add</Button></div>
            <ul className="space-y-2">{items.map(i => <li key={i.product_id} className="flex gap-2 items-center text-sm">{i.product_name}<Input type="number" className="w-16" value={i.quantity} onChange={(e) => updateItemQty(i.product_id, parseInt(e.target.value))} /><Button type="button" variant="ghost" onClick={() => removeItem(i.product_id)}><Trash2 className="h-4 w-4" /></Button></li>)}</ul>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    icon: category?.icon ?? '',
    color: category?.color ?? '',
    featured: category?.featured ?? false,
    display_order: category?.display_order?.toString() ?? '0',
    active: category?.active ?? true,
    meta_title: category?.meta_title ?? '',
    meta_description: category?.meta_description ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: 'Name and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      description: form.description.trim() || null,
      icon: form.icon.trim() || null,
      color: form.color.trim() || null,
      featured: form.featured,
      display_order: parseInt(form.display_order) || 0,
      active: form.active,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const result = category
      ? await supabase.from('categories').update(payload).eq('id', category.id)
      : await supabase.from('categories').insert({ ...payload, created_at: new Date().toISOString() });

    setSaving(false);

    if (result.error) {
      toast({ title: category ? 'Could not update category' : 'Could not create category', description: result.error.message, variant: 'destructive' });
      return;
    }

    toast({ title: category ? 'Category updated' : 'Category created' });
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" name="slug" value={form.slug} onChange={handleChange} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon Name</Label>
              <Input id="icon" name="icon" value={form.icon} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" value={form.color} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input id="display_order" name="display_order" type="number" value={form.display_order} onChange={handleChange} className="mt-1.5" />
            </div>
            <div className="flex items-center gap-6 mt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="h-4 w-4 rounded border-border" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 rounded border-border" />
                Active
              </label>
            </div>
          </div>
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input id="meta_title" name="meta_title" value={form.meta_title} onChange={handleChange} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Input id="meta_description" name="meta_description" value={form.meta_description} onChange={handleChange} className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {category ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

