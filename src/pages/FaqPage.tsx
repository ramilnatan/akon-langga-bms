import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Are your products all-natural?',
    answer: 'Yes. Our products are crafted with naturally sourced ingredients, free from harsh chemicals.',
  },
  {
    question: 'Do you ship nationwide?',
    answer: 'Shipping details will be provided once our store is fully launched.',
  },
  {
    question: 'How should I store herbal coffee?',
    answer: 'Keep it in a cool, dry place, sealed to preserve freshness.',
  },
  {
    question: 'Are your skincare products handmade?',
    answer: 'Yes — every skincare item is handmade in small batches with care.',
  },
];

export function FaqPage() {
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
      <Section spacing="lg">
        <Container size="md">
          {/* TODO: FAQ content will be managed via Supabase in a later phase. */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-heading text-lg text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>
    </>
  );
}
