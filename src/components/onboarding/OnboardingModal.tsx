'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Sport {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const STORAGE_KEY = 'onboardingComplete';

/**
 * OnboardingModal - Shown on first visit to guide new users.
 * Add <OnboardingModal /> to your root layout.tsx to enable it.
 */
export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setOpen(true);
      fetch('/api/sports')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Sport[]) => setSports(data))
        .catch(() => {});
    }
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  function toggleSport(sportId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sportId)) {
        next.delete(sportId);
      } else {
        next.add(sportId);
      }
      return next;
    });
  }

  async function handleFinish() {
    if (selected.size > 0) {
      setSaving(true);
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sportIds: Array.from(selected) }),
        });
      } catch {
        // Preferences save is best-effort during onboarding
      } finally {
        setSaving(false);
      }
    }
    setStep(3);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-sm text-text-muted hover:text-text-primary transition-colors z-10"
        >
          Skip
        </button>

        {/* Step indicator */}
        <div className="flex gap-2 justify-center pt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                s === step
                  ? 'w-8 bg-accent'
                  : s < step
                    ? 'w-4 bg-accent/50'
                    : 'w-4 bg-border'
              )}
            />
          ))}
        </div>

        <div className="p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <span className="text-6xl block">&#x1F37A;</span>
              <h2 className="text-2xl font-bold text-text-primary">
                Welcome to Brews &amp; Box Scores!
              </h2>
              <p className="text-text-secondary max-w-sm mx-auto leading-relaxed">
                Your go-to spot for sports news, served fresh with a cold one.
                Let&apos;s set up your feed so you only see the sports you care about.
              </p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 px-8 py-3 bg-accent hover:bg-accent-hover text-bg-primary font-semibold rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: Sport selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-text-primary">
                  Pick Your Sports
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Select the sports you want to follow. You can always change this later.
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                {sports.map((sport) => {
                  const isSelected = selected.has(sport.id);
                  return (
                    <button
                      key={sport.id}
                      onClick={() => toggleSport(sport.id)}
                      className={cn(
                        'relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                        isSelected
                          ? 'bg-accent-muted border-accent text-accent shadow-lg shadow-accent/10'
                          : 'bg-bg-elevated border-border text-text-secondary hover:border-border-accent hover:text-text-primary'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-accent"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-xl">{sport.icon}</span>
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {sport.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-text-muted">
                  {selected.size} selected
                </p>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className={cn(
                    'px-6 py-2.5 rounded-lg font-semibold transition-all duration-200',
                    saving
                      ? 'bg-accent/50 text-bg-primary cursor-not-allowed'
                      : 'bg-accent hover:bg-accent-hover text-bg-primary'
                  )}
                >
                  {saving ? 'Saving...' : selected.size > 0 ? 'Continue' : 'Skip for Now'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <span className="text-6xl block">&#x1F389;</span>
              <h2 className="text-2xl font-bold text-text-primary">
                You&apos;re All Set!
              </h2>
              <p className="text-text-secondary max-w-sm mx-auto leading-relaxed">
                Your feed is ready. Dive in and enjoy the latest sports coverage,
                or fine-tune your preferences anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={complete}
                  className="px-8 py-3 bg-accent hover:bg-accent-hover text-bg-primary font-semibold rounded-lg transition-colors"
                >
                  Start Reading
                </button>
                <Link
                  href="/preferences"
                  onClick={complete}
                  className="px-8 py-3 border border-border hover:border-border-accent text-text-secondary hover:text-text-primary rounded-lg transition-colors text-center font-medium"
                >
                  Fine-tune Preferences
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
