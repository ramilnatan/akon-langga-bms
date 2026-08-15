import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Gift, ShoppingBag, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/services';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export function BundlesPage() {
  const [bundles, setBundles] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .eq('active', true)
        .ilike('category', '%Bundles%')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Could not load bundles. Please try again later.');
      } else {
        setBundles(data ?? []);
      }
      setLoading(false);
    };
    fetchBundles();
  }, []);

  const handleAdd = async (bundle: Product) => {
    setAddingId(bundle.id);
    const { error } = await addToCart(bundle.id, 1);
    setAddingId(null);
    if (error) {
      toast({ title: 'Could not add to cart', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Added to cart', description: bundle.name });
    }
  };

  return (
    <>
      <Helmet>
        <title>Bundles — AKON LANGGA</title>
        <meta name="description" content="Curated wellness bundles for your daily self-care ritual." />
      </Helmet>
      <PageHeader
        eyebrow="Curated Sets"
        title="Wellness Bundles"
        description="Thoughtfully paired essentials for a complete wellness ritual — at a gentle value."
      />
      <Section spacing="lg">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="Could not load bundles"
            description={error}
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/products">View Products</Link>
              </Button>
            }
          />
        ) : bundles.length === 0 ? (
          <EmptyState
            icon={<Gift className="h-6 w-6" />}
            title="Bundles coming soon"
            description="We're curating the perfect sets for you. Please check back shortly."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/products">View Products</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:gap-8">
            {bundles.map((bundle, i) => {
              const isOnSale = bundle.sale_price !== null && bundle.sale_price < bundle.price;
              const savings = isOnSale ? bundle.price - (bundle.sale_price as number) : 0;
              const outOfStock = bundle.stock <= 0;
              return (
                <motion.article
                  key={bundle.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  className={`group grid items-center gap-6 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated sm:p-8 lg:grid-cols-2 lg:gap-10 ${
                    i % 2 === 1 ? 'lg:[&>div:first-child]:order-2' : ''
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-secondary/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-card/70 text-primary shadow-soft backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Gift className="h-10 w-10" aria-hidden="true" />
                      </span>
                    </div>
                    {isOnSale && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                        Save {formatPrice(savings)}
                      </span>
                    )}
                    {outOfStock && (
                      <Badge variant="destructive" className="absolute left-4 top-4">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-heading text-2xl font-semibold text-foreground">
                      {bundle.name}
                    </h3>
                    {bundle.description && (
                      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        {bundle.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-baseline gap-3">
                      <span className="font-heading text-2xl font-semibold text-primary">
                        {formatPrice(bundle.sale_price ?? bundle.price)}
                      </span>
                      {isOnSale && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(bundle.price)}
                        </span>
                      )}
                    </div>
                    <div className="mt-6">
                      <Button
                        className="rounded-full shadow-soft"
                        disabled={outOfStock || addingId === bundle.id}
                        onClick={() => handleAdd(bundle)}
                      >
                        {addingId === bundle.id ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <ShoppingBag className="mr-2 h-4 w-4" />
                        )}
                        {outOfStock ? 'Sold Out' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
