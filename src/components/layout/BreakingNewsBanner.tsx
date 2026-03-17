'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BreakingArticle {
  id: string;
  title: string;
  category: string;
  publishedAt: string | number | null;
  generatedAt: string | number | null;
  sportSlug: string;
}

const STORAGE_KEY = 'breaking-news-dismissed';

export function BreakingNewsBanner() {
  const [article, setArticle] = useState<BreakingArticle | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check sessionStorage for dismissed state
    const dismissedId = sessionStorage.getItem(STORAGE_KEY);

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    fetch(`/api/articles?category=news&limit=5`)
      .then((r) => r.json())
      .then((data: BreakingArticle[]) => {
        if (!Array.isArray(data) || data.length === 0) return;

        // Find the most recent article within the last 4 hours
        const recent = data.find((a) => {
          const ts = a.publishedAt || a.generatedAt;
          if (!ts) return false;
          const date = typeof ts === 'number'
            ? new Date(ts * 1000)
            : new Date(ts);
          return date > fourHoursAgo;
        });

        // Also check scores category
        if (!recent) {
          fetch(`/api/articles?category=scores&limit=5`)
            .then((r) => r.json())
            .then((scoresData: BreakingArticle[]) => {
              if (!Array.isArray(scoresData)) return;
              const recentScore = scoresData.find((a) => {
                const ts = a.publishedAt || a.generatedAt;
                if (!ts) return false;
                const date = typeof ts === 'number'
                  ? new Date(ts * 1000)
                  : new Date(ts);
                return date > fourHoursAgo;
              });
              if (recentScore && dismissedId !== recentScore.id) {
                setArticle(recentScore);
                setDismissed(false);
              }
            })
            .catch(() => {});
          return;
        }

        if (recent && dismissedId !== recent.id) {
          setArticle(recent);
          setDismissed(false);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (article) {
      sessionStorage.setItem(STORAGE_KEY, article.id);
    }
  };

  if (dismissed || !article) return null;

  return (
    <div
      role="alert"
      className="bg-gradient-to-r from-amber-600/90 to-red-600/90 text-white border-b border-amber-500/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20">
            Breaking
          </span>
          <Link
            href={`/articles/${article.id}`}
            className="text-sm font-medium truncate hover:underline"
          >
            {article.title}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss breaking news"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
