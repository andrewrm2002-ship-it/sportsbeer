import { cn } from '@/lib/utils';

interface BadgeBaseProps {
  size?: 'sm' | 'md';
  className?: string;
}

interface SportBadgeProps extends BadgeBaseProps {
  variant: 'sport';
  icon: string;
  name: string;
}

interface CategoryBadgeProps extends BadgeBaseProps {
  variant: 'category';
  children: React.ReactNode;
}

interface StatusBadgeProps extends BadgeBaseProps {
  variant: 'status';
  status: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
}

interface CountBadgeProps extends BadgeBaseProps {
  variant: 'count';
  count: number;
}

type BadgeProps =
  | SportBadgeProps
  | CategoryBadgeProps
  | StatusBadgeProps
  | CountBadgeProps;

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

const statusColors: Record<string, string> = {
  success: 'bg-success/15 text-success border-success/30',
  error: 'bg-error/15 text-error border-error/30',
  info: 'bg-accent-muted text-accent border-border-accent',
  warning: 'bg-secondary/15 text-secondary border-secondary/30',
};

export function Badge(props: BadgeProps) {
  const { variant, size = 'md', className } = props;

  const base = cn(
    'inline-flex items-center font-medium rounded-full border',
    sizeStyles[size],
  );

  switch (variant) {
    case 'sport':
      return (
        <span
          className={cn(
            base,
            'gap-1.5 bg-bg-primary/80 backdrop-blur-sm text-accent border-accent/20',
            className,
          )}
        >
          <span>{props.icon}</span>
          {props.name}
        </span>
      );

    case 'category':
      return (
        <span
          className={cn(
            base,
            'uppercase tracking-wider font-semibold bg-secondary/90 text-text-primary border-secondary/30',
            className,
          )}
        >
          {props.children}
        </span>
      );

    case 'status':
      return (
        <span
          className={cn(base, statusColors[props.status], className)}
        >
          {props.children}
        </span>
      );

    case 'count':
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center font-bold rounded-full bg-accent text-bg-primary border border-accent/30',
            size === 'sm' ? 'min-w-[18px] h-[18px] text-[10px] px-1' : 'min-w-[22px] h-[22px] text-xs px-1.5',
            className,
          )}
        >
          {props.count}
        </span>
      );
  }
}
