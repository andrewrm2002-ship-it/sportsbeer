'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  team: 'Team Sports',
  individual: 'Individual Sports',
  combat: 'Combat Sports',
  motor: 'Motor Sports',
  water: 'Water Sports',
};

const categoryOrder = ['team', 'individual', 'combat', 'motor', 'water'];

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  articleCount: number;
}

export function SportsGrid({ sports }: { sports: Sport[] }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? sports.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : sports;

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, Sport[]>();
    for (const sport of filtered) {
      const cat = sport.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(sport);
    }
    return map;
  }, [filtered]);

  // Category article count summaries
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [cat, catSports] of grouped) {
      counts.set(cat, catSports.reduce((sum, s) => sum + s.articleCount, 0));
    }
    return counts;
  }, [grouped]);

  return (
    <div className="space-y-10">
      {/* Search Input */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter sports..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            No sports match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        categoryOrder
          .filter((cat) => grouped.has(cat))
          .map((cat) => {
            const totalArticles = categoryCounts.get(cat) ?? 0;
            return (
              <section
                key={cat}
                className="mb-12"
                role="region"
                aria-label={categoryLabels[cat] || cat}
              >
                <div className="bg-bg-elevated/30 px-4 py-2 rounded-lg mb-6">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <span className="h-px flex-1 bg-border" />
                    <span className="px-3 whitespace-nowrap">
                      {categoryLabels[cat] || cat}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </h2>
                  <p className="text-center text-xs text-text-muted mt-1">
                    {grouped.get(cat)!.length} {grouped.get(cat)!.length === 1 ? 'sport' : 'sports'} &middot; {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                  </p>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  role="list"
                >
                  {grouped.get(cat)!.map((sport) => (
                    <Link
                      key={sport.id}
                      href={`/sports/${sport.slug}`}
                      role="listitem"
                      aria-label={`${sport.name} - ${sport.articleCount} articles`}
                      className="group relative flex flex-col items-center gap-3 p-5 rounded-xl bg-bg-card border border-border hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      <span className="relative text-4xl group-hover:scale-125 transition-transform duration-300 drop-shadow-sm">
                        {sport.icon}
                      </span>
                      <span className="relative text-sm font-semibold text-text-primary text-center group-hover:text-accent transition-colors">
                        {sport.name}
                      </span>

                      {/* Article count badge */}
                      <span className="relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                        {sport.articleCount}
                        <span className="text-accent/70">
                          {sport.articleCount === 1 ? 'article' : 'articles'}
                        </span>
                      </span>

                      {/* Arrow indicator on hover */}
                      <span className="absolute bottom-2 right-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
      )}
    </div>
  );
}
