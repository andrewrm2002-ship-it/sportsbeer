'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserMenu } from '@/components/auth/UserMenu';
import { SearchModal } from '@/components/search/SearchModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { SportsMegaMenu, MobileSportsMegaMenu } from '@/components/layout/SportsMegaMenu';
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager';
import { cn } from '@/lib/utils';

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Preference-driven nav tabs & mega-menu data
  const [preferredSportIds, setPreferredSportIds] = useState<string[]>([]);
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const handleSearchClose = useCallback(() => setSearchOpen(false), []);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch preferences for logged-in users
  useEffect(() => {
    if (!session?.user) {
      setPreferredSportIds([]);
      setBookmarkCount(0);
      return;
    }

    fetch('/api/preferences')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.sportIds) setPreferredSportIds(data.sportIds);
      })
      .catch(() => {});

    // Fetch bookmark count
    fetch('/api/bookmarks')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setBookmarkCount(data.length);
      })
      .catch(() => {});
  }, [session?.user]);

  // Fetch all sports for preference tabs
  useEffect(() => {
    fetch('/api/sports')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllSports(data);
      })
      .catch(() => {});
  }, []);

  // Get top 5 preferred sports for quick-access tabs
  const preferredSportTabs = allSports
    .filter((s) => preferredSportIds.includes(s.id))
    .slice(0, 5);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors"
          >
            <span className="text-2xl">&#x1F37A;</span>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              Brews & Box Scores
            </span>
            <span className="text-lg font-bold tracking-tight sm:hidden">
              B&BS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Home link */}
            <Link
              href="/"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5',
                isActive('/')
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              Home
            </Link>

            {/* Preference-driven quick-access tabs (desktop only) */}
            {session && preferredSportTabs.length > 0 && (
              <>
                {preferredSportTabs.map((sport) => (
                  <Link
                    key={sport.id}
                    href={`/sports/${sport.slug}`}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5',
                      pathname === `/sports/${sport.slug}`
                        ? 'text-accent bg-accent/10'
                        : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
                    )}
                  >
                    <span className="text-base">{sport.icon}</span>
                    <span>{sport.name}</span>
                  </Link>
                ))}
              </>
            )}

            {/* Sports Mega-Menu */}
            <SportsMegaMenu
              preferredSportIds={preferredSportIds}
              isActive={pathname.startsWith('/sports')}
            />

            {/* Guzzlers link */}
            <Link
              href="/guzzlers"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5',
                isActive('/guzzlers')
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              <span className="text-base">&#x1F37A;</span>
              Guzzlers
            </Link>

            {/* Bookmarks link with counter */}
            {session && (
              <Link
                href="/bookmarks"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5 relative',
                  isActive('/bookmarks')
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
                )}
              >
                <svg
                  className="w-4 h-4"
                  fill={bookmarkCount > 0 ? 'currentColor' : 'none'}
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
                Bookmarks
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-bg-primary bg-accent rounded-full">
                    {bookmarkCount > 99 ? '99+' : bookmarkCount}
                  </span>
                )}
              </Link>
            )}

            {/* Admin link */}
            {session && (
              <Link
                href="/admin"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1.5',
                  isActive('/admin')
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
                )}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Search + Alerts + Theme + Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
              aria-label="Search articles (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <PushNotificationManager />
            <ThemeToggle />
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full skeleton" />
            ) : session ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search + Hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
              aria-label="Search articles"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
              aria-label="Toggle navigation menu"
            >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          mobileOpen ? 'max-h-[80vh] overflow-y-auto border-t border-border' : 'max-h-0'
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {/* Home */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              isActive('/')
                ? 'text-accent bg-accent/10'
                : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
            )}
          >
            Home
          </Link>

          {/* Mobile Sports Mega-Menu (includes preference tabs on mobile) */}
          <MobileSportsMegaMenu
            preferredSportIds={preferredSportIds}
            onLinkClick={() => setMobileOpen(false)}
          />

          {/* Guzzlers */}
          <Link
            href="/guzzlers"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              isActive('/guzzlers')
                ? 'text-accent bg-accent/10'
                : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
            )}
          >
            <span className="text-base">&#x1F37A;</span>
            Guzzlers
          </Link>

          {/* Bookmarks with counter */}
          {session && (
            <Link
              href="/bookmarks"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive('/bookmarks')
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              <svg
                className="w-4 h-4"
                fill={bookmarkCount > 0 ? 'currentColor' : 'none'}
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
              Bookmarks
              {bookmarkCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-bg-primary bg-accent rounded-full">
                  {bookmarkCount > 99 ? '99+' : bookmarkCount}
                </span>
              )}
            </Link>
          )}

          {/* Admin */}
          {session && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive('/admin')
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              Admin
            </Link>
          )}

          {session && (
            <Link
              href="/email-alerts"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive('/email-alerts')
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Email Alerts
            </Link>
          )}
          <button
            onClick={() => {
              setSearchOpen(true);
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Articles
          </button>
          <div className="px-4 py-2">
            <ThemeToggle />
          </div>
          <div className="border-t border-border pt-3 mt-3">
            {session ? (
              <div className="px-4 py-2">
                <UserMenu mobile />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover text-bg-primary text-center transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={handleSearchClose} />
    </nav>
  );
}
