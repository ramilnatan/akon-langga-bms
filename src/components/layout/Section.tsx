import { cn } from '@/lib/utils';
import { Container } from './Container';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical padding scale. */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Background tone. */
  tone?: 'default' | 'surface' | 'muted';
  /** Constrain inner width with a Container. */
  contained?: boolean;
}

const spacingMap = {
  none: 'py-0',
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16',
  lg: 'py-20 sm:py-28',
} as const;

const toneMap = {
  default: 'bg-background',
  surface: 'bg-surface',
  muted: 'bg-muted/40',
} as const;

export function Section({
  spacing = 'lg',
  tone = 'default',
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], toneMap[tone], className)} {...props}>
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
