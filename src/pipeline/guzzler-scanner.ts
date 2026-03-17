/**
 * Guaranteed Guzzlers — odds scanner.
 * Fetches odds from The Odds API, detects:
 *   - Arbs: implied probabilities across books sum to <100%
 *   - Value bets: one book's odds significantly above market average
 *   - Mismatches: biggest disagreements between books on the same outcome
 */

import { db } from '../../db';
import { guzzlers } from '../../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import {
  fetchAllOdds,
  type OddsApiEvent,
  type OddsLeagueMapping,
} from './fetchers/odds-api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GuzzlerOutcome {
  name: string;
  odds: number;
  book: string;
  stakePct: number;
}

export interface GuzzlerOpportunity {
  eventKey: string;
  sportId: string;
  leagueId: string | null;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  type: 'arb' | 'near_miss' | 'value' | 'mismatch';
  profitPercent: number;
  isArb: boolean;
  outcomes: GuzzlerOutcome[];
  allBookOdds: { book: string; outcomes: { name: string; odds: number }[] }[];
}

export interface ScanResult {
  totalEvents: number;
  arbsFound: number;
  nearMissesFound: number;
  valueBetsFound: number;
  mismatchesFound: number;
  leaguesScanned: number;
  errors: string[];
  requestsRemaining?: number;
}

// ─── Thresholds ─────────────────────────────────────────────────────────────

/** Arb near-miss: store when combined implied prob < this */
const NEAR_MISS_THRESHOLD = 1.05;
/** Value bet: book's odds must be this % above market average */
const VALUE_EDGE_MIN = 8;
/** Mismatch: max-min spread must be this % of min odds */
const MISMATCH_SPREAD_MIN = 15;
/** Max value bets to keep per scan (top N by edge) */
const MAX_VALUE_BETS = 30;
/** Max mismatches to keep per scan (top N by spread) */
const MAX_MISMATCHES = 20;

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ParsedEvent {
  event: OddsApiEvent;
  mapping: OddsLeagueMapping;
  outcomeNames: string[];
  /** For each outcome: array of { odds, book } across all books */
  oddsByOutcome: Map<string, { odds: number; book: string }[]>;
  /** Best (highest) odds per outcome */
  bestOdds: Map<string, { odds: number; book: string }>;
  allBookOdds: { book: string; outcomes: { name: string; odds: number }[] }[];
}

/**
 * Separate books into 2-way (moneyline) and 3-way (regulation h2h with draw) groups.
 * Only compare like-for-like to avoid fake arbs from mixing market types.
 * Returns the larger group so we maximize book coverage.
 */
function partitionBooks(event: OddsApiEvent): OddsApiEvent['bookmakers'] {
  const twoWay: OddsApiEvent['bookmakers'] = [];
  const threeWay: OddsApiEvent['bookmakers'] = [];

  for (const book of event.bookmakers) {
    const h2h = book.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;
    const hasDraw = h2h.outcomes.some((o) => o.name === 'Draw');
    if (hasDraw) {
      threeWay.push(book);
    } else {
      twoWay.push(book);
    }
  }

  // Use whichever group has more books for better coverage
  if (threeWay.length >= twoWay.length && threeWay.length >= 2) {
    return threeWay;
  }
  return twoWay;
}

