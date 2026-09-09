import { Link } from 'react-router-dom';
import { Leaf, Facebook, MessageCircle, Phone } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { COPYRIGHT, FOOTER_LINKS } from '@/constants';

export function Footer() {
  const { settings } = useStoreSettings();

  const socialLinks = [
    { label: 'Facebook', href: settings.facebook_url, icon: Facebook },
    { label: 'Messenger', href: settings.messenger_url, icon: MessageCircle },
    { label: 'WhatsApp', href: settings.whatsapp, icon: Phone },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5" aria-label={`${settings.store_name} home`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">
                {settings.store_name}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {settings.tagline}
            </p>
            <ul className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href as string}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                  >
                    <social.icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Shop
            </h2>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Company
            </h2>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 pb-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Design &amp; Developed by:{' '}
              <span className="font-semibold text-primary">Engr. Ramil V. Natan</span>
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Powered by: <span className="font-semibold text-primary">Salve</span>
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">{COPYRIGHT}</p>
            <p className="text-xs text-muted-foreground">
              Organic Wellness · Herbal Coffee · Natural Handmade Skincare
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
