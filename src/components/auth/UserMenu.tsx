'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  mobile?: boolean;
}

export function UserMenu({ mobile = false }: UserMenuProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const userName = session?.user?.name || 'User';
  const initials = userName.slice(0, 2).toUpperCase();

  const menuItems = [
    { href: '/preferences', label: 'Preferences', icon: '&#x2699;&#xFE0F;' },
    { href: '/admin', label: 'Admin Panel', icon: '&#x1F6E0;&#xFE0F;' },
  ];

  if (mobile) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-text-primary">{userName}</span>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
          >
            <span dangerouslySetInnerHTML={{ __html: item.icon }} /> {item.label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left px-4 py-3 rounded-lg text-sm text-error hover:bg-error/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent-muted transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-text-primary hidden lg:inline">
          {userName}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-text-muted transition-transform duration-200',
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
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl bg-bg-card border border-border shadow-xl shadow-black/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text-primary">{userName}</p>
            <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-accent-muted transition-colors"
              >
                <span dangerouslySetInnerHTML={{ __html: item.icon }} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <span>&#x1F6AA;</span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
