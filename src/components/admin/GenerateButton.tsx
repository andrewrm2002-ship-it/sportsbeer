'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GenerationProgress } from './GenerationProgress';
import { useToast } from '@/components/providers/ToastProvider';

interface ProgressData {
  sport: string;
  sportIcon: string;
  current: number;
  total: number;
  status: 'processing' | 'complete' | 'error';
  message?: string;
}

export function GenerateButton() {
  const router = useRouter();
  const { addToast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setProgress(null);
    setResult(null);

    try {
      // Start generation
      const res = await fetch('/api/generate', { method: 'POST' });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      const { streamId } = data;

      if (!streamId) {
        throw new Error('No stream ID returned');
      }

      // Connect to SSE for progress
      const eventSource = new EventSource(`/api/generate/progress?streamId=${streamId}`);

      eventSource.onmessage = (event) => {
        try {
          const progressData: ProgressData = JSON.parse(event.data);
          setProgress(progressData);

          if (progressData.status === 'complete' && progressData.current === progressData.total) {
            eventSource.close();
            setGenerating(false);
            setResult({
              type: 'success',
              message: `Fresh round poured! ${progressData.total} sports covered.`,
            });
            addToast(`Fresh round poured! ${progressData.total} sports covered.`, 'success');
            router.refresh();
          }

          if (progressData.status === 'error') {
            eventSource.close();
            setGenerating(false);
            setResult({
              type: 'error',
              message: progressData.message || 'Generation failed',
            });
            addToast(progressData.message || 'Generation failed', 'error');
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setGenerating(false);
        setResult({
          type: 'error',
          message: 'Lost connection to the tap. Try again.',
        });
      };
    } catch (err) {
      setGenerating(false);
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Generation failed',
      });
    }
  }, [addToast, router]);

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={cn(
          'w-full py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300',
          generating
            ? 'bg-accent/30 text-accent/60 cursor-not-allowed border-2 border-accent/20'
            : 'bg-gradient-to-r from-accent to-secondary text-bg-primary hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] border-2 border-transparent'
        )}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Pouring... &#x1F37A;
          </span>
        ) : (
          <span>Pour a Fresh Round &#x1F37A;</span>
        )}
      </button>

      {/* Progress */}
      {generating && progress && <GenerationProgress progress={progress} />}

      {/* Result Toast */}
      {result && (
        <div
          className={cn(
            'p-4 rounded-xl border text-sm font-medium transition-all duration-300',
            result.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="mr-2">
                {result.type === 'success' ? '\u2705' : '\u274C'}
              </span>
              {result.message}
            </div>
            {result.type === 'success' && (
              <Link
                href="/"
                className="ml-4 text-accent hover:text-accent-hover font-semibold whitespace-nowrap transition-colors"
              >
                View articles &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
