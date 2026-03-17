'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface RecommendedArticle {
  id: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  imageUrl: string | null;
  category: string;
  publishedAt: number | null;
  generatedAt: number;
  sportId: string;
  sportName: string;
  sportIcon: string;
  sportSlug: string;
  bookmarkCount: number;
}

/**
 * RecommendationCard - Displays articles from sports the user doesn't follow.
 * Shows a "Fans of [Sport] also read..." header with 2-3 article cards.
 */
export function RecommendationCard() {
  const [articles, setArticles] = useState<RecommendedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/recommendations');
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch {
        // Silent fail for recommendations
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  // Group by sport for the header, pick the most common sport
  const sportCounts = new Map<string, { name: string; icon: string; count: number }>();
  for (const a of articles) {
    const existing = sportCounts.get(a.sportId);
    if (existing) {
      existing.count++;
    } else {
      sportCounts.set(a.sportId, {
        name: a.sportName,
        icon: a.sportIcon,
        count: 1,
      });
    }
  }
  const topSport = Array.from(sportCounts.values()).sort(
    (a, b) => b.count - a.count
  )[0];

  // Show up to 3 articles
  const displayed = articles.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{topSport.icon}</span>
        <h3 className="text-sm font-semibold text-text-secondary">
          Fans of {topSport.name} also read...
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayed.map((article) => {
          const timestamp = article.publishedAt || article.generatedAt;
          return (
            <Link
              key={article.id}
              href={`/sports/${article.sportSlug}/${article.id}`}
              className="group bg-bg-card rounded-xl border border-border overflow-hidden hover:border-border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-24 overflow-hidden">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-bg-elevated via-bg-card to-accent/10 flex items-center justify-center">
                    <span className="text-3xl opacity-30 group-hover:opacity-50 transition-opacity">
                      {article.sportIcon}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-primary/80 backdrop-blur-sm text-accent border border-accent/20">
                    <span>{article.sportIcon}</span>
                    {article.sportName}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="text-xs font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h4>
                <p className="text-[10px] text-text-muted mt-1">
                  {timeAgo(timestamp)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
