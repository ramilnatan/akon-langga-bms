import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Leaf,
  Coffee,
  Sparkles,
  Heart,
  ShoppingBag,
  Package,
  Sprout,
  Recycle,
  MapPin,
  Star,
  Mail,
  MessageCircle,
} from 'lucide-react';
import type { Bundle, HeroSlide } from '@/types';
import { supabase } from '@/services';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStoreSettings } from '@/context/StoreSettingsContext';

const testimonials = [
  {
    name: 'Maria Santos',
    quote: 'The herbal coffee has become my morning ritual. I feel more balanced and energized every day.',
    initials: 'MS',
  },
  {
    name: 'Andrea Cruz',
    quote: 'My skin has never looked better. The handmade soap is so gentle and smells wonderful.',
    initials: 'AC',
  },
  {
    name: 'Jasmine Reyes',
    quote: 'You can feel the love and care in every product. AKON LANGGA is my go-to wellness brand.',
    initials: 'JR',
  },
];

const promises = [
  {
    icon: Sprout,
    title: '100% Natural Ingredients',
    description: 'Crafted from pure, thoughtfully sourced botanicals.',
  },
  {
    icon: Heart,
    title: 'Handcrafted with Love',
    description: 'Every product is made in small batches with care.',
  },
  {
    icon: Recycle,
    title: 'Eco-Friendly Packaging',
    description: 'Sustainable materials that respect the earth.',
  },
  {
    icon: MapPin,
    title: 'Made in the Philippines',
    description: 'Proudly locally made by AKON LANGGA.',
  },
];

const pillars = [
  {
    icon: Coffee,
    title: 'Herbal Coffee',
    description: 'Crafted blends that nourish from within, sip by sip.',
  },
  {
    icon: Sparkles,
    title: 'Natural Skincare',
    description: 'Handmade formulas for a healthy, radiant glow.',
  },
  {
    icon: Heart,
    title: 'Holistic Wellness',
    description: 'Thoughtful essentials for everyday self-care.',
  },
];

type Category = {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  display_order: number;
};

