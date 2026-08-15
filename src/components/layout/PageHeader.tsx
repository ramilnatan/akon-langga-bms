import { cn } from '@/lib/utils';
import { Container } from './Container';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  align = 'center',
  className,
}: PageHeaderProps) {
  return (
    <section className="bg-surface pt-20 pb-16 sm:pt-28 sm:pb-20">
      <Container>
        <div
          className={cn(
            'max-w-2xl',
            align === 'center' && 'mx-auto text-center',
            className
          )}
        >
          {eyebrow && (
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl font-heading font-semibold text-foreground sm:text-5xl lg:text-6xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
