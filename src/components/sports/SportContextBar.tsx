'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
}

interface SportContextBarProps {
  currentSlug: string;
}

export function SportContextBar({ currentSlug }: SportContextBarProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports');
        if (res.ok) {
          const data = await res.json();
          setSports(data);
        }
      } catch {
        // Non-critical, fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchSports();
  }, []);

  // Scroll active pill into view on load
  useEffect(() => {
    if (!loading && activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      const scrollLeft =
        active.offsetLeft -
        container.offsetLeft -
        containerRect.width / 2 +
        activeRect.width / 2;

      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [loading, currentSlug]);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden py-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-24 skeleton rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (sports.length === 0) return null;

  return (
    <nav aria-label="Sport navigation" className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-bg-primary/80 backdrop-blur-md border-b border-border/50">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sports.map((sport) => {
          const isCurrent = sport.slug === currentSlug;
          return (
            <Link
              key={sport.id}
              ref={isCurrent ? activeRef : undefined}
              href={`/sports/${sport.slug}`}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                whitespace-nowrap flex-shrink-0 snap-start transition-all duration-200
                ${
                  isCurrent
                    ? 'bg-accent text-bg-primary shadow-md shadow-accent/20'
                    : 'bg-bg-elevated/60 text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }
              `}
            >
              <span className="text-base">{sport.icon}</span>
              <span>{sport.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
