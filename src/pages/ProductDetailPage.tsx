import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Minus, Plus, PackageOpen, Check } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/services';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .eq('active', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setProduct(data as Product);
          setQuantity(1);
        }
        setLoading(false);
      });
  }, [slug]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

  const isOnSale = product?.sale_price !== null && product?.sale_price !== undefined && product.sale_price < product.price;
  const effectivePrice = product ? (product.sale_price ?? product.price) : 0;
  const outOfStock = product ? product.stock <= 0 : false;

  const handleAdd = async () => {
    if (!product) return;
    setAdding(true);
    const { error } = await addToCart(product.id, quantity);
    setAdding(false);
    if (error) {
      toast({ title: 'Could not add to cart', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Added to cart', description: `${quantity} × ${product.name}` });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setAdding(true);
    const { error } = await addToCart(product.id, quantity);
    setAdding(false);
    if (error) {
      toast({ title: 'Could not add to cart', description: error, variant: 'destructive' });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <Section spacing="lg">
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title="Product not found"
          description="The product you're looking for doesn't exist or may have been removed."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/products">Browse Products</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} — AKON LANGGA</title>
        <meta name="description" content={product.description ?? product.name} />
      </Helmet>
      <Section spacing="md">
        <Container>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to products
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-secondary/15 shadow-card"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-card/70 text-primary shadow-soft backdrop-blur-sm">
                  <ShoppingBag className="h-12 w-12" aria-hidden="true" />
                </span>
              </div>
              {isOnSale && (
                <Badge className="absolute left-6 top-6 bg-secondary text-secondary-foreground">
                  Sale
                </Badge>
              )}
              {outOfStock && (
                <Badge variant="destructive" className="absolute right-6 top-6">
                  Out of Stock
                </Badge>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="flex flex-col"
            >
              {product.category && (
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-secondary">
                  {product.category}
                </p>
              )}
              <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-heading text-3xl font-semibold text-primary">
                  {formatPrice(effectivePrice)}
                </span>
                {isOnSale && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              <div className="mt-6 flex items-center gap-2 text-sm">
                {outOfStock ? (
                  <span className="text-destructive">Out of stock</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-success">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    In stock ({product.stock} available)
                  </span>
                )}
              </div>

              {!outOfStock && (
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-border bg-card shadow-soft">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-full text-foreground/70 transition-colors hover:text-primary"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-r-full text-foreground/70 transition-colors hover:text-primary"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(effectivePrice * quantity)}
                  </span>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full shadow-soft"
                  disabled={outOfStock || adding}
                  onClick={handleAdd}
                >
                  {adding ? <LoadingSpinner size="sm" className="mr-2" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  disabled={outOfStock || adding}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>
    </>
  );
}
