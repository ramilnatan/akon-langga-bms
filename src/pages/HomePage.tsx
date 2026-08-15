import { useState } from 'react';
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
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BRAND } from '@/constants';

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

const bestSellers = [
  {
    name: 'Herbal Coffee Blend',
    description: 'A rich, aromatic blend of handpicked herbs for daily wellness.',
    price: '₱249.00',
    icon: Coffee,
  },
  {
    name: 'Rose Glow Handmade Soap',
    description: 'Gentle botanical soap that cleanses and nourishes the skin.',
    price: '₱129.00',
    icon: Sparkles,
  },
  {
    name: 'Botanical Skincare Set',
    description: 'A curated trio of handmade skincare for a radiant complexion.',
    price: '₱399.00',
    icon: Leaf,
  },
];

const bundles = [
  {
    title: 'Wellness Morning Ritual',
    description: 'Start your day with our herbal coffee and a glowing skincare routine.',
    savings: 'Save ₱120',
    icon: Coffee,
  },
  {
    title: 'Glow & Care Bundle',
    description: 'A complete set of handmade soaps and botanical skincare essentials.',
    savings: 'Save ₱180',
    icon: Sparkles,
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

const categories = [
  {
    icon: Coffee,
    title: 'Herbal Coffee',
    description: 'Premium herbal coffee blends made from natural ingredients.',
    button: 'View Products',
    href: '/products',
  },
  {
    icon: Sparkles,
    title: 'Natural Handmade Skincare',
    description: 'Gentle handmade soaps and skincare crafted with care.',
    button: 'Explore Skincare',
    href: '/products',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>{BRAND.name} — {BRAND.tagline}</title>
        <meta name="description" content={BRAND.description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={BRAND.name} />
        <meta property="og:title" content={`${BRAND.name} — ${BRAND.tagline}`} />
        <meta property="og:description" content={BRAND.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${BRAND.name} — ${BRAND.tagline}`} />
        <meta name="twitter:description" content={BRAND.description} />
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
          <div className="relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:py-36">
            {/* Left side */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-sm font-medium text-primary shadow-soft backdrop-blur-sm">
                <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                Organic Wellness
              </span>
              <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Nourish from Within,
                <span className="block text-primary">Glow on the Outside.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-balance">
                Discover handcrafted herbal coffee and natural handmade skincare created with care by AKON LANGGA to support everyday wellness.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full shadow-soft">
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right side - image placeholder card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
              className="relative"
              aria-hidden="true"
            >
              {/* Decorative outer shapes */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl bg-secondary/30 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-surface to-secondary/20 shadow-elevated backdrop-blur-sm"
              >
                {/* Inner glassmorphism ring */}
                <div className="absolute inset-6 rounded-[1.5rem] border border-white/30 bg-card/30 backdrop-blur-md" />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 shadow-soft"
                  >
                    <Leaf className="h-14 w-14 text-primary/60" />
                  </motion.div>
                </div>
                {/* Floating accent dots */}
                <motion.span
                  animate={{ y: [0, -14, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute right-10 top-12 h-3 w-3 rounded-full bg-secondary/70"
                />
                <motion.span
                  animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-14 left-12 h-2.5 w-2.5 rounded-full bg-primary/60"
                />
                <motion.span
                  animate={{ x: [0, 10, 0], opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute right-16 bottom-20 h-2 w-2 rounded-full bg-accent/70"
                />
              </motion.div>
            </motion.div>
          </div>
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
            {categories.map((category, i) => (
              <motion.article
                key={category.title}
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
                    <category.icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-heading text-2xl font-semibold text-foreground">
                    {category.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                  <Button asChild variant="outline" className="mt-6 rounded-full">
                    <Link to={category.href}>
                      {category.button}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            ))}
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

      {/* Best Sellers */}
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
              Best Sellers
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl text-balance">
              Best Sellers
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-balance">
              Our most loved handcrafted wellness products.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {bestSellers.map((product, i) => (
              <motion.article
                key={product.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-surface to-secondary/15">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card/70 text-primary shadow-soft backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <product.icon className="h-8 w-8" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-heading text-lg font-semibold text-primary">
                      {product.price}
                    </span>
                    <Button asChild size="sm" className="rounded-full shadow-soft">
                      <Link to="/products">
                        Shop Now
                        <ShoppingBag className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Bundle & Save */}
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
            {bundles.map((bundle, i) => (
              <motion.article
                key={bundle.title}
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
                      <bundle.icon className="h-10 w-10" aria-hidden="true" />
                    </span>
                  </div>
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {bundle.savings}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-heading text-2xl font-semibold text-foreground">
                    {bundle.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {bundle.description}
                  </p>
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
            ))}
          </div>
        </Container>
      </Section>

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
                Join the AKON LANGGA Community
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
