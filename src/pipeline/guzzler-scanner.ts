/**
 * Guaranteed Guzzlers — arbitrage scanner.
 * Fetches odds from The Odds API, detects arbs (and near-misses),
 * and stores them in the guzzlers table.
 */

import { db } from '../../db';
import { guzzlers, sports } from '../../db/schema';
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
  profitPercent: number;
  isArb: boolean;
  outcomes: GuzzlerOutcome[];
  allBookOdds: { book: string; outcomes: { name: string; odds: number }[] }[];
}

export interface ScanResult {
  totalEvents: number;
  arbsFound: number;
  nearMissesFound: number;
  leaguesScanned: number;
  errors: string[];
  requestsRemaining?: number;
}

// ─── Near-miss threshold: store opportunities where books' margin < 5% ─────

const NEAR_MISS_THRESHOLD = 1.05;

// ─── Arb Detection ──────────────────────────────────────────────────────────

function analyzeEvent(
  event: OddsApiEvent,
  mapping: OddsLeagueMapping,
): GuzzlerOpportunity | null {
  if (event.bookmakers.length < 2) return null;

  // Collect all outcome names from h2h market
  const outcomeNames = new Set<string>();
  for (const book of event.bookmakers) {
    const h2h = book.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;
    for (const outcome of h2h.outcomes) {
      outcomeNames.add(outcome.name);
    }
  }

  if (outcomeNames.size < 2) return null;

  // For each outcome, find the best (highest) odds across all books
  const bestOdds = new Map<string, { odds: number; book: string }>();

  for (const name of outcomeNames) {
    let best = { odds: 0, book: '' };
    for (const book of event.bookmakers) {
      const h2h = book.markets.find((m) => m.key === 'h2h');
      if (!h2h) continue;
      const outcome = h2h.outcomes.find((o) => o.name === name);
      if (outcome && outcome.price > best.odds) {
        best = { odds: outcome.price, book: book.title };
      }
    }
    if (best.odds > 0) {
      bestOdds.set(name, best);
    }
  }

  // Calculate total implied probability using best odds per outcome
  let totalImplied = 0;
  for (const [, { odds }] of bestOdds) {
    totalImplied += 1 / odds;
  }

  // Only store if within our near-miss threshold
  if (totalImplied >= NEAR_MISS_THRESHOLD) return null;

  const profitPercent = (1 / totalImplied - 1) * 100;
  const isArb = totalImplied < 1;

  // Calculate optimal stake percentages
  const outcomes: GuzzlerOutcome[] = [];
  for (const [name, { odds, book }] of bestOdds) {
    outcomes.push({
      name,
      odds,
      book,
      stakePct: parseFloat((((1 / odds) / totalImplied) * 100).toFixed(2)),
    });
  }

  // Collect all book odds for the comparison table
  const allBookOdds = event.bookmakers
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
    eventKey: event.id,
    sportId: mapping.sportId,
    leagueId: mapping.leagueId,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    commenceTime: new Date(event.commence_time),
    profitPercent: parseFloat(profitPercent.toFixed(2)),
    isArb,
    outcomes,
    allBookOdds,
  };
}

// ─── Scanner ────────────────────────────────────────────────────────────────

/**
 * Run the Guaranteed Guzzlers scan:
 * 1. Mark events that have already started as 'started'
 * 2. Fetch fresh odds from The Odds API
 * 3. Detect arbs and near-misses
 * 4. Upsert into guzzlers table
 */
export async function scanForGuzzlers(): Promise<ScanResult> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return {
      totalEvents: 0,
      arbsFound: 0,
      nearMissesFound: 0,
      leaguesScanned: 0,
      errors: ['ODDS_API_KEY not configured. Get a free key at https://the-odds-api.com'],
    };
  }

  const result: ScanResult = {
    totalEvents: 0,
    arbsFound: 0,
    nearMissesFound: 0,
    leaguesScanned: 0,
    errors: [],
  };

  try {
    // 1. Expire old guzzlers for events that have started
    await db
      .update(guzzlers)
      .set({ status: 'started' })
      .where(
        and(
          eq(guzzlers.status, 'active'),
          lt(guzzlers.commenceTime, new Date()),
        ),
      );

    // 2. Fetch odds from all leagues
    console.log('Scanning for Guaranteed Guzzlers...');
    const { results: oddsResults, errors, requestsRemaining } = await fetchAllOdds(apiKey);
    result.errors.push(...errors);
    result.requestsRemaining = requestsRemaining;

    // 3. Analyze each event for arbs
    const opportunities: GuzzlerOpportunity[] = [];

    for (const { mapping, events } of oddsResults) {
      result.leaguesScanned++;
      result.totalEvents += events.length;

      for (const event of events) {
        const opp = analyzeEvent(event, mapping);
        if (opp) {
          opportunities.push(opp);
        }
      }
    }

    // 4. Mark all existing active guzzlers as expired (we'll re-insert fresh ones)
    await db
      .update(guzzlers)
      .set({ status: 'expired' })
      .where(eq(guzzlers.status, 'active'));

    // 5. Insert new opportunities
    for (const opp of opportunities) {
      try {
        await db.insert(guzzlers).values({
          sportId: opp.sportId,
          leagueId: opp.leagueId,
          eventKey: opp.eventKey,
          homeTeam: opp.homeTeam,
          awayTeam: opp.awayTeam,
          commenceTime: opp.commenceTime,
          market: 'h2h',
          profitPercent: opp.profitPercent.toFixed(2),
          isArb: opp.isArb,
          outcomes: opp.outcomes,
          allBookOdds: opp.allBookOdds,
          status: 'active',
        });

        if (opp.isArb) {
          result.arbsFound++;
        } else {
          result.nearMissesFound++;
        }
      } catch (error) {
        console.error(
          `Failed to save guzzler ${opp.homeTeam} vs ${opp.awayTeam}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log(
      `Guzzler scan complete: ${result.arbsFound} arbs, ${result.nearMissesFound} near-misses from ${result.leaguesScanned} leagues (${result.totalEvents} events)`,
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Scanner error: ${msg}`);
    console.error('Guzzler scan failed:', msg);
  }

  return result;
}
