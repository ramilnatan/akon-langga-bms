import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width scale. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const;

export function Container({ size = 'xl', className, ...props }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-6 sm:px-8 lg:px-12', sizeMap[size], className)} {...props} />
  );
}
