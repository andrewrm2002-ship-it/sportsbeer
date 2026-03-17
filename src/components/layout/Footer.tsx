'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Footer() {
  const { data: session } = useSession();
  const [hasEmailAlerts, setHasEmailAlerts] = useState(false);

  // For logged-in users, check if they have email alerts configured
  useEffect(() => {
    if (!session?.user) return;
    // We don't have a dedicated endpoint, so we'll assume they don't have alerts
    // and direct them to the email-alerts page
    setHasEmailAlerts(false);
  }, [session?.user]);

  return (
    <footer className="border-t border-border bg-bg-card/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CTA Section */}
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 text-center">
          {!session ? (
            <>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Get the latest stories
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Sign up for Brews & Box Scores to get personalized sports news delivered with personality.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition-colors"
              >
                Sign Up Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </>
          ) : !hasEmailAlerts ? (
            <>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Never miss a story
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Set up email alerts to get breaking news and scores delivered straight to your inbox.
              </p>
              <Link
                href="/email-alerts"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-accent hover:bg-accent-hover text-bg-primary rounded-lg transition-colors"
              >
                Set Up Email Alerts
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-accent">
              <span className="text-xl">&#x1F37A;</span>
              <span className="text-lg font-bold">Brews & Box Scores</span>
            </div>
            <p className="text-sm text-text-muted italic">
              Where Sports News Gets a Cold One
            </p>
            <p className="text-xs text-text-muted/70 mt-1">
              Powered by bad puns and cold beer.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="text-sm font-semibold text-text-primary mb-1">Quick Links</h4>
            <Link href="/" className="text-sm text-text-muted hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/sports" className="text-sm text-text-muted hover:text-accent transition-colors">
              Sports
            </Link>
            <Link href="/admin" className="text-sm text-text-muted hover:text-accent transition-colors">
              Admin
            </Link>
            <Link href="/preferences" className="text-sm text-text-muted hover:text-accent transition-colors">
              Preferences
            </Link>
          </div>

          {/* Legal / Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-xs text-text-muted">
              AI-powered sports coverage served with personality.
            </p>
            <p className="text-xs text-text-muted mt-2">
              &copy; {new Date().getFullYear()} Brews & Box Scores. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
