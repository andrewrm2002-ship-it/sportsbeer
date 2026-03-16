'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

interface Sport {
  id: string;
  name: string;
  icon: string;
  category: string;
}

type Frequency = 'daily' | 'weekly' | 'breaking';

const frequencyOptions: {
  value: Frequency;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: 'daily',
    label: 'Daily Digest',
    description: "A curated roundup of the day's best stories, every morning",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'weekly',
    label: 'Weekly Roundup',
    description: "The week's top stories, delivered every Monday",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'breaking',
    label: 'Breaking News',
    description: 'Instant alerts for major stories and upsets',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function EmailAlertsForm() {
  const { data: session } = useSession();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [selectedSportIds, setSelectedSportIds] = useState<Set<string>>(new Set());
  const [allSportsSelected, setAllSportsSelected] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);

  // Load sports and current alert settings
  useEffect(() => {
    async function loadData() {
      try {
        const [sportsRes, alertsRes] = await Promise.all([
          fetch('/api/sports'),
          fetch('/api/email-alerts'),
        ]);

        if (sportsRes.ok) {
          const data = await sportsRes.json();
          setSports(data);
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          // API returns an array of active alerts
          const alert = Array.isArray(data) ? data[0] : data;
          if (alert) {
            setIsSubscribed(true);
            setEmail(alert.email || '');
            setFrequency(alert.frequency || 'daily');
            if (alert.sportIds && alert.sportIds.length > 0) {
              setSelectedSportIds(new Set(alert.sportIds));
              setAllSportsSelected(false);
            } else {
              setAllSportsSelected(true);
            }
          }
        }

        // Pre-fill email from session
        if (session?.user?.email) {
          setEmail((prev) => prev || session.user?.email || '');
        }
      } catch (err) {
        console.error('Failed to load alert settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  function toggleSport(sportId: string) {
    setSelectedSportIds((prev) => {
      const next = new Set(prev);
      if (next.has(sportId)) {
        next.delete(sportId);
      } else {
        next.add(sportId);
      }
      return next;
    });
    setAllSportsSelected(false);
  }

  function handleAllSportsToggle() {
    if (allSportsSelected) {
      setAllSportsSelected(false);
    } else {
      setAllSportsSelected(true);
      setSelectedSportIds(new Set());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/email-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          frequency,
          sportIds: allSportsSelected ? null : Array.from(selectedSportIds),
        }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        addToast('Alert preferences saved! You\'re all set.', 'success');
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error || 'Failed to save preferences.', 'error');
      }
    } catch (err) {
      console.error('Failed to save alert settings:', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnsubscribe() {
    setUnsubscribing(true);
    try {
      const res = await fetch('/api/email-alerts', { method: 'DELETE' });
      if (res.ok) {
        setIsSubscribed(false);
        addToast('You\'ve been unsubscribed from email alerts.', 'info');
      } else {
        addToast('Failed to unsubscribe. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setUnsubscribing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 rounded-xl skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Email Field */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <label
          htmlFor="alert-email"
          className="block text-sm font-semibold text-text-primary mb-2"
        >
          Email Address
        </label>
        <input
          id="alert-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      {/* Frequency Selector */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          How often?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {frequencyOptions.map((opt) => {
            const isSelected = frequency === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFrequency(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center',
                  isSelected
                    ? 'bg-accent-muted border-accent text-accent shadow-lg shadow-accent/10'
                    : 'bg-bg-card border-border text-text-secondary hover:border-border-accent hover:text-text-primary'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <span className={cn(isSelected ? 'text-accent' : 'text-text-muted')}>
                  {opt.icon}
                </span>
                <span className="text-sm font-bold">{opt.label}</span>
                <span className="text-xs text-text-muted leading-snug">
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sport Filter */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Which sports?
        </h2>

        {/* All Sports Toggle */}
        <button
          type="button"
          onClick={handleAllSportsToggle}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 mb-3',
            allSportsSelected
              ? 'bg-accent-muted border-accent text-accent'
              : 'bg-bg-card border-border text-text-secondary hover:border-border-accent hover:text-text-primary'
          )}
        >
          {allSportsSelected && (
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="text-sm font-semibold">All Sports</span>
        </button>

        {/* Individual Sport Toggles */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {sports.map((sport) => {
            const isSelected = !allSportsSelected && selectedSportIds.has(sport.id);
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => toggleSport(sport.id)}
                disabled={allSportsSelected}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  allSportsSelected
                    ? 'bg-bg-card border-border text-text-muted opacity-50 cursor-not-allowed'
                    : isSelected
                      ? 'bg-accent-muted border-accent text-accent shadow-md shadow-accent/10'
                      : 'bg-bg-card border-border text-text-secondary hover:border-border-accent hover:text-text-primary'
                )}
              >
                <span className="text-xl">{sport.icon}</span>
                <span className="text-[10px] font-medium text-center leading-tight">
                  {sport.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {isSubscribed && (
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={unsubscribing}
            className="px-5 py-3 rounded-lg text-sm font-semibold text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {unsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold transition-all duration-200 ml-auto',
            saving
              ? 'bg-accent/50 text-bg-primary cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-bg-primary active:scale-[0.98]'
          )}
        >
          {saving ? 'Saving...' : isSubscribed ? 'Update Preferences' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}
