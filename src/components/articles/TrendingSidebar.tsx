'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

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

export function TrendingSidebar() {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/articles/trending');
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch {
        // Fail silently — sidebar is non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-5">
        <div className="h-6 w-32 skeleton rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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

  if (articles.length === 0) return null;

  return (
    <aside className="bg-bg-card rounded-xl border border-border p-5">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <span>&#x1F525;</span> Trending
      </h3>
      <ol className="space-y-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/sports/${article.sportSlug}/${article.id}`}
              className="group flex gap-3 items-start"
            >
              <span className="text-2xl font-extrabold text-accent/40 leading-none mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{article.sportIcon}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    {article.sportName}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                  {article.title}
                </p>
                <span className="text-xs text-text-muted mt-1 block">
                  {timeAgo(article.publishedAt || article.generatedAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
