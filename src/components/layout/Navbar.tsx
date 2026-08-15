import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV, BRAND } from '@/constants';
import { Container } from '@/components/layout/Container';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'glass border-b border-border/60 shadow-soft' : 'bg-transparent'
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between sm:h-20" aria-label="Primary">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {BRAND.name}
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <CartDrawer />

            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-primary hover:text-primary sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <Container>
              <ul className="flex flex-col gap-1 py-4">
                {PRIMARY_NAV.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground/80 hover:bg-primary/5 hover:text-primary'
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li>
                  {user ? (
                    <button
                      onClick={() => { signOut(); setOpen(false); }}
                      className="mt-2 flex w-full items-center gap-2 rounded-lg border border-border px-4 py-3 text-base font-medium text-foreground/80"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className="mt-2 flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-base font-medium text-foreground/80"
                    >
                      Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
