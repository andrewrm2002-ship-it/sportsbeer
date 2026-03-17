'use client';

import { cn } from '@/lib/utils';

interface GuzzlerOutcome {
  name: string;
  odds: number;
  book: string;
  stakePct: number;
}

export interface GuzzlerData {
  id: string;
  sportName: string;
  sportIcon: string;
  sportSlug: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: number;
  profitPercent: string;
  isArb: boolean;
  outcomes: GuzzlerOutcome[];
  allBookOdds?: { book: string; outcomes: { name: string; odds: number }[] }[];
}

const BEER_LABELS = {
  bigArb: [
    'Ice Cold Free Money',
    'Frosty Payday',
    'Tap Room Treasure',
    'Golden Pint Alert',
  ],
  smallArb: [
    'Guaranteed Guzzler',
    'Free Round Detected',
    'The House Buys',
    'Liquid Gold',
  ],
  nearMiss: [
    'Almost on Tap',
    'Warming Up',
    'One Sip Away',
    'Close to the Keg',
  ],
};

function getBeerLabel(profitPct: number, isArb: boolean): string {
  if (isArb && profitPct >= 2) {
    return BEER_LABELS.bigArb[Math.floor(Math.random() * BEER_LABELS.bigArb.length)]!;
  }
  if (isArb) {
    return BEER_LABELS.smallArb[Math.floor(Math.random() * BEER_LABELS.smallArb.length)]!;
  }
  return BEER_LABELS.nearMiss[Math.floor(Math.random() * BEER_LABELS.nearMiss.length)]!;
}

function formatKickoff(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1 && diffHours > 0) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return `${mins}m`;
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
  const label = getBeerLabel(profitPct, guzzler.isArb);

  if (compact) {
    return (
      <div className="flex items-start gap-3 py-3">
        <span className="text-lg shrink-0">{guzzler.sportIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                guzzler.isArb
                  ? 'bg-green-500/15 text-green-400'
                  : 'bg-accent/15 text-accent',
              )}
            >
              {guzzler.isArb ? 'ARB' : 'NEAR'}
            </span>
            <span className="text-[10px] text-text-muted">{formatKickoff(guzzler.commenceTime)}</span>
          </div>
          <p className="text-sm font-medium text-text-primary truncate">
            {guzzler.homeTeam} vs {guzzler.awayTeam}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span
              className={cn(
                'text-xs font-bold',
                guzzler.isArb ? 'text-green-400' : 'text-accent',
              )}
            >
              {profitPct > 0 ? '+' : ''}{profitPct.toFixed(2)}%
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

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        guzzler.isArb
          ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
          : 'bg-bg-card border-border hover:border-accent/40',
      )}
    >
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
            'text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full',
            guzzler.isArb
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-accent/15 text-accent border border-accent/30',
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
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })}
      </p>

      {/* Profit */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">
          {guzzler.isArb ? '\uD83C\uDF7A' : '\uD83C\uDF7B'}
        </span>
        <div>
          <p
            className={cn(
              'text-2xl font-extrabold',
              guzzler.isArb ? 'text-green-400' : 'text-accent',
            )}
          >
            {profitPct > 0 ? '+' : ''}{profitPct.toFixed(2)}%
          </p>
          <p className="text-xs text-text-muted">
            {guzzler.isArb
              ? 'guaranteed return regardless of outcome'
              : 'margin — books still have a slim edge'}
          </p>
        </div>
      </div>

      {/* Outcomes / stake breakdown */}
      {guzzler.outcomes && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {guzzler.isArb ? 'Optimal Stakes ($100 total)' : 'Best Available Odds'}
          </p>
          {guzzler.outcomes.map((outcome, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/50 border border-border/50"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">
                  {outcome.name}
                </p>
                <p className="text-xs text-text-muted">
                  at <span className="font-medium text-accent">{outcome.book}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">
                  {outcome.odds.toFixed(2)}
                </p>
                {guzzler.isArb && (
                  <p className="text-xs text-text-muted">
                    ${outcome.stakePct.toFixed(0)}
                  </p>
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
                  {guzzler.outcomes?.map((o, i) => (
                    <th key={i} className="text-right py-1 px-2">{o.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guzzler.allBookOdds.map((book, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-3 font-medium text-text-secondary">
                      {book.book}
                    </td>
                    {guzzler.outcomes?.map((bestOutcome, j) => {
                      const bookOdds = book.outcomes.find(
                        (o) => o.name === bestOutcome.name,
                      );
                      const isBest =
                        bookOdds &&
                        bookOdds.odds === bestOutcome.odds &&
                        book.book === bestOutcome.book;
                      return (
                        <td
                          key={j}
                          className={cn(
                            'text-right py-1.5 px-2',
                            isBest
                              ? 'font-bold text-green-400'
                              : 'text-text-secondary',
                          )}
                        >
                          {bookOdds?.odds.toFixed(2) ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
