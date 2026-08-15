import { Outlet, Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { BRAND } from '@/constants';
import { useAuth } from '@/hooks/use-auth';

export function AdminLayout() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-card">
        <Container size="full">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-heading text-base font-semibold text-foreground">
                {BRAND.name} · Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to site
              </Link>
              {user && (
                <button
                  onClick={signOut}
                  className="text-sm text-muted-foreground transition-colors hover:text-destructive"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
