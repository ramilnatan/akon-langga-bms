import { useStoreSettings } from '@/context/StoreSettingsContext';
import { supabase } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Phone, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name is too long.'),
  email: z.string().trim().email('Please enter a valid email address.').max(255, 'Email is too long.'),
  phone: z.string().trim().max(50, 'Phone number is too long.'),
  subject: z.string().trim().min(1, 'Subject is required.').max(200, 'Subject is too long.'),
  message: z.string().trim().min(1, 'Message is required.').max(5000, 'Message is too long.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactPage() {
  const { settings } = useStoreSettings();

  const details = [
    { icon: Mail, label: 'Email', value: settings.email },
    { icon: Phone, label: 'Phone', value: settings.primary_phone },
    { icon: MapPin, label: 'Location', value: settings.address },
  ];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const { error } = await supabase.from('contact_messages').insert({
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      subject: values.subject,
      message: values.message,
    });

    if (error) {
      toast({
        title: 'Could not send message',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Message sent',
      description: 'Thank you for contacting us. We will get back to you soon.',
    });

    form.reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact - {settings.store_name}</title>
        <meta
          name="description"
          content={`Get in touch with the ${settings.store_name} team.`}
        />
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

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Send Us a Message
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you as soon as we can.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message here..."
                          className="min-h-[140px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-full shadow-soft"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Container>
      </Section>
    </>
  );
}
