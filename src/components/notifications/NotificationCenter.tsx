'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'new_article' | 'breaking' | 'system';
  title: string;
  message: string;
  articleId: string | null;
  isRead: boolean;
  createdAt: number;
}

const TYPE_ICONS: Record<string, string> = {
  new_article: '\u{1F4F0}',
  breaking: '\u{1F6A8}',
  system: '\u{2699}\uFE0F',
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // Silent fail for notification polling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  async function markAllRead() {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch {
      // Silent fail
    }
  }

  async function markRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-error text-white rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl block mb-2">&#x1F389;</span>
                <p className="text-sm text-text-muted">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const content = (
                  <div
                    className="flex gap-3 px-4 py-3 hover:bg-bg-elevated/50 transition-colors cursor-pointer border-b border-border/50 last:border-0"
                    onClick={() => markRead(n.id)}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[n.type] || '\u{1F514}'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-text-muted/60 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );

                return n.articleId ? (
                  <Link
                    key={n.id}
                    href={`/sports/all/${n.articleId}`}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
