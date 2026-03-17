'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<string, string> = {
  info: 'bg-accent-muted border-border-accent text-accent',
  success: 'bg-success/10 border-success/30 text-success',
  warning: 'bg-secondary/10 border-secondary/30 text-secondary',
  error: 'bg-error/10 border-error/30 text-error',
};

const iconPaths: Record<string, string> = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 px-4 py-3 rounded-xl border',
        variantStyles[variant],
        className,
      )}
    >
      <svg
        className="w-5 h-5 shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPaths[variant]}
        />
      </svg>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm">{title}</p>
        )}
        <div className={cn('text-sm', title && 'mt-0.5 opacity-90')}>
          {children}
        </div>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
