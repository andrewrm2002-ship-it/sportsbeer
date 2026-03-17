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
  imageUrl?: string | null;
  publishedAt: number | null;
  generatedAt: number;
}

interface TrendingOtherSportsProps {
  excludeSportSlug: string;
}

export function TrendingOtherSports({ excludeSportSlug }: TrendingOtherSportsProps) {
  const [articles, setArticles] = useState<TrendingArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/articles/trending');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter out articles from the current sport
          const filtered = data.filter(
            (a: TrendingArticle) => a.sportSlug !== excludeSportSlug
          );
          setArticles(filtered.slice(0, 4));
        }
      } catch {
        // Silently fail — widget is non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [excludeSportSlug]);

  if (loading || articles.length === 0) return null;

  return (
    <section className="pt-8 border-t border-border space-y-4">
      <h2 className="text-xl font-bold text-text-primary">
        Trending in Other Sports
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/sports/${article.sportSlug}/${article.id}`}
            className="group flex gap-4 p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-all duration-200"
          >
            <div className="w-20 h-20 rounded-lg bg-bg-elevated flex items-center justify-center flex-shrink-0">
              <span className="text-2xl opacity-40">
                {article.sportIcon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs">{article.sportIcon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                  {article.sportName}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                {article.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                <span className="uppercase font-medium tracking-wider">
                  {article.category}
                </span>
                <span>
                  {timeAgo(article.publishedAt || article.generatedAt)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
