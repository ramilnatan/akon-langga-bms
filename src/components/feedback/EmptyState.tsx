import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Container>
      <div
        className={cn(
          'mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-card',
          className
        )}
      >
        {icon && (
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-secondary">
            {icon}
          </div>
        )}
        <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Container>
  );
}
