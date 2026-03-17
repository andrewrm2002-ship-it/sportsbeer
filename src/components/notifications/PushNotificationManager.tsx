'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface PushSettings {
  enabled: boolean;
  sportIds: string[];
  breakingOnly: boolean;
}

const STORAGE_KEY = 'push-notification-settings';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LAST_CHECK_KEY = 'push-last-article-check';

function getSettings(): PushSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, sportIds: [], breakingOnly: false };
}

function saveSettings(settings: PushSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function PushNotificationManager() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<PushSettings>({ enabled: false, sportIds: [], breakingOnly: false });
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [sports, setSports] = useState<{ id: string; name: string; icon: string }[]>([]);

  useEffect(() => {
    setSettings(getSettings());
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    fetch('/api/sports')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSports(data);
      })
      .catch(() => {});
  }, []);

  // Polling for new articles
  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    const checkForNewArticles = async () => {
      try {
        const lastCheck = localStorage.getItem(LAST_CHECK_KEY) || new Date(Date.now() - CHECK_INTERVAL).toISOString();
        const res = await fetch('/api/articles?limit=5');
        if (!res.ok) return;
        const articles = await res.json();
        if (!Array.isArray(articles) || articles.length === 0) return;

        const lastCheckTime = new Date(lastCheck).getTime();
        const newArticles = articles.filter((a: { publishedAt: number | null; generatedAt: number; sportId: string; category: string }) => {
          const articleTime = (a.publishedAt || a.generatedAt) * 1000;
          if (articleTime <= lastCheckTime) return false;
          if (settings.sportIds.length > 0 && !settings.sportIds.includes(a.sportId)) return false;
          if (settings.breakingOnly && a.category !== 'news') return false;
          return true;
        });

        if (newArticles.length > 0) {
          const article = newArticles[0];
          new Notification('Brews & Box Scores', {
            body: article.title,
            icon: '/favicon.ico',
            tag: `article-${article.id}`,
            data: { url: `/sports/${article.sportSlug}/${article.id}` },
          });
        }

        localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
      } catch {}
    };

    const interval = setInterval(checkForNewArticles, CHECK_INTERVAL);
    checkForNewArticles();

    return () => clearInterval(interval);
  }, [settings, permission]);

  // Listen for notification clicks
  useEffect(() => {
    if (!('Notification' in window)) return;

    const handleClick = (e: Event) => {
      const notification = e as unknown as { data?: { url?: string } };
      if (notification?.data?.url) {
        window.focus();
        window.location.href = notification.data.url;
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleClick);
      return () => navigator.serviceWorker.removeEventListener('message', handleClick);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveSettings(newSettings);
      // Send a test notification
      new Notification('Brews & Box Scores', {
        body: 'Notifications enabled! You\'ll get alerts for new stories.',
        icon: '/favicon.ico',
      });
    }
  }, [settings]);

  const toggleEnabled = useCallback(() => {
    if (!settings.enabled && permission !== 'granted') {
      requestPermission();
      return;
    }
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings, permission, requestPermission]);

  const toggleSport = useCallback((sportId: string) => {
    setSettings((prev) => {
      const sportIds = prev.sportIds.includes(sportId)
        ? prev.sportIds.filter((id) => id !== sportId)
        : [...prev.sportIds, sportId];
      const newSettings = { ...prev, sportIds };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const toggleBreakingOnly = useCallback(() => {
    setSettings((prev) => {
      const newSettings = { ...prev, breakingOnly: !prev.breakingOnly };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  if (!session) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          settings.enabled
            ? 'text-accent bg-accent/10'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
        }`}
        title="Notification settings"
        aria-label="Notification settings"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          {settings.enabled && <circle cx="18" cy="4" r="3" fill="currentColor" stroke="none" />}
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary">Push Notifications</h3>
                <button
                  onClick={toggleEnabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabled ? 'bg-accent' : 'bg-bg-elevated border border-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {permission === 'denied' && (
                <p className="text-xs text-error mt-2">
                  Notifications blocked. Enable them in your browser settings.
                </p>
              )}
            </div>

            {settings.enabled && (
              <>
                <div className="p-4 border-b border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.breakingOnly}
                      onChange={toggleBreakingOnly}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">Breaking news only</span>
                      <p className="text-xs text-text-muted">Only notify for major stories</p>
                    </div>
                  </label>
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                    {settings.sportIds.length === 0 ? 'All sports (tap to filter)' : `${settings.sportIds.length} sport${settings.sportIds.length !== 1 ? 's' : ''} selected`}
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => toggleSport(sport.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          settings.sportIds.includes(sport.id)
                            ? 'bg-accent/20 text-accent border border-accent/40'
                            : 'bg-bg-elevated text-text-muted border border-border hover:border-accent/20'
                        }`}
                      >
                        <span>{sport.icon}</span>
                        {sport.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
