import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — AKON LANGGA</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>
      <Container size="sm">
        <div className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <p className="font-heading text-7xl font-semibold text-primary sm:text-8xl">404</p>
          <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">
            Page not found
          </h1>
          <p className="mt-3 max-w-sm text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Back home
            </Link>
          </Button>
        </div>
      </Container>
    </>
  );
}
