import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import type { HeroSlide } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useStoreSettings } from '@/context/StoreSettingsContext';

interface HeroProps {
  slides: HeroSlide[];
}

export function Hero({ slides }: HeroProps) {
  const { settings } = useStoreSettings();

  const renderSlide = (slide: HeroSlide | null, isFallback: boolean = false) => (
    <div className="relative grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:py-36">
      {/* Left side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-sm font-medium text-primary shadow-soft backdrop-blur-sm">
          <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
          {isFallback ? 'Organic Wellness' : slide?.badge || 'Organic Wellness'}
        </span>
        <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
          {isFallback ? 'Nourish from Within,' : slide?.title}
          {!isFallback && slide?.subtitle ? (
            <span className="block text-primary mt-2">{slide.subtitle}</span>
          ) : isFallback ? (
            <span className="block text-primary">Glow on the Outside.</span>
          ) : null}
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-balance">
          {isFallback
            ? `Discover handcrafted herbal coffee and natural handmade skincare created with care by ${settings.store_name} to support everyday wellness.`
            : slide?.description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isFallback ? (
            <>
              <Button asChild size="lg" className="rounded-full shadow-soft">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/about">Learn More</Link>
              </Button>
            </>
          ) : (
            slide?.button_text && slide?.button_url && (
              <Button
                asChild
                size="lg"
                className="rounded-full shadow-soft"
                variant={slide.button_style === 'primary' ? 'default' : 'outline'}
              >
                <Link
                  to={slide.button_url}
                  target={slide.opens_in_new_tab ? '_blank' : undefined}
                  rel={slide.opens_in_new_tab ? 'noopener noreferrer' : undefined}
                >
                  {slide.button_text}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )
          )}
        </div>
      </motion.div>

      {/* Right side - decorative placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        className="relative"
        aria-hidden="true"
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-2xl bg-secondary/30 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary/15 via-surface to-secondary/20 shadow-elevated backdrop-blur-sm"
        >
          {slide?.image_url ? (
            <img
              src={slide.image_url}
              alt={slide.title || 'Hero image'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <div className="absolute inset-6 rounded-[1.5rem] border border-white/30 bg-card/30 backdrop-blur-md" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 4, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 shadow-soft"
                >
                  <Leaf className="h-14 w-14 text-primary/60" />
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );

  if (slides.length === 0) {
    return renderSlide(null, true);
  }

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>{renderSlide(slide, false)}</CarouselItem>
        ))}
      </CarouselContent>
      {slides.length > 1 && (
        <>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </>
      )}
    </Carousel>
  );
}