const iconMap: Record<string, React.ElementType> = {
  Coffee,
  Leaf,
  Sparkles,
  Heart,
  Package,
  Sprout,
  Recycle,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export function HomePage() {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const { settings } = useStoreSettings();

  useEffect(() => {
    async function fetchHeroSlides() {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('published', true)
        .eq('active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching hero slides:', error);
        return;
      }
      setHeroSlides(data || []);
    }

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setDbCategories(data || []);
    }

    async function fetchBundle() {
      const { data, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_items (
            *,
            product:products (*)
          )
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching bundle:', error);
        return;
      }

      setActiveBundle(data);
    }

    fetchHeroSlides();
    fetchCategories();
    fetchBundle();
  }, []);

  return (
    <>
      <Helmet>
        <title>{settings.store_name} — {settings.tagline}</title>
        <meta name="description" content={settings.seo_description || "An organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials."} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={settings.store_name} />
        <meta property="og:title" content={`${settings.store_name} — ${settings.tagline}`} />
        <meta property="og:description" content={settings.seo_description || "An organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials."} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${settings.store_name} — ${settings.tagline}`} />
        <meta name="twitter:description" content={settings.seo_description || "An organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials."} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface via-surface/60 to-background">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Container>
          <Hero slides={heroSlides} />
        </Container>
      </section>

      {/* Featured Categories */}
      <Section spacing="lg" tone="default">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Featured
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              Explore Our Collections
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
              Thoughtfully crafted products for your everyday wellness journey.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8">
            {dbCategories.map((category, i) => {
              const Icon = iconMap[category.icon] || Leaf;
              return (
                <motion.article
                  key={category.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated sm:p-10"
                >
                  {/* Soft gradient overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />

                  <div className="relative flex flex-col items-start">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 font-heading text-2xl font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                    <Button asChild variant="outline" className="mt-6 rounded-full">
                      <Link to={`/products?category=${category.slug}`}>
                        Shop Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Pillars */}
      <Section spacing="lg" tone="muted">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="rounded-2xl border border-border bg-card p-8 shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary">
                  <pillar.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Bundle & Save */}
      {activeBundle && (
        <Section spacing="lg" tone="muted">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center"
            >
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
                Bundles
              </p>
              <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
                Bundle &amp; Save
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
                Complete wellness combinations carefully prepared for you.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 sm:gap-8">
              <motion.article
                custom={0}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="group grid items-center gap-6 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated sm:p-8 lg:grid-cols-2 lg:gap-10"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-secondary/20">
                  {activeBundle.image_url ? (
                    <img
                      src={activeBundle.image_url}
                      alt={activeBundle.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-card/70 text-primary shadow-soft backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                        <Package className="h-10 w-10" aria-hidden="true" />
                      </span>
                    </div>
                  )}
                  {activeBundle.badge && (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      {activeBundle.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading text-2xl font-semibold text-foreground">
                    {activeBundle.name}
                  </h3>
                  {activeBundle.description && (
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {activeBundle.description}
                    </p>
                  )}
                  {activeBundle.start_date && activeBundle.end_date ? (
                    <p className="mt-2 text-sm font-medium text-secondary">
                      Available {new Date(activeBundle.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(activeBundle.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  ) : activeBundle.start_date ? (
                    <p className="mt-2 text-sm font-medium text-secondary">
                      Available from {new Date(activeBundle.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  ) : activeBundle.end_date ? (
                    <p className="mt-2 text-sm font-medium text-secondary">
                      Available until {new Date(activeBundle.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {activeBundle.bundle_items?.map((item) => (
                        <li key={item.id}>
                          {item.product?.name} &times; {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="text-lg font-semibold text-primary">
                      ₱{activeBundle.bundle_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ₱{activeBundle.regular_price.toLocaleString()}
                    </span>
                    {activeBundle.discount_percentage && (
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-secondary">
                        {activeBundle.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="mt-6">
                    <Button asChild className="rounded-full shadow-soft">
                      <Link to="/bundles">
                        View Bundle
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            </div>
          </Container>
        </Section>
      )}

      {/* Why Choose AKON LANGGA */}
      <Section spacing="lg" tone="default">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Our Promise
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              Why Choose AKON LANGGA
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            {promises.map((promise, i) => (
              <motion.div
                key={promise.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="group rounded-2xl border border-border/60 bg-card p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110">
                  <promise.icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">
                  {promise.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {promise.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section spacing="lg" tone="muted">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Testimonials
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              What Our Customers Say
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
              Real experiences from customers who trust AKON LANGGA.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.article
                key={testimonial.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="group flex flex-col rounded-3xl border border-border/60 bg-card/70 p-8 shadow-card backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground shadow-soft">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="font-heading text-base font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <div className="mt-1 flex gap-0.5" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-3.5 w-3.5 fill-secondary text-secondary"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Newsletter */}
      <Section spacing="lg" tone="default">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/10 via-surface to-secondary/15 p-8 shadow-elevated backdrop-blur-sm sm:p-12 lg:p-16"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

            <div className="relative mx-auto max-w-xl text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
                <Mail className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
                Join the {settings.store_name} Community
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
                Receive wellness tips, product launches, and exclusive offers.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className="h-12 flex-1 rounded-full border-border bg-card/80 shadow-soft"
                />
                <Button type="submit" size="lg" className="h-12 rounded-full shadow-soft">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </form>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Contact CTA */}
      <Section spacing="lg" tone="muted">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-center shadow-elevated sm:px-12 sm:py-20"
          >
            <div className="pointer-events-none absolute -left-12 top-0 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15 text-primary-foreground shadow-soft">
                <MessageCircle className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-heading text-3xl font-semibold text-primary-foreground sm:text-4xl text-balance">
                Have Questions?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80 text-balance">
                We&rsquo;re always happy to help you choose the right wellness products.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" variant="secondary" className="rounded-full shadow-soft">
                  <Link to="/contact">
                    Contact Us
                    <MessageCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link to="/products">
                    Shop Now
                    <ShoppingBag className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
