'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { timeAgo } from '@/lib/utils';
import { getArticleImage } from '@/lib/sport-images';
import { BookmarkButton } from '@/components/articles/BookmarkButton';

interface ArticleCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  sportName: string;
  sportIcon: string;
  sportSlug?: string;
  publishedAt?: Date | number | null;
  generatedAt: Date | number;
  category: string;
}

function estimateReadingTime(text: string | null | undefined): string {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function isNewArticle(publishedAt?: Date | number | null, generatedAt?: Date | number): boolean {
  const timestamp = publishedAt || generatedAt;
  if (!timestamp) return false;
  const articleTime =
    timestamp instanceof Date
      ? timestamp.getTime()
      : typeof timestamp === 'number'
        ? timestamp < 1e12 ? timestamp * 1000 : timestamp
        : new Date(timestamp).getTime();
  const fourHoursMs = 4 * 60 * 60 * 1000;
  return Date.now() - articleTime < fourHoursMs;
}

export function ArticleCard({
  id,
  title,
  subtitle,
  summary,
  imageUrl,
  sportName,
  sportIcon,
  sportSlug,
  publishedAt,
  generatedAt,
  category,
}: ArticleCardProps) {
  const timestamp = publishedAt || generatedAt;
  const slug = sportSlug || 'all';
  const href = `/sports/${slug}/${id}`;
  const readingTime = estimateReadingTime(summary);
  const isNew = isNewArticle(publishedAt, generatedAt);
  const resolvedImage = getArticleImage(imageUrl, slug, id);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={href}
      className="group block bg-bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image — always shown */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imgError ? (
          <Image
            src={resolvedImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-bg-elevated to-secondary/20 flex items-center justify-center">
            <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">
              {sportIcon}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bg-card/80 via-bg-card/30 to-transparent pointer-events-none" />

        {/* Sport Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-primary/80 backdrop-blur-sm text-accent border border-accent/20">
            <span>{sportIcon}</span>
            {sportName}
          </span>
          {isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-bg-primary animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/90 text-text-primary">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-1">
            {subtitle}
          </p>
        )}

        {summary && (
          <p className="text-sm text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">
              {timeAgo(timestamp)}
            </span>
            <span className="text-xs text-text-muted/50">&middot;</span>
            <span className="text-xs text-text-muted">
              {readingTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton articleId={id} />
            <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Read more &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
