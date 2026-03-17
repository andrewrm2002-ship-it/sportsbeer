'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────

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

interface SportOption {
  id: string;
  name: string;
  slug: string;
  icon: string;
  articleCount: number;
}

interface Command {
  id: string;
  label: string;
  description: string;
  route: string;
  shortcut?: string;
  icon: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = 'brews-recent-searches';
const MAX_RECENT = 5;

const COMMANDS: Command[] = [
  { id: 'home', label: '/home', description: 'Go to home page', route: '/', shortcut: 'H', icon: '\u{1F3E0}' },
  { id: 'sports', label: '/sports', description: 'Browse all sports', route: '/sports', shortcut: 'S', icon: '\u{1F3C6}' },
  { id: 'bookmarks', label: '/bookmarks', description: 'View saved articles', route: '/bookmarks', shortcut: 'B', icon: '\u{1F516}' },
  { id: 'preferences', label: '/preferences', description: 'Edit your preferences', route: '/preferences', shortcut: 'P', icon: '\u{2699}\u{FE0F}' },
  { id: 'admin', label: '/admin', description: 'Admin dashboard', route: '/admin', shortcut: 'A', icon: '\u{1F6E0}\u{FE0F}' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    const updated = [query, ...existing.filter((s) => s !== query)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // silent
  }
}

function formatTime(dateStr: string | null) {
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
}

// ── Flat navigable item for arrow key navigation ───────────────────────────

type NavItem =
  | { type: 'article'; result: SearchResult }
  | { type: 'sport'; sport: SportOption }
  | { type: 'command'; command: Command }
  | { type: 'recent'; query: string };

// ── Component ──────────────────────────────────────────────────────────────

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isCommandMode = query.startsWith('/');
  const trimmedQuery = query.trim();

  // ── Fetch sports list once ────────────────────────────────────────────

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports');
        if (res.ok) {
          const data = await res.json();
          setSports(data);
        }
      } catch {
        // silent
      }
    }
    fetchSports();
  }, []);

  // ── Open / close lifecycle ────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setSportFilter('all');
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ── Keyboard handling ─────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, navItems.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = navItems[selectedIndex];
        if (item) activateItem(item);
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedIndex, query, results, sports, recentSearches]);

  // ── Search logic ──────────────────────────────────────────────────────

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || q.startsWith('/')) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ q, limit: '20' });
        if (sportFilter !== 'all') {
          // We'll do client-side filtering since search API doesn't support sportId filter
        }
        const res = await fetch(`/api/articles/search?${params.toString()}`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setResults(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [sportFilter],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  // ── Filtered results based on sport filter ────────────────────────────

  const filteredResults = useMemo(() => {
    if (sportFilter === 'all') return results;
    return results.filter((r) => r.sportId === sportFilter);
  }, [results, sportFilter]);

  // ── Matching sports (show sports whose name matches query) ────────────

  const matchingSports = useMemo(() => {
    if (!trimmedQuery || isCommandMode) return [];
    const q = trimmedQuery.toLowerCase();
    return sports.filter((s) => s.name.toLowerCase().includes(q));
  }, [trimmedQuery, isCommandMode, sports]);

  // ── Filtered commands ─────────────────────────────────────────────────

  const filteredCommands = useMemo(() => {
    if (!isCommandMode) return [];
    const q = query.slice(1).toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(q),
    );
  }, [isCommandMode, query]);

  // ── Build flat navigation items list ──────────────────────────────────

  const navItems: NavItem[] = useMemo(() => {
    // Command mode
    if (isCommandMode) {
      return filteredCommands.map((c) => ({ type: 'command' as const, command: c }));
    }

    // If no query, show recent searches
    if (!trimmedQuery) {
      return recentSearches.map((q) => ({ type: 'recent' as const, query: q }));
    }

    // Search results grouped: sports first, then articles
    const items: NavItem[] = [];
    for (const s of matchingSports) {
      items.push({ type: 'sport', sport: s });
    }
    for (const r of filteredResults) {
      items.push({ type: 'article', result: r });
    }
    return items;
  }, [isCommandMode, filteredCommands, trimmedQuery, recentSearches, matchingSports, filteredResults]);

  // ── Activate a navigation item ────────────────────────────────────────

  const activateItem = useCallback(
    (item: NavItem) => {
      switch (item.type) {
        case 'article':
          saveRecentSearch(query);
          onClose();
          router.push(`/sports/${item.result.sportSlug}/${item.result.id}`);
          break;
        case 'sport':
          saveRecentSearch(query);
          onClose();
          router.push(`/sports/${item.sport.slug}`);
          break;
        case 'command':
          onClose();
          router.push(item.command.route);
          break;
        case 'recent':
          setQuery(item.query);
          setSelectedIndex(0);
          search(item.query);
          break;
      }
    },
    [query, onClose, router, search],
  );

  // ── Scroll selected item into view ────────────────────────────────────

  useEffect(() => {
    if (!resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-nav-index="${selectedIndex}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // ── Handle clear recent ───────────────────────────────────────────────

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!open) return null;

  // ── Group articles by sport for display ───────────────────────────────

  const articlesBySport = new Map<string, SearchResult[]>();
  for (const r of filteredResults) {
    if (!articlesBySport.has(r.sportId)) {
      articlesBySport.set(r.sportId, []);
    }
    articlesBySport.get(r.sportId)!.push(r);
  }

  // Track item index for data attributes
  let navIndex = 0;

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
            placeholder="Search articles, sports, or tags... (/ for commands)"
            className="w-full pl-12 pr-12 py-4 rounded-xl bg-bg-card border border-border text-text-primary text-lg placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-primary border border-border hover:text-text-primary transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Sport filter dropdown (only in search mode) */}
        {!isCommandMode && trimmedQuery && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-muted">Search in:</span>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="text-xs bg-bg-elevated border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none focus:border-accent/50"
            >
              <option value="all">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Results panel */}
        <div
          ref={resultsRef}
          className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl bg-bg-card border border-border"
        >
          {/* Loading state */}
          {loading && (
            <div className="px-4 py-8 text-center text-text-secondary">Searching...</div>
          )}

          {/* ── Command Mode ──────────────────────────────────────────── */}
          {!loading && isCommandMode && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-elevated/30">
                Commands
              </div>
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-6 text-center text-text-secondary text-sm">
                  No commands match &quot;{query}&quot;
                </div>
              ) : (
                filteredCommands.map((cmd) => {
                  const idx = navItems.findIndex((n) => n.type === 'command' && n.command.id === cmd.id);
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-nav-index={idx}
                      onClick={() => activateItem({ type: 'command', command: cmd })}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        isSelected ? 'bg-accent-muted' : 'hover:bg-accent-muted/50'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-medium text-text-primary">
                          {cmd.label}
                        </p>
                        <p className="text-xs text-text-muted">{cmd.description}</p>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium text-text-muted bg-bg-primary border border-border">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ── Recent Searches (empty query, not command mode) ────── */}
          {!loading && !isCommandMode && !trimmedQuery && (
            <div>
              {recentSearches.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-elevated/30 flex items-center justify-between">
                    <span>Recent Searches</span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] text-text-muted hover:text-accent transition-colors normal-case tracking-normal font-normal"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((q, i) => {
                    const isSelected = i === selectedIndex;
                    return (
                      <button
                        key={q}
                        data-nav-index={i}
                        onClick={() => activateItem({ type: 'recent', query: q })}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          isSelected ? 'bg-accent-muted' : 'hover:bg-accent-muted/50'
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-text-muted flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-text-primary">{q}</span>
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="px-4 py-8 text-center text-text-secondary text-sm">
                  Search articles, sports, or tags...
                  <br />
                  <span className="text-xs text-text-muted mt-1 block">
                    Type <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-primary border border-border">/</kbd> for commands
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Search Results (grouped) ──────────────────────────── */}
          {!loading && !isCommandMode && trimmedQuery && (
            <div>
              {/* Matching sports section */}
              {matchingSports.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-elevated/30">
                    Sports
                  </div>
                  {matchingSports.map((sport) => {
                    const idx = navItems.findIndex(
                      (n) => n.type === 'sport' && n.sport.id === sport.id,
                    );
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={sport.id}
                        data-nav-index={idx}
                        onClick={() => activateItem({ type: 'sport', sport })}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-border/50 ${
                          isSelected ? 'bg-accent-muted' : 'hover:bg-accent-muted/50'
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">{sport.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">{sport.name}</p>
                        </div>
                        <span className="text-xs text-text-muted">
                          {sport.articleCount} {sport.articleCount === 1 ? 'article' : 'articles'}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Articles section, grouped by sport */}
              {filteredResults.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border bg-bg-elevated/30">
                    Articles
                  </div>
                  {(() => {
                    // Render articles grouped by sport
                    const rendered: React.ReactNode[] = [];
                    let currentNavIdx = matchingSports.length; // offset past sport items

                    for (const [sportId, articles] of articlesBySport) {
                      const first = articles[0];
                      // Sport sub-header
                      rendered.push(
                        <div
                          key={`header-${sportId}`}
                          className="px-4 py-1.5 text-[11px] font-medium text-text-muted flex items-center gap-1.5 bg-bg-primary/30"
                        >
                          <span>{first.sportIcon}</span>
                          <span>{first.sportName}</span>
                          <span className="text-text-muted/60">({articles.length})</span>
                        </div>,
                      );

                      for (const article of articles) {
                        const idx = currentNavIdx;
                        const isSelected = idx === selectedIndex;
                        currentNavIdx++;
                        rendered.push(
                          <button
                            key={article.id}
                            data-nav-index={idx}
                            onClick={() => activateItem({ type: 'article', result: article })}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                              isSelected ? 'bg-accent-muted' : 'hover:bg-accent-muted/50'
                            }`}
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">
                              {article.sportIcon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {article.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                  {article.sportName}
                                </span>
                                <span className="text-xs text-text-secondary">
                                  {formatTime(article.publishedAt ?? article.generatedAt)}
                                </span>
                              </div>
                            </div>
                          </button>,
                        );
                      }
                    }
                    return rendered;
                  })()}
                </>
              )}

              {/* No results */}
              {filteredResults.length === 0 && matchingSports.length === 0 && (
                <div className="px-4 py-8 text-center text-text-secondary text-sm">
                  No results found for &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
