'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  tags: string[] | null;
}

interface TagCount {
  tag: string;
  count: number;
}

export function TrendingTopics() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?limit=50');
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch {
        // Non-critical, fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const topTags: TagCount[] = useMemo(() => {
    const tagMap = new Map<string, number>();
    for (const article of articles) {
      if (!article.tags) continue;
      for (const tag of article.tags) {
        const normalized = tag.trim().toLowerCase();
        if (!normalized) continue;
        tagMap.set(normalized, (tagMap.get(normalized) ?? 0) + 1);
      }
    }

    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [articles]);

  if (loading) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-5">
        <div className="h-6 w-36 skeleton rounded mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 skeleton rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (topTags.length === 0) return null;

  return (
    <aside className="bg-bg-card rounded-xl border border-border p-5">
      <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <span>&#x1F4C8;</span> Trending Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {topTags.map(({ tag, count }) => {
          const isTrending = count >= 5;
          return (
            <Link
              key={tag}
              href={`/sports/all?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-bg-elevated border border-border hover:border-accent/40 hover:bg-accent-muted text-text-secondary hover:text-text-primary transition-all duration-200"
            >
              {isTrending && <span className="text-sm">&#x1F525;</span>}
              <span className="capitalize">{tag}</span>
              <span className="text-[10px] text-text-muted font-normal">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
