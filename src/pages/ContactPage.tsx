import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { BRAND } from '@/constants';

const details = [
  { icon: Mail, label: 'Email', value: BRAND.email },
  { icon: Phone, label: 'Phone', value: BRAND.phone },
  { icon: MapPin, label: 'Location', value: BRAND.address },
];

export function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact — AKON LANGGA</title>
        <meta name="description" content="Get in touch with the AKON LANGGA team." />
      </Helmet>
      <PageHeader
        eyebrow="Say Hello"
        title="Contact Us"
        description="We'd love to hear from you. Reach out with any questions about our products or your wellness journey."
      />
      <Section spacing="lg">
        <Container size="md">
          <div className="grid gap-4 sm:grid-cols-3">
            {details.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-card"
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
                  <d.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {d.label}
                </p>
                <p className="mt-1 text-sm text-foreground">{d.value}</p>
              </div>
            ))}
          </div>
          {/* TODO: Contact form (react-hook-form + zod) will be implemented in a later phase. */}
        </Container>
      </Section>
    </>
  );
}
