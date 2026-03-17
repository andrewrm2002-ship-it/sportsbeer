import type { RawArticleData, SportConfig } from './types';

const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SportsBeer/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.warn(`TheSportsDB returned ${response.status} for ${url}`);
      return null;
    }
    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    console.warn(
      `TheSportsDB fetch failed for ${url}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

interface TsdbEvent {
  idEvent?: string;
  strEvent?: string;
  strSport?: string;
  strLeague?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strThumb?: string;
  strVideo?: string;
  dateEvent?: string;
  strTimestamp?: string;
  strStatus?: string;
  strDescriptionEN?: string;
  strResult?: string;
  strVenue?: string;
}

function parseEvents(
  events: TsdbEvent[],
  sport: SportConfig,
): RawArticleData[] {
  const articles: RawArticleData[] = [];

  for (const event of events) {
    if (!event.strEvent || !event.strHomeTeam || !event.strAwayTeam) continue;

    const homeScore =
      event.intHomeScore !== null && event.intHomeScore !== undefined
        ? parseInt(event.intHomeScore, 10)
        : null;
    const awayScore =
      event.intAwayScore !== null && event.intAwayScore !== undefined
        ? parseInt(event.intAwayScore, 10)
        : null;

    const hasScores =
      homeScore !== null && !isNaN(homeScore) && awayScore !== null && !isNaN(awayScore);

    const title = hasScores
      ? `${event.strHomeTeam} ${homeScore} - ${awayScore} ${event.strAwayTeam}`
      : event.strEvent;

    const description = hasScores
      ? `${event.strHomeTeam} ${homeScore} vs ${event.strAwayTeam} ${awayScore}${
          event.strVenue ? ` at ${event.strVenue}` : ''
        }. ${event.strResult ?? ''}`
      : event.strDescriptionEN ?? `${event.strHomeTeam} vs ${event.strAwayTeam}`;

    const eventDate = event.strTimestamp
      ? new Date(event.strTimestamp)
      : event.dateEvent
        ? new Date(event.dateEvent)
        : new Date();

    articles.push({
      externalId: `tsdb-event-${event.idEvent ?? event.strEvent}`,
      sport: sport.id,
      league: event.strLeague ?? undefined,
      title,
      description: description.slice(0, 500),
      category: hasScores ? 'scores' : 'highlights',
      sourceName: 'TheSportsDB',
      imageUrl: undefined,
      teams: [event.strHomeTeam, event.strAwayTeam],
      scores:
        hasScores
          ? {
              home: event.strHomeTeam,
              away: event.strAwayTeam,
              homeScore: homeScore!,
              awayScore: awayScore!,
            }
          : undefined,
      publishedAt: eventDate,
      rawData: event as unknown as Record<string, unknown>,
    });
  }

  return articles;
}

interface TsdbLeague {
  idLeague?: string;
  strLeague?: string;
  strSport?: string;
}

/**
 * Look up numeric league IDs for a sport name via TheSportsDB.
 */
async function getLeagueIdsForSport(sportName: string): Promise<string[]> {
  const url = `${TSDB_BASE}/all_leagues.php?s=${encodeURIComponent(sportName)}`;
  const data = await fetchJson(url);
  if (!data) return [];
  const leagues = (data.leagues ?? []) as TsdbLeague[];
  if (!Array.isArray(leagues)) return [];
  return leagues
    .map((l) => l.idLeague)
    .filter((id): id is string => !!id)
    .slice(0, 3); // limit to top 3 leagues to avoid excessive API calls
}

/**
 * Fetch event data from TheSportsDB free API.
 * Uses the free tier key "3".
 *
 * sportsDbId stores a sport name (e.g. "Soccer"), not a numeric league ID.
 * We first look up league IDs via all_leagues.php, then query events per league.
 */
export async function fetchFromTheSportsDb(sport: SportConfig): Promise<{
  articles: RawArticleData[];
  errors: string[];
}> {
  if (!sport.sportsDbId) {
    return { articles: [], errors: [] };
  }

  const articles: RawArticleData[] = [];
  const errors: string[] = [];

  // Resolve sport name to numeric league IDs
  let leagueIds: string[] = [];
  try {
    leagueIds = await getLeagueIdsForSport(sport.sportsDbId);
  } catch (error) {
    const msg = `TheSportsDB league lookup failed for ${sport.name}: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(msg);
    errors.push(msg);
  }

  if (leagueIds.length === 0) {
    return { articles, errors };
  }

  const existingIds = new Set<string>();

  for (const leagueId of leagueIds) {
    // Try current season events
    try {
      const seasonUrl = `${TSDB_BASE}/eventsseason.php?id=${leagueId}&s=2025-2026`;
      const seasonData = await fetchJson(seasonUrl);

      if (seasonData) {
        const events = (seasonData.events ?? []) as TsdbEvent[];
        if (Array.isArray(events)) {
          const parsed = parseEvents(events, sport).filter(
            (a) => !existingIds.has(a.externalId),
          );
          for (const a of parsed) existingIds.add(a.externalId);
          articles.push(...parsed);
        }
      }
    } catch (error) {
      const msg = `TheSportsDB season fetch failed for ${sport.name} (league ${leagueId}): ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(msg);
      errors.push(msg);
    }

    await delay(300);

    // Also fetch past league events as fallback
    try {
      const pastUrl = `${TSDB_BASE}/eventspastleague.php?id=${leagueId}`;
      const pastData = await fetchJson(pastUrl);

      if (pastData) {
        const events = (pastData.events ?? []) as TsdbEvent[];
        if (Array.isArray(events)) {
          const parsed = parseEvents(events, sport).filter(
            (a) => !existingIds.has(a.externalId),
          );
          for (const a of parsed) existingIds.add(a.externalId);
          articles.push(...parsed);
        }
      }
    } catch (error) {
      const msg = `TheSportsDB past events fetch failed for ${sport.name} (league ${leagueId}): ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(msg);
      errors.push(msg);
    }

    await delay(300);
  }

  return { articles, errors };
}
