'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { timeAgo } from '@/lib/utils';

const PAGE_SIZE = 12;

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'scores', label: 'Scores' },
  { key: 'news', label: 'News' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'stats', label: 'Stats' },
] as const;

type CategoryKey = (typeof CATEGORY_TABS)[number]['key'];

interface Article {
  id: string;
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

interface ArticleFeedProps {
  sportId?: string;
  headerLabel?: string;
}

export function ArticleFeed({ sportId, headerLabel }: ArticleFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const tabsRef = useRef<HTMLDivElement>(null);

  const fetchArticles = useCallback(
    async (offset: number, category?: CategoryKey) => {
      const params = new URLSearchParams();
      if (sportId) params.set('sportId', sportId);
      if (category && category !== 'all') params.set('category', category);
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(offset));

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch articles');

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response');
      }
      return data as Article[];
    },
    [sportId]
  );

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError('');
      setArticles([]);
      setHasMore(true);

      try {
        const data = await fetchArticles(0, activeCategory);
        setArticles(data);
        if (data.length < PAGE_SIZE) setHasMore(false);
      } catch {
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [fetchArticles, activeCategory]);

  function handleCategoryChange(category: CategoryKey) {
    setActiveCategory(category);
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const data = await fetchArticles(articles.length, activeCategory);
      setArticles((prev) => [...prev, ...data]);
      if (data.length < PAGE_SIZE) setHasMore(false);
    } catch {
      setError('Failed to load more articles');
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl block mb-4">&#x1F61E;</span>
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
        <span className="text-5xl block mb-4">&#x1F37A;</span>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          The Keg Is Empty!
        </h3>
        <p className="text-text-muted max-w-md mx-auto">
          No articles yet. The bartender (AI) hasn&apos;t poured any stories for this
          tap. Check back soon or ask an admin to generate some fresh content!
        </p>
      </div>
    );
  }

  const [heroArticle, ...restArticles] = articles;

  return (
    <div className="space-y-8">
      {headerLabel && (
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {headerLabel}
        </p>
      )}
      {/* Category Filter Tabs */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
      >
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === tab.key
                ? 'bg-accent text-bg-primary shadow-sm'
                : 'bg-bg-elevated text-text-secondary hover:bg-accent/10 hover:text-accent border border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hero Card - Featured first article */}
      {heroArticle && (
        <Link
          href={`/sports/${heroArticle.sportSlug || 'all'}/${heroArticle.id}`}
          className="group block bg-bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              {heroArticle.imageUrl ? (
                <img
                  src={heroArticle.imageUrl}
                  alt={heroArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-bg-elevated via-bg-card to-accent/10 flex items-center justify-center">
                  <span className="text-7xl opacity-30 group-hover:opacity-50 transition-opacity">
                    {heroArticle.sportIcon}
                  </span>
                </div>
              )}
              {/* Dramatic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/20 to-transparent pointer-events-none" />
              {/* Featured Badge + Sport Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-accent text-bg-primary shadow-lg shadow-accent/25">
                  Featured
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-bg-primary/80 backdrop-blur-sm text-accent border border-accent/20">
                  <span>{heroArticle.sportIcon}</span>
                  {heroArticle.sportName}
                </span>
              </div>
              {/* Category Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/90 text-text-primary">
                  {heroArticle.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary leading-tight group-hover:text-accent transition-colors">
                {heroArticle.title}
              </h2>

              {heroArticle.subtitle && (
                <p className="text-base text-text-secondary mt-3 line-clamp-2">
                  {heroArticle.subtitle}
                </p>
              )}

              {heroArticle.summary && (
                <p className="text-sm text-text-muted mt-4 line-clamp-3 leading-relaxed">
                  {heroArticle.summary}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  {timeAgo(heroArticle.publishedAt || heroArticle.generatedAt)}
                </span>
                <span className="text-sm text-accent font-medium group-hover:translate-x-1 transition-transform">
                  Read full story &rarr;
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Remaining articles in grid */}
      {restArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restArticles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              title={article.title}
              subtitle={article.subtitle}
              summary={article.summary}
              imageUrl={article.imageUrl}
              sportName={article.sportName}
              sportIcon={article.sportIcon}
              sportSlug={article.sportSlug}
              publishedAt={article.publishedAt}
              generatedAt={article.generatedAt}
              category={article.category}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 rounded-xl text-sm font-semibold bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 hover:border-accent/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Pouring more...' : 'Load More Stories'}
          </button>
        </div>
      )}
    </div>
  );
}
