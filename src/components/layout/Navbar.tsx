'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserMenu } from '@/components/auth/UserMenu';
import { SearchModal } from '@/components/search/SearchModal';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/sports', label: 'Sports' },
  ];

  if (session) {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg-card/95 backdrop-blur-sm border-b border-border">
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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(link.href)
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search + Theme + Auth / User */}
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
          mobileOpen ? 'max-h-96 border-t border-border' : 'max-h-0'
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'text-accent bg-accent/10'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted'
              )}
            >
              {link.label}
            </Link>
          ))}
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
