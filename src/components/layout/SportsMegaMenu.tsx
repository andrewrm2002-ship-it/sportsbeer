'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  sortOrder: number;
  articleCount: number;
}

interface SportsMegaMenuProps {
  preferredSportIds: string[];
  isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  team: 'Team Sports',
  individual: 'Individual Sports',
  combat: 'Combat Sports',
  motor: 'Motor Sports',
  water: 'Water Sports',
};

export function SportsMegaMenu({ preferredSportIds, isActive }: SportsMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filter, setFilter] = useState('');
  const [loaded, setLoaded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Fetch sports on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/sports')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setSports(data);
          setLoaded(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setFilter('');
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const filterLower = filter.toLowerCase();

  const filteredSports = useMemo(() => {
    if (!filterLower) return sports;
    return sports.filter(
      (s) =>
        s.name.toLowerCase().includes(filterLower) ||
        s.category.toLowerCase().includes(filterLower)
    );
  }, [sports, filterLower]);

  const yourSports = useMemo(
    () => filteredSports.filter((s) => preferredSportIds.includes(s.id)),
    [filteredSports, preferredSportIds]
  );

  const groupedSports = useMemo(() => {
    const groups: Record<string, Sport[]> = {};
    for (const sport of filteredSports) {
      if (!groups[sport.category]) groups[sport.category] = [];
      groups[sport.category].push(sport);
    }
    return groups;
  }, [filteredSports]);

  // Desktop hover with delay
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5',
          isActive
            ? 'text-accent bg-accent/10'
            : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
        )}
      >
        Sports
        <svg
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[560px] max-h-[70vh] overflow-y-auto bg-bg-card border border-border rounded-xl shadow-xl z-50"
        >
          <div className="p-4">
            {/* Search filter */}
            <div className="relative mb-4">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Filter sports..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-bg-input border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            {!loaded && (
              <div className="text-sm text-text-muted text-center py-4">Loading sports...</div>
            )}

            {loaded && filteredSports.length === 0 && (
              <div className="text-sm text-text-muted text-center py-4">No sports found</div>
            )}

            {/* Your Sports section */}
            {yourSports.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                  Your Sports
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  {yourSports.map((sport) => (
                    <Link
                      key={sport.id}
                      href={`/sports/${sport.slug}`}
                      onClick={() => setOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
                    >
                      <span>{sport.icon}</span>
                      <span>{sport.name}</span>
                      {sport.articleCount > 0 && (
                        <span className="ml-auto text-xs text-text-muted">
                          {sport.articleCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="border-b border-border mt-3 mb-3" />
              </div>
            )}

            {/* All Sports by category */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                All Sports
              </h3>
              {Object.entries(groupedSports).map(([category, categorySports]) => (
                <div key={category} className="mb-3">
                  <h4 className="text-xs font-medium text-text-muted/70 mb-1 px-3">
                    {CATEGORY_LABELS[category] || category}
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {categorySports.map((sport) => (
                      <Link
                        key={sport.id}
                        href={`/sports/${sport.slug}`}
                        onClick={() => setOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
                      >
                        <span>{sport.icon}</span>
                        <span>{sport.name}</span>
                        {sport.articleCount > 0 && (
                          <span className="ml-auto text-xs text-text-muted">
                            {sport.articleCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* View all link */}
            <div className="border-t border-border pt-3 mt-2">
              <Link
                href="/sports"
                onClick={() => setOpen(false)}
                className="block text-center text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                View All Sports
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile version for use inside mobile menu ───────────────────────────────

interface MobileSportsMegaMenuProps {
  preferredSportIds: string[];
  onLinkClick: () => void;
}

export function MobileSportsMegaMenu({ preferredSportIds, onLinkClick }: MobileSportsMegaMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [filter, setFilter] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/sports')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setSports(data);
          setLoaded(true);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const filterLower = filter.toLowerCase();
  const filteredSports = useMemo(() => {
    if (!filterLower) return sports;
    return sports.filter(
      (s) =>
        s.name.toLowerCase().includes(filterLower) ||
        s.category.toLowerCase().includes(filterLower)
    );
  }, [sports, filterLower]);

  const yourSports = useMemo(
    () => filteredSports.filter((s) => preferredSportIds.includes(s.id)),
    [filteredSports, preferredSportIds]
  );

  const groupedSports = useMemo(() => {
    const groups: Record<string, Sport[]> = {};
    for (const sport of filteredSports) {
      if (!groups[sport.category]) groups[sport.category] = [];
      groups[sport.category].push(sport);
    }
    return groups;
  }, [filteredSports]);

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
      >
        <span>Sports</span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            expanded && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="pl-4 pr-2 pb-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Filter sports..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 mb-2 text-sm bg-bg-input border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />

          {!loaded && (
            <div className="text-sm text-text-muted py-2 px-3">Loading...</div>
          )}

          {/* Your Sports */}
          {yourSports.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-1 px-3">
                Your Sports
              </h4>
              {yourSports.map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.slug}`}
                  onClick={onLinkClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </Link>
              ))}
              <div className="border-b border-border my-1" />
            </div>
          )}

          {/* All Sports grouped */}
          {Object.entries(groupedSports).map(([category, categorySports]) => (
            <div key={category} className="mb-2">
              <h4 className="text-xs font-medium text-text-muted/70 mb-1 px-3">
                {CATEGORY_LABELS[category] || category}
              </h4>
              {categorySports.map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.slug}`}
                  onClick={onLinkClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </Link>
              ))}
            </div>
          ))}

          <Link
            href="/sports"
            onClick={onLinkClick}
            className="block text-center text-sm font-medium text-accent hover:text-accent-hover py-2 transition-colors"
          >
            View All Sports
          </Link>
        </div>
      )}
    </div>
  );
}
