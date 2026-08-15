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
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { Product, Order, OrderItem, SalesSummary, ProductSales, OrderStatusRow } from '@/types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

type Tab = 'overview' | 'orders' | 'products';

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
        setSummary(sumRes.data as SalesSummary);
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
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Could not update order status', variant: 'destructive' });
      return;
    }

    toast({ title: 'Order status updated' });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const viewOrder = async (order: Order) => {
    setSelectedOrder(order);
    setItemsLoading(true);
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    setOrderItems(data ?? []);
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
                  </ul>
                )}
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <span className="font-heading font-semibold text-foreground">Total</span>
                  <span className="font-heading font-semibold text-primary">{formatPrice(selectedOrder.total)}</span>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError('Could not load products.');
    } else {
      setProducts(data ?? []);
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
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category ?? '-'}</td>
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
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    sale_price: product?.sale_price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    category: product?.category ?? '',
    published: product?.published ?? false,
    active: product?.active ?? true,
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

    if (!form.name.trim() || !form.price) {
      toast({ title: 'Name and price are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const slug = form.slug.trim() || generateSlug(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock) || 0,
      category: form.category.trim() || null,
      published: form.published,
      active: form.active,
      updated_at: new Date().toISOString(),
    };

    const result = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() });

    setSaving(false);

    if (result.error) {
      toast({ title: 'Could not save product', description: result.error.message, variant: 'destructive' });
      return;
    }

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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={form.description} onChange={handleChange} className="mt-1.5" />
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
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" value={form.category} onChange={handleChange} className="mt-1.5" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="h-4 w-4 rounded border-border" />
              Published
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
