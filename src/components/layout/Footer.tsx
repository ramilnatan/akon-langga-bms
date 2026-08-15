import { Link } from 'react-router-dom';
import { Leaf, Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { BRAND, COPYRIGHT, FOOTER_LINKS, SOCIAL_LINKS } from '@/constants';

const socialIcon = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-lg font-semibold text-foreground">
                {BRAND.name}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {BRAND.tagline}
            </p>
            <ul className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcon[social.icon];
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
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
              {BRAND.category}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
