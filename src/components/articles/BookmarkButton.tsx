'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  articleId: string;
  initialBookmarked?: boolean;
  size?: 'sm' | 'lg';
  showLabel?: boolean;
}

export function BookmarkButton({
  articleId,
  initialBookmarked = false,
  size = 'sm',
  showLabel = false,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const prev = bookmarked;
    setBookmarked(!prev);
    setLoading(true);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      });

      if (!res.ok) {
        setBookmarked(prev);
      }
    } catch {
      setBookmarked(prev);
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-200 active:scale-[0.9]',
        size === 'lg'
          ? 'px-4 py-2 rounded-lg border border-border hover:border-accent/40 bg-bg-card'
          : 'p-1.5 rounded-full hover:bg-bg-elevated/80',
        bookmarked
          ? 'text-accent'
          : 'text-text-muted hover:text-accent'
      )}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
      title={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
    >
      <svg
        className={iconSize}
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="text-sm font-medium">
          {bookmarked ? 'Saved' : 'Save Article'}
        </span>
      )}
    </button>
  );
}