function parseEvent(event: OddsApiEvent, mapping: OddsLeagueMapping): ParsedEvent | null {
  // Skip events that have already started — live odds are not actionable for arb
  const commence = new Date(event.commence_time);
  if (commence.getTime() < Date.now()) return null;

  const books = partitionBooks(event);
  if (books.length < 2) return null;

  const outcomeNames = new Set<string>();
  const oddsByOutcome = new Map<string, { odds: number; book: string }[]>();

  for (const book of books) {
    const h2h = book.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;
    for (const outcome of h2h.outcomes) {
      outcomeNames.add(outcome.name);
      const existing = oddsByOutcome.get(outcome.name) ?? [];
      existing.push({ odds: outcome.price, book: book.title });
      oddsByOutcome.set(outcome.name, existing);
    }
  }

  if (outcomeNames.size < 2) return null;

  // Best odds per outcome
  const bestOdds = new Map<string, { odds: number; book: string }>();
  for (const [name, entries] of oddsByOutcome) {
    let best = entries[0]!;
    for (const entry of entries) {
      if (entry.odds > best.odds) best = entry;
    }
    bestOdds.set(name, best);
  }

  // Keep the comparison table aligned with the market set used for detection.
  const allBookOdds = books
    .map((b) => {
      const h2h = b.markets.find((m) => m.key === 'h2h');
      if (!h2h) return null;
      return {
        book: b.title,
        outcomes: h2h.outcomes.map((o) => ({ name: o.name, odds: o.price })),
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  return {
    event,
    mapping,
    outcomeNames: [...outcomeNames],
    oddsByOutcome,
    bestOdds,
    allBookOdds,
  };
}

function makeBaseOpportunity(
  parsed: ParsedEvent,
  type: GuzzlerOpportunity['type'],
  profitPercent: number,
  outcomes: GuzzlerOutcome[],
): GuzzlerOpportunity {
  return {
    eventKey: parsed.event.id,
    sportId: parsed.mapping.sportId,
    leagueId: parsed.mapping.leagueId,
    homeTeam: parsed.event.home_team,
    awayTeam: parsed.event.away_team,
    commenceTime: new Date(parsed.event.commence_time),
    type,
    profitPercent,
    isArb: type === 'arb',
    outcomes,
    allBookOdds: parsed.allBookOdds,
  };
}

// ─── Arb / Near-Miss Detection ──────────────────────────────────────────────

function detectArb(parsed: ParsedEvent): GuzzlerOpportunity | null {
  let totalImplied = 0;
  for (const [, { odds }] of parsed.bestOdds) {
    totalImplied += 1 / odds;
  }

  if (totalImplied >= NEAR_MISS_THRESHOLD) return null;

  const profitPercent = parseFloat(((1 / totalImplied - 1) * 100).toFixed(2));
  const isArb = totalImplied < 1;
  const type = isArb ? 'arb' as const : 'near_miss' as const;

  const outcomes: GuzzlerOutcome[] = [];
  for (const [name, { odds, book }] of parsed.bestOdds) {
    outcomes.push({
      name,
      odds,
      book,
      stakePct: parseFloat((((1 / odds) / totalImplied) * 100).toFixed(2)),
    });
  }

  return makeBaseOpportunity(parsed, type, profitPercent, outcomes);
}

// ─── Value Bet Detection ────────────────────────────────────────────────────

function detectValueBets(parsed: ParsedEvent): GuzzlerOpportunity[] {
  const results: GuzzlerOpportunity[] = [];

  for (const [name, entries] of parsed.oddsByOutcome) {
    if (entries.length < 3) continue; // need enough books for meaningful average

    const avg = entries.reduce((sum, e) => sum + e.odds, 0) / entries.length;
    const best = parsed.bestOdds.get(name)!;
    const edge = ((best.odds - avg) / avg) * 100;

    if (edge < VALUE_EDGE_MIN) continue;

    // Build outcomes: the value outcome first, then others for context
    const outcomes: GuzzlerOutcome[] = [
      { name, odds: best.odds, book: best.book, stakePct: 100 },
    ];
    // Add the other outcomes at market average for reference
    for (const [otherName, otherBest] of parsed.bestOdds) {
      if (otherName === name) continue;
      const otherEntries = parsed.oddsByOutcome.get(otherName) ?? [];
      const otherAvg = otherEntries.length > 0
        ? otherEntries.reduce((s, e) => s + e.odds, 0) / otherEntries.length
        : otherBest.odds;
      outcomes.push({
        name: otherName,
        odds: otherBest.odds,
        book: otherBest.book,
        stakePct: parseFloat(((otherAvg / best.odds) * 100).toFixed(2)),
      });
    }

    results.push(
      makeBaseOpportunity(parsed, 'value', parseFloat(edge.toFixed(2)), outcomes),
    );
  }

  return results;
}

// ─── Mismatch Detection ─────────────────────────────────────────────────────

function detectMismatch(parsed: ParsedEvent): GuzzlerOpportunity | null {
  let maxSpread = 0;
  let maxSpreadOutcome = '';

  for (const [name, entries] of parsed.oddsByOutcome) {
    if (entries.length < 3) continue;

    const odds = entries.map((e) => e.odds);
    const min = Math.min(...odds);
    const max = Math.max(...odds);
    const spread = ((max - min) / min) * 100;

    if (spread > maxSpread) {
      maxSpread = spread;
      maxSpreadOutcome = name;
    }
  }

  if (maxSpread < MISMATCH_SPREAD_MIN || !maxSpreadOutcome) return null;

  const entries = parsed.oddsByOutcome.get(maxSpreadOutcome)!;
  const sorted = [...entries].sort((a, b) => b.odds - a.odds);
  const highest = sorted[0]!;
  const lowest = sorted[sorted.length - 1]!;

  const outcomes: GuzzlerOutcome[] = [
    { name: `${maxSpreadOutcome} (highest)`, odds: highest.odds, book: highest.book, stakePct: 0 },
    { name: `${maxSpreadOutcome} (lowest)`, odds: lowest.odds, book: lowest.book, stakePct: 0 },
  ];

  // Add other outcomes for context
  for (const [name, best] of parsed.bestOdds) {
    if (name === maxSpreadOutcome) continue;
    outcomes.push({ name, odds: best.odds, book: best.book, stakePct: 0 });
  }

  return makeBaseOpportunity(parsed, 'mismatch', parseFloat(maxSpread.toFixed(2)), outcomes);
}

// ─── Scanner ────────────────────────────────────────────────────────────────

export async function scanForGuzzlers(): Promise<ScanResult> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return {
      totalEvents: 0, arbsFound: 0, nearMissesFound: 0,
      valueBetsFound: 0, mismatchesFound: 0, leaguesScanned: 0,
      errors: ['ODDS_API_KEY not configured. Get a free key at https://the-odds-api.com'],
    };
  }

  const result: ScanResult = {
    totalEvents: 0, arbsFound: 0, nearMissesFound: 0,
    valueBetsFound: 0, mismatchesFound: 0, leaguesScanned: 0, errors: [],
  };

  try {
    // 1. Expire events that have started
    await db
      .update(guzzlers)
      .set({ status: 'started' })
      .where(and(eq(guzzlers.status, 'active'), lt(guzzlers.commenceTime, new Date())));

    // 2. Fetch odds
    console.log('Scanning for Guaranteed Guzzlers...');
    const { results: oddsResults, errors, requestsRemaining } = await fetchAllOdds(apiKey);
    result.errors.push(...errors);
    result.requestsRemaining = requestsRemaining;

    // 3. Analyze all events
    const allArbs: GuzzlerOpportunity[] = [];
    const allValueBets: GuzzlerOpportunity[] = [];
    const allMismatches: GuzzlerOpportunity[] = [];

    for (const { mapping, events } of oddsResults) {
      result.leaguesScanned++;
      result.totalEvents += events.length;

      for (const event of events) {
        const parsed = parseEvent(event, mapping);
        if (!parsed) continue;

        // Arb / near-miss (always keep all of these)
        const arb = detectArb(parsed);
        if (arb) allArbs.push(arb);

        // Value bets
        const values = detectValueBets(parsed);
        allValueBets.push(...values);

        // Mismatch
        const mismatch = detectMismatch(parsed);
        if (mismatch) allMismatches.push(mismatch);
      }
    }

    // 4. Sort and cap value bets / mismatches
    allValueBets.sort((a, b) => b.profitPercent - a.profitPercent);
    allMismatches.sort((a, b) => b.profitPercent - a.profitPercent);
    const topValueBets = allValueBets.slice(0, MAX_VALUE_BETS);
    const topMismatches = allMismatches.slice(0, MAX_MISMATCHES);

    const allOpportunities = [...allArbs, ...topValueBets, ...topMismatches];

    // 5. Replace active guzzlers
    await db
      .update(guzzlers)
      .set({ status: 'expired' })
      .where(eq(guzzlers.status, 'active'));

    // 6. Insert
    for (const opp of allOpportunities) {
      try {
        await db.insert(guzzlers).values({
          sportId: opp.sportId,
          leagueId: opp.leagueId,
          eventKey: opp.eventKey,
          homeTeam: opp.homeTeam,
          awayTeam: opp.awayTeam,
          commenceTime: opp.commenceTime,
          market: 'h2h',
          type: opp.type,
          profitPercent: opp.profitPercent.toFixed(2),
          isArb: opp.isArb,
          outcomes: opp.outcomes,
          allBookOdds: opp.allBookOdds,
          status: 'active',
        });

        switch (opp.type) {
          case 'arb': result.arbsFound++; break;
          case 'near_miss': result.nearMissesFound++; break;
          case 'value': result.valueBetsFound++; break;
          case 'mismatch': result.mismatchesFound++; break;
        }
      } catch (error) {
        console.error(
          `Failed to save guzzler ${opp.homeTeam} vs ${opp.awayTeam} (${opp.type}):`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log(
      `Guzzler scan complete: ${result.arbsFound} arbs, ${result.nearMissesFound} near-misses, ` +
      `${result.valueBetsFound} value bets, ${result.mismatchesFound} mismatches ` +
      `from ${result.leaguesScanned} leagues (${result.totalEvents} events)`,
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Scanner error: ${msg}`);
    console.error('Guzzler scan failed:', msg);
  }

  return result;
}
