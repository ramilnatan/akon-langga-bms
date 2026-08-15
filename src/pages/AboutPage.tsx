import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Leaf, Heart, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { BRAND } from '@/constants';

const values = [
  { icon: Leaf, title: 'Organic', description: 'Naturally sourced ingredients, free from harsh chemicals.' },
  { icon: Heart, title: 'Handmade', description: 'Small-batch craftsmanship with care in every detail.' },
  { icon: Sparkles, title: 'Mindful', description: 'Formulated with intention for everyday wellness.' },
];

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About — AKON LANGGA</title>
        <meta name="description" content="The story behind AKON LANGGA — organic wellness, herbal coffee, and natural handmade skincare." />
      </Helmet>
      <PageHeader
        eyebrow="Our Story"
        title="About AKON LANGGA"
        description={BRAND.description}
      />
      <Section spacing="lg">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8 text-center shadow-card"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary">
                  <value.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-heading text-xl font-semibold text-foreground">
                  {value.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
