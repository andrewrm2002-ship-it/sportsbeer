'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/utils';

interface Stats {
  totalArticles: number;
  sportsWithArticles: number;
  lastUpdated: string | null;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Fail silently
      }
    }
    load();
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap py-3 px-4 rounded-xl bg-bg-card/50 border border-border/50">
      <span className="text-sm text-text-secondary">
        <span className="font-bold text-accent">{stats.totalArticles}</span> articles
      </span>
      <span className="text-border">&#x2022;</span>
      <span className="text-sm text-text-secondary">
        <span className="font-bold text-accent">{stats.sportsWithArticles}</span> sports
      </span>
      {stats.lastUpdated && (
        <>
          <span className="text-border">&#x2022;</span>
          <span className="text-sm text-text-secondary">
            Updated <span className="font-bold text-accent">{timeAgo(stats.lastUpdated)}</span>
          </span>
        </>
      )}
    </div>
  );
}
