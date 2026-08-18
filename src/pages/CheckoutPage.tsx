import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(price);

type PlaceOrderResult = {
  order_id: string;
  order_number: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
};

export function CheckoutPage() {
  const { items, subtotal, sessionId, loading, refreshCart } = useCart();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [orderResult, setOrderResult] = useState<PlaceOrderResult | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  /*
   * Load the current store shipping fee.
   *
   * The admin controls this value through store_settings.
   * The RPC independently reads the same value when the order
   * is actually created.
   */
  useEffect(() => {
    let cancelled = false;

    const loadShippingFee = async () => {
      setShippingLoading(true);

      const { data, error } = await supabase
        .from('store_settings')
        .select('shipping_fee')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to load shipping fee:', error);

        toast({
          title: 'Shipping fee unavailable',
          description:
            'We could not load the current shipping fee. Please try again.',
          variant: 'destructive',
        });

        setShippingFee(0);
      } else {
        setShippingFee(Number(data?.shipping_fee ?? 0));
      }

      setShippingLoading(false);
    };

    loadShippingFee();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId || items.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Please add a product before checking out.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      toast({
        title: 'Missing customer details',
        description: 'Please provide your full name and email.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.phone.trim()) {
      toast({
        title: 'Phone number required',
        description:
          'Please provide a phone number so we can contact you about your order.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.address.trim()) {
      toast({
        title: 'Shipping address required',
        description: 'Please provide your complete shipping address.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.rpc('place_order', {
      p_session_id: sessionId,
      p_customer_name: form.name.trim(),
      p_customer_email: form.email.trim(),
      p_customer_phone: form.phone.trim(),
      p_shipping_address: form.address.trim(),
      p_notes: form.notes.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      console.error('place_order failed:', error);

      let description = 'Could not place your order. Please try again.';

      if (error.message.includes('no longer available')) {
        description =
          'One or more items in your cart are no longer available.';
      } else if (error.message.includes('exceeds available stock')) {
        description = error.message;
      } else if (error.message.includes('Cart session')) {
        description =
          'Your cart session has expired. Please refresh the page and try again.';
      } else if (error.message.includes('Access denied')) {
        description =
          'This cart belongs to another session. Please refresh the page and try again.';
      } else if (error.message) {
        description = error.message;
      }

      toast({
        title: 'Order failed',
        description,
        variant: 'destructive',
      });

      return;
    }

    if (!data) {
      toast({
        title: 'Order failed',
        description: 'The order was not created. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const result = data as unknown as PlaceOrderResult;

    await refreshCart();
    setOrderResult(result);

    toast({
      title: 'Order placed successfully!',
      description: `Order ${result.order_number}`,
    });
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /*
   * Order confirmation
   */
  if (orderResult) {
    return (
      <>
        <Helmet>
          <title>Order Confirmed — AKON LANGGA</title>
        </Helmet>

        <Section spacing="lg">
          <Container size="md">
            <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-card sm:px-8 sm:py-16">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2
                  className="h-8 w-8"
                  aria-hidden="true"
                />
              </span>

              <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground">
                Order Confirmed!
              </h1>

              <p className="mt-3 leading-relaxed text-muted-foreground">
                Thank you for your order. We have received your order details
                and will contact you regarding delivery.
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                Order reference:
              </p>

              <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                {orderResult.order_number}
              </p>

              <div className="mt-6 w-full rounded-2xl bg-surface p-5 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal
                  </span>

                  <span className="font-medium text-foreground">
                    {formatPrice(Number(orderResult.subtotal))}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping
                  </span>

                  <span className="font-medium text-foreground">
                    {formatPrice(Number(orderResult.shipping_fee))}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-lg font-semibold text-foreground">
                    Total
                  </span>

                  <span className="font-heading text-lg font-semibold text-primary">
                    {formatPrice(Number(orderResult.total))}
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="mt-8 rounded-full shadow-soft"
              >
                <Link to="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  /*
   * Empty cart
   */
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
              <Button
                asChild
                variant="outline"
                className="rounded-full"
              >
                <Link to="/products">
                  Browse Products
                </Link>
              </Button>
            }
          />
        </Section>
      </>
    );
  }

  /*
   * Checkout page
   */
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
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Continue shopping
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Customer Details */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Customer Details
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Full Name *
                    </Label>

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
                    <Label htmlFor="email">
                      Email *
                    </Label>

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
                    <Label htmlFor="phone">
                      Phone *
                    </Label>

                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+63 9XX XXX XXXX"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Shipping Address *
                    </Label>

                    <Textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="Street, City, Province, ZIP"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">
                      Order Notes
                    </Label>

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
                disabled={submitting || shippingLoading}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner
                      size="sm"
                      className="mr-2"
                    />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Lock
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    Place Order
                  </>
                )}
              </Button>
            </form>

            {/* Order Summary */}
            <div>
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Order Summary
                </h2>

                <ul className="mt-6 space-y-4">
                  {items.map((item) => {
                    const price =
                      item.product.sale_price ??
                      item.product.price;

                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
                          <ShoppingBag
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.product.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-foreground">
                          {formatPrice(
                            Number(price) * item.quantity,
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>

                    <span className="font-medium text-foreground">
                      {formatPrice(Number(subtotal))}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Shipping
                    </span>

                    <span className="font-medium text-foreground">
                      {shippingLoading
                        ? 'Loading...'
                        : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="font-heading text-lg font-semibold text-foreground">
                      Total
                    </span>

                    <span className="font-heading text-lg font-semibold text-primary">
                      {shippingLoading
                        ? 'Loading...'
                        : formatPrice(
                            Number(subtotal) + shippingFee,
                          )}
                    </span>
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