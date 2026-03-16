'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { useToast } from '@/components/providers/ToastProvider';

interface Sport {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export function SportSelector() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        // Load available sports
        const sportsRes = await fetch('/api/sports');
        if (sportsRes.ok) {
          const data = await sportsRes.json();
          setSports(data);
        }

        // Load current preferences
        const prefsRes = await fetch('/api/preferences');
        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setSelected(new Set(data.sportIds || []));
        }
      } catch (err) {
        console.error('Failed to load sports data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const sportIds = Array.from(selected);
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportIds }),
      });

      if (res.ok) {
        setPreferences(sportIds);
        setSaved(true);
        addToast('Preferences saved! Your tap list is updated.', 'success');
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {sports.map((sport) => {
          const isSelected = selected.has(sport.id);
          return (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
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
              <span className="text-2xl">{sport.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {sport.name}
              </span>
            </button>
          );
        })}
      </div>

      {sports.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">&#x1F37A;</span>
          <p className="text-text-muted">
            No sports available yet. Check back after the admin pours a fresh round!
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          {selected.size} sport{selected.size !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
            saved
              ? 'bg-success text-white'
              : saving
                ? 'bg-accent/50 text-bg-primary cursor-not-allowed'
                : 'bg-accent hover:bg-accent-hover text-bg-primary active:scale-[0.98]'
          )}
        >
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
