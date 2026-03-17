'use client';

import { cn } from '@/lib/utils';

interface GuzzlerOutcome {
  name: string;
  odds: number;
  book: string;
  stakePct: number;
}

export type GuzzlerType = 'arb' | 'near_miss' | 'value' | 'mismatch';

export interface GuzzlerData {
  id: string;
  sportName: string;
  sportIcon: string;
  sportSlug: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: number;
  type: GuzzlerType;
  profitPercent: string;
  isArb: boolean;
  outcomes: GuzzlerOutcome[];
  allBookOdds?: { book: string; outcomes: { name: string; odds: number }[] }[];
}

// ─── Beer-themed labels per type ────────────────────────────────────────────

const BEER_LABELS: Record<string, string[]> = {
  arb_big: [
    'Ice Cold Free Money',
    'Frosty Payday',
    'Tap Room Treasure',
    'Golden Pint Alert',
  ],
  arb: [
    'Guaranteed Guzzler',
    'Free Round Detected',
    'The House Buys',
    'Liquid Gold',
  ],
  near_miss: [
    'Almost on Tap',
    'Warming Up',
    'One Sip Away',
    'Close to the Keg',
  ],
  value: [
    'Happy Hour Special',
    'Mispriced Draft',
    'Bartender Slipped',
    'Below Market Pint',
    'Clearance Keg',
    'The Good Stuff\'s Cheap',
  ],
  mismatch: [
    'Bar Fight Brewing',
    'Books Can\'t Agree',
    'Split the Tab',
    'Dueling Bartenders',
    'House Divided',
    'Odds on the Fritz',
  ],
};

