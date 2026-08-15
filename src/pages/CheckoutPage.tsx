import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

export function CheckoutPage() {
  const { items, subtotal, sessionId, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || items.length === 0) return;

    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Please fill in your name and email', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.rpc('place_order', {
      p_session_id: sessionId,
      p_customer_name: form.name,
      p_customer_email: form.email,
      p_customer_phone: form.phone || null,
      p_shipping_address: form.address || null,
      p_notes: form.notes || null,
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Order failed',
        description: error.message.includes('no longer available')
          ? 'One or more items in your cart are no longer available.'
          : 'Could not place your order. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setOrderId(data as string);
    toast({ title: 'Order placed successfully!' });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orderId) {
    return (
      <>
        <Helmet>
          <title>Order Confirmed — AKON LANGGA</title>
        </Helmet>
        <Section spacing="lg">
          <Container size="md">
            <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-card">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground">
                Order Confirmed!
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Thank you for your order. We'll send a confirmation to your email shortly.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Order reference: <span className="font-mono font-medium text-foreground">{orderId.slice(0, 8)}</span>
              </p>
              <Button asChild className="mt-8 rounded-full shadow-soft">
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout — AKON LANGGA</title>
        </Helmet>
        <PageHeader
          eyebrow="Checkout"
          title="Your Cart is Empty"
          description="Add some products before proceeding to checkout."
        />
        <Section spacing="lg">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="No items to check out"
            description="Browse our collection and add items to your cart."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/products">Browse Products</Link>
              </Button>
            }
          />
        </Section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout — AKON LANGGA</title>
      </Helmet>
      <PageHeader
        eyebrow="Checkout"
        title="Complete Your Order"
        description="Review your items and provide your details to place the order."
      />
      <Section spacing="lg">
        <Container>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continue shopping
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">Customer Details</h2>
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Juan Dela Cruz"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="juan@example.com"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+63 9XX XXX XXXX"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street, City, Province, ZIP"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Order Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions..."
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full shadow-soft"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </form>

            <div>
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">Order Summary</h2>
                <ul className="mt-6 space-y-4">
                  {items.map((item) => {
                    const price = item.product.sale_price ?? item.product.price;
                    return (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
                          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <span className="text-sm text-muted-foreground">Calculated later</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-heading text-lg font-semibold text-foreground">Total</span>
                    <span className="font-heading text-lg font-semibold text-primary">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                {user && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Signed in as {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
