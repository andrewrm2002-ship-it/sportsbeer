'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  publishedAt: string | null;
  generatedAt: string;
  sportId: string;
  sportName: string;
  sportIcon: string;
  sportSlug: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/search?q=${encodeURIComponent(q)}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const navigateToArticle = (result: SearchResult) => {
    onClose();
    router.push(`/sports/${result.sportSlug}/${result.id}`);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-bg-primary/95 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Search input area */}
      <div className="w-full max-w-2xl mx-auto mt-20 px-4">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-12 pr-12 py-4 rounded-xl bg-bg-card border border-border text-text-primary text-lg placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-primary border border-border hover:text-text-primary transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl bg-bg-card border border-border divide-y divide-border">
          {loading && (
            <div className="px-4 py-8 text-center text-text-secondary">
              Searching...
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="px-4 py-8 text-center text-text-secondary">
              No articles found for &quot;{query}&quot;
            </div>
          )}

          {!loading && results.map((result) => (
            <button
              key={result.id}
              onClick={() => navigateToArticle(result)}
              className="w-full text-left px-4 py-3 hover:bg-accent-muted transition-colors flex items-start gap-3"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{result.sportIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {result.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {result.sportName}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {formatTime(result.publishedAt ?? result.generatedAt)}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {!loading && !query.trim() && (
            <div className="px-4 py-8 text-center text-text-secondary">
              Type to search articles by title or summary
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
