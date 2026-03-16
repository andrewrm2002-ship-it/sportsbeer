'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface BookmarkedArticle {
  id: string;
  articleId: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  imageUrl: string | null;
  sportName: string;
  sportIcon: string;
  sportSlug: string;
  publishedAt: number | null;
  generatedAt: number;
  category: string;
}

export function BookmarksFeed() {
  const [articles, setArticles] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bookmarks');
        if (!res.ok) throw new Error('Failed to fetch bookmarks');
        const data = await res.json();
        setArticles(data);
      } catch {
        setError('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleUnbookmark(articleId: string) {
    setRemovingIds((prev) => new Set(prev).add(articleId));

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (!res.ok) throw new Error('Failed to unbookmark');

      // Wait for fade animation, then remove from list
      setTimeout(() => {
        setArticles((prev) => prev.filter((a) => a.articleId !== articleId));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
      }, 300);
    } catch {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-bg-card overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-bg-elevated" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-bg-elevated rounded w-3/4" />
              <div className="h-3 bg-bg-elevated rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 mx-auto text-text-muted/30 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          No Saved Articles Yet
        </h3>
        <p className="text-text-muted max-w-md mx-auto">
          Start bookmarking articles you love! Look for the bookmark icon on any
          article to save it here for later.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2.5 text-sm font-semibold bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          Browse Articles
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((article) => {
        const isRemoving = removingIds.has(article.articleId);
        const timestamp = article.publishedAt || article.generatedAt;

        return (
          <div
            key={article.id}
            className={`relative group bg-bg-card rounded-xl border border-border overflow-hidden hover:border-border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 ${
              isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <Link
              href={`/sports/${article.sportSlug || 'all'}/${article.id}`}
              className="block"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-bg-elevated via-bg-card to-accent/10 flex items-center justify-center">
                    <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
                      {article.sportIcon}
                    </span>
                  </div>
                )}

                {/* Sport Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-primary/80 backdrop-blur-sm text-accent border border-accent/20">
                    <span>{article.sportIcon}</span>
                    {article.sportName}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/90 text-text-primary">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                {article.subtitle && (
                  <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                    {article.subtitle}
                  </p>
                )}
                {article.summary && (
                  <p className="text-sm text-text-muted mt-2 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {timeAgo(timestamp)}
                  </span>
                </div>
              </div>
            </Link>

            {/* Unbookmark Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnbookmark(article.articleId);
              }}
              disabled={isRemoving}
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-bg-elevated/80 backdrop-blur-sm border border-border text-accent hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all duration-200"
              title="Remove bookmark"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
