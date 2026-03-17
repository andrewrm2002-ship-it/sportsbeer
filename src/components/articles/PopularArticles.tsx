'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrendingArticle {
  id: string;
  title: string;
  sportIcon: string;
  sportSlug: string;
  sportName: string;
  category: string;
  publishedAt: number | null;
  generatedAt: number;
}

export function PopularArticles() {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/articles/trending');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setArticles(data);
      } catch {
        // Silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 skeleton rounded w-2/3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-lg" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
        Trending This Week
      </h3>
      <div className="space-y-2">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/sports/${article.sportSlug}/${article.id}`}
            className="group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-bg-elevated/60 transition-colors"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{article.sportIcon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                {article.title}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-0.5 inline-block">
                {article.category}
              </span>
            </div>
            <span className="text-xs font-bold text-text-muted/40 mt-0.5 flex-shrink-0">
              {index + 1}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