function pickLabel(type: GuzzlerType, profitPct: number): string {
  const key = type === 'arb' && profitPct >= 2 ? 'arb_big' : type;
  const pool = BEER_LABELS[key] ?? BEER_LABELS.near_miss;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

const TYPE_COLORS: Record<GuzzlerType, { bg: string; text: string; border: string }> = {
  arb:       { bg: 'bg-green-500/5',  text: 'text-green-400', border: 'border-green-500/20 hover:border-green-500/40' },
  near_miss: { bg: 'bg-bg-card',      text: 'text-accent',    border: 'border-border hover:border-accent/40' },
  value:     { bg: 'bg-blue-500/5',   text: 'text-blue-400',  border: 'border-blue-500/20 hover:border-blue-500/40' },
  mismatch:  { bg: 'bg-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20 hover:border-orange-500/40' },
};

const TYPE_BADGE: Record<GuzzlerType, { bg: string; text: string; border: string; label: string }> = {
  arb:       { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30', label: 'ARB' },
  near_miss: { bg: 'bg-accent/15',     text: 'text-accent',     border: 'border-accent/30',    label: 'NEAR' },
  value:     { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30',  label: 'VALUE' },
  mismatch:  { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'SPLIT' },
};

const TYPE_METRIC: Record<GuzzlerType, { suffix: string; desc: string }> = {
  arb:       { suffix: '% profit', desc: 'guaranteed return regardless of outcome' },
  near_miss: { suffix: '% margin', desc: 'books still have a slim edge' },
  value:     { suffix: '% edge', desc: 'above market average at this book' },
  mismatch:  { suffix: '% spread', desc: 'disagreement between highest and lowest book' },
};

function formatKickoff(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1 && diffHours > 0) {
    return `${Math.floor(diffMs / (1000 * 60))}m`;
  }
  if (diffHours < 24 && diffHours > 0) {
    return `${Math.floor(diffHours)}h`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GuzzlerCard({
  guzzler,
  compact = false,
}: {
  guzzler: GuzzlerData;
  compact?: boolean;
}) {
  const profitPct = parseFloat(guzzler.profitPercent);
  const type = guzzler.type ?? (guzzler.isArb ? 'arb' : 'near_miss');
  const badge = TYPE_BADGE[type];
  const colors = TYPE_COLORS[type];
  const metric = TYPE_METRIC[type];

  if (compact) {
    return (
      <div className="flex items-start gap-3 py-3">
        <span className="text-lg shrink-0">{guzzler.sportIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                badge.bg, badge.text,
              )}
            >
              {badge.label}
            </span>
            <span className="text-[10px] text-text-muted">{formatKickoff(guzzler.commenceTime)}</span>
          </div>
          <p className="text-sm font-medium text-text-primary truncate">
            {guzzler.homeTeam} vs {guzzler.awayTeam}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className={cn('text-xs font-bold', colors.text)}>
              {profitPct > 0 ? '+' : ''}{profitPct.toFixed(1)}%
            </span>
            {guzzler.outcomes?.slice(0, 2).map((o, i) => (
              <span key={i} className="text-[10px] text-text-muted">
                {i > 0 && '/'} {o.book} {o.odds.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const label = pickLabel(type, profitPct);

  return (
    <div className={cn('rounded-xl border p-5 transition-all duration-200', colors.bg, colors.border)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{guzzler.sportIcon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {guzzler.sportName}
          </span>
        </div>
        <span
          className={cn(
            'text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border',
            badge.bg, badge.text, badge.border,
          )}
        >
          {label}
        </span>
      </div>

      {/* Matchup */}
      <h3 className="text-lg font-bold text-text-primary mb-1">
        {guzzler.homeTeam} vs {guzzler.awayTeam}
      </h3>
      <p className="text-xs text-text-muted mb-4">
        Kickoff: {new Date(guzzler.commenceTime * 1000).toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
        })}
      </p>

      {/* Metric */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">
          {type === 'arb' ? '\uD83C\uDF7A' : type === 'value' ? '\uD83C\uDF7B' : type === 'mismatch' ? '\uD83C\uDF7E' : '\uD83C\uDF7B'}
        </span>
        <div>
          <p className={cn('text-2xl font-extrabold', colors.text)}>
            {profitPct > 0 ? '+' : ''}{profitPct.toFixed(2)}{metric.suffix}
          </p>
          <p className="text-xs text-text-muted">{metric.desc}</p>
        </div>
      </div>

      {/* Outcomes */}
      {guzzler.outcomes && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {type === 'arb' ? 'Optimal Stakes ($100 total)'
              : type === 'value' ? 'Value Line vs Market'
              : type === 'mismatch' ? 'Biggest Disagreement'
              : 'Best Available Odds'}
          </p>
          {guzzler.outcomes.map((outcome, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/50 border border-border/50"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{outcome.name}</p>
                <p className="text-xs text-text-muted">
                  at <span className={cn('font-medium', colors.text)}>{outcome.book}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">{outcome.odds.toFixed(2)}</p>
                {type === 'arb' && (
                  <p className="text-xs text-text-muted">${outcome.stakePct.toFixed(0)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book comparison */}
      {guzzler.allBookOdds && guzzler.allBookOdds.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs font-semibold uppercase tracking-wider text-text-muted cursor-pointer hover:text-accent transition-colors">
            All Sportsbook Odds ({guzzler.allBookOdds.length} books)
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border/50">
                  <th className="text-left py-1 pr-3">Book</th>
                  {[...new Set(guzzler.allBookOdds.flatMap(b => b.outcomes.map(o => o.name)))].map((name, i) => (
                    <th key={i} className="text-right py-1 px-2">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guzzler.allBookOdds.map((book, i) => {
                  const allNames = [...new Set(guzzler.allBookOdds!.flatMap(b => b.outcomes.map(o => o.name)))];
                  return (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-1.5 pr-3 font-medium text-text-secondary">{book.book}</td>
                      {allNames.map((name, j) => {
                        const bookOdds = book.outcomes.find(o => o.name === name);
                        return (
                          <td key={j} className="text-right py-1.5 px-2 text-text-secondary">
                            {bookOdds?.odds.toFixed(2) ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
