import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { supabase } from '@/services';
import type { Faq } from '@/types';

export function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const { data, error } = await supabase
          .from('faq')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('[FaqPage]', error);
          return;
        }

        setFaqs(data ?? []);
      } catch (err) {
        console.error('[FaqPage]', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  return (
    <>
      <Helmet>
        <title>FAQ — AKON LANGGA</title>
        <meta name="description" content="Frequently asked questions about AKON LANGGA products and orders." />
      </Helmet>
      <PageHeader
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Answers to common questions about our products, orders, and wellness rituals."
      />
      <Section spacing={faqs.length > 0 ? 'lg' : 'sm'}>
        <Container size="md">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left font-heading text-lg text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="-mt-3 text-center text-muted-foreground">
              We're preparing answers to your most common questions. Please check back soon.
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
