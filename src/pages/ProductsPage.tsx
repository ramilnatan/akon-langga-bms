import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { PackageOpen, ShoppingBag } from 'lucide-react';
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Could not load products. Please try again later.');
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set) as string[];
  }, [products]);

  const filtered = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleAdd = async (product: Product) => {
    setAddingId(product.id);
    const { error } = await addToCart(product.id, 1);
    setAddingId(null);
    if (error) {
      toast({ title: 'Could not add to cart', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Added to cart', description: product.name });
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);

  return (
    <>
      <Helmet>
        <title>Products — AKON LANGGA</title>
        <meta name="description" content="Browse our herbal coffee and natural handmade skincare products." />
      </Helmet>
      <PageHeader
        eyebrow="Collection"
        title="Our Products"
        description="Herbal coffee, natural handmade skincare, and wellness essentials — crafted with care and intention."
      />
      <Section spacing="lg">
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="Could not load products"
            description={error}
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/">Return home</Link>
              </Button>
            }
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<PackageOpen className="h-6 w-6" />}
            title="Products coming soon"
            description="Our curated collection is being prepared. Please check back shortly."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/bundles">Explore Bundles</Link>
              </Button>
            }
          />
        ) : (
          <>
            {categories.length > 1 && (
              <div className="mb-10 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground/70 hover:border-primary hover:text-primary'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border text-foreground/70 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {filtered.map((product, i) => {
                const isOnSale = product.sale_price !== null && product.sale_price < product.price;
                const outOfStock = product.stock <= 0;
                return (
                  <motion.article
                    key={product.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                  >
                    <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-surface to-secondary/15">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card/70 text-primary shadow-soft backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                          <ShoppingBag className="h-8 w-8" aria-hidden="true" />
                        </span>
                      </div>
                      {isOnSale && (
                        <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground">
                          Sale
                        </Badge>
                      )}
                      {outOfStock && (
                        <Badge variant="destructive" className="absolute right-4 top-4">
                          Out of Stock
                        </Badge>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      {product.category && (
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-secondary">
                          {product.category}
                        </p>
                      )}
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        <Link to={`/products/${product.slug}`} className="transition-colors hover:text-primary">
                          {product.name}
                        </Link>
                      </h3>
                      {product.description && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-lg font-semibold text-primary">
                            {formatPrice(product.sale_price ?? product.price)}
                          </span>
                          {isOnSale && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full shadow-soft"
                          disabled={outOfStock || addingId === product.id}
                          onClick={() => handleAdd(product)}
                        >
                          {addingId === product.id ? (
                            <LoadingSpinner size="sm" className="mr-1" />
                          ) : (
                            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {outOfStock ? 'Sold Out' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
