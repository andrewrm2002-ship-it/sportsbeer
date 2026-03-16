'use client';

import { cn } from '@/lib/utils';

interface ProgressData {
  sport: string;
  sportIcon: string;
  current: number;
  total: number;
  status: 'processing' | 'complete' | 'error';
  message?: string;
}

interface GenerationProgressProps {
  progress: ProgressData;
}

export function GenerationProgress({ progress }: GenerationProgressProps) {
  const percentage = progress.total === 0 ? 0 : Math.round((progress.current / progress.total) * 100);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Generation Progress
        </h3>
        <span className="text-xs font-mono text-text-muted">
          {progress.current}/{progress.total} sports
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-bg-input rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-secondary rounded-full progress-bar transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Current Sport */}
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg',
          progress.status === 'processing'
            ? 'bg-accent-muted'
            : progress.status === 'error'
              ? 'bg-error/10'
              : 'bg-success/10'
        )}
      >
        <span className="text-2xl">{progress.sportIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {progress.sport}
          </p>
          <p className="text-xs text-text-muted">
            {progress.status === 'processing'
              ? 'Brewing articles...'
              : progress.status === 'complete'
                ? 'Done!'
                : progress.message || 'Error occurred'}
          </p>
        </div>
        {progress.status === 'processing' && (
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Percentage */}
      <p className="text-center text-xs text-text-muted">
        {percentage}% complete
      </p>
    </div>
  );
}
