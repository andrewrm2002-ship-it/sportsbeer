'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GuzzlerCard, type GuzzlerData } from './GuzzlerCard';

export function GuzzlersSidebar() {
  const [guzzlers, setGuzzlers] = useState<GuzzlerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/guzzlers?limit=5');
        if (res.ok) {
          const data = await res.json();
          setGuzzlers(data);
        }
      } catch {
        // Sidebar is non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-5">
        <div className="h-6 w-48 skeleton rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 skeleton rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded w-full" />
                <div className="h-3 skeleton rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (guzzlers.length === 0) return null;

  const arbCount = guzzlers.filter((g) => g.isArb).length;

  return (
    <aside className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <span>&#x1F37A;</span> Guaranteed Guzzlers
        </h3>
        {arbCount > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
            {arbCount} arb{arbCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="divide-y divide-border/50">
        {guzzlers.map((g) => (
          <GuzzlerCard key={g.id} guzzler={g} compact />
        ))}
      </div>

      <Link
        href="/guzzlers"
        className="block mt-4 text-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
      >
        View All Guzzlers &rarr;
      </Link>
    </aside>
  );
}
