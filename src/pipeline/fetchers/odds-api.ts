/**
 * The Odds API fetcher — aggregates odds from 40+ sportsbooks.
 * Free tier: 500 requests/month. Each league = 1 request.
 * https://the-odds-api.com/liveapi/guides/v4/
 */

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OddsApiOutcome {
  name: string;
  price: number;
}

export interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

// ─── League Mapping ─────────────────────────────────────────────────────────

export interface OddsLeagueMapping {
  oddsApiKey: string;
  sportId: string;
  leagueId: string | null;
  label: string;
}

export const ODDS_LEAGUE_MAPPINGS: OddsLeagueMapping[] = [
  // Soccer
  { oddsApiKey: 'soccer_epl', sportId: 'soccer', leagueId: 'eng-premier-league', label: 'EPL' },
  { oddsApiKey: 'soccer_spain_la_liga', sportId: 'soccer', leagueId: 'esp-la-liga', label: 'La Liga' },
  { oddsApiKey: 'soccer_germany_bundesliga', sportId: 'soccer', leagueId: 'ger-bundesliga', label: 'Bundesliga' },
  { oddsApiKey: 'soccer_italy_serie_a', sportId: 'soccer', leagueId: 'ita-serie-a', label: 'Serie A' },
  { oddsApiKey: 'soccer_france_ligue_one', sportId: 'soccer', leagueId: 'fra-ligue-1', label: 'Ligue 1' },
  { oddsApiKey: 'soccer_usa_mls', sportId: 'soccer', leagueId: 'usa-mls', label: 'MLS' },
  { oddsApiKey: 'soccer_uefa_champs_league', sportId: 'soccer', leagueId: 'uefa-champions-league', label: 'UCL' },

  // Basketball
  { oddsApiKey: 'basketball_nba', sportId: 'basketball', leagueId: 'nba', label: 'NBA' },
  { oddsApiKey: 'basketball_wnba', sportId: 'basketball', leagueId: 'wnba', label: 'WNBA' },
  { oddsApiKey: 'basketball_euroleague', sportId: 'basketball', leagueId: 'euroleague', label: 'EuroLeague' },
  { oddsApiKey: 'basketball_ncaab', sportId: 'basketball', leagueId: 'ncaa-basketball', label: 'NCAAB' },

  // American Football
  { oddsApiKey: 'americanfootball_nfl', sportId: 'american-football', leagueId: 'nfl', label: 'NFL' },
  { oddsApiKey: 'americanfootball_ncaaf', sportId: 'american-football', leagueId: 'ncaa-football', label: 'NCAAF' },

  // Baseball
  { oddsApiKey: 'baseball_mlb', sportId: 'baseball', leagueId: 'mlb', label: 'MLB' },

  // Ice Hockey
  { oddsApiKey: 'icehockey_nhl', sportId: 'ice-hockey', leagueId: 'nhl', label: 'NHL' },

  // Combat
  { oddsApiKey: 'mma_mixed_martial_arts', sportId: 'mma', leagueId: 'ufc', label: 'MMA' },
  { oddsApiKey: 'boxing_boxing', sportId: 'boxing', leagueId: null, label: 'Boxing' },

  // Other
  { oddsApiKey: 'aussierules_afl', sportId: 'australian-football', leagueId: 'afl', label: 'AFL' },
  { oddsApiKey: 'rugbyleague_nrl', sportId: 'rugby-league', leagueId: 'nrl', label: 'NRL' },
  { oddsApiKey: 'cricket_ipl', sportId: 'cricket', leagueId: 'ipl', label: 'IPL' },
];

// ─── Fetcher ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchOddsForLeague(
  oddsApiKey: string,
  apiKey: string,
): Promise<{ events: OddsApiEvent[]; error?: string; requestsRemaining?: number }> {
  const url = `${ODDS_API_BASE}/${oddsApiKey}/odds/?apiKey=${apiKey}&regions=us,eu,uk,au&markets=h2h&oddsFormat=decimal`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    const requestsRemaining = response.headers.get('x-requests-remaining')
      ? parseInt(response.headers.get('x-requests-remaining')!, 10)
      : undefined;

    if (response.status === 404) {
      // Sport not currently available (e.g., off-season)
      return { events: [], requestsRemaining };
    }

    if (response.status === 401) {
      return { events: [], error: 'Invalid ODDS_API_KEY', requestsRemaining: 0 };
    }

    if (response.status === 429) {
      return { events: [], error: 'Odds API rate limit exceeded', requestsRemaining: 0 };
    }

    if (!response.ok) {
      return { events: [], error: `Odds API returned ${response.status}`, requestsRemaining };
    }

    const events = (await response.json()) as OddsApiEvent[];
    return { events, requestsRemaining };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { events: [], error: `Odds API fetch failed: ${msg}` };
  }
}

/**
 * Fetch odds for all mapped leagues. Returns events grouped by mapping.
 * Adds 300ms delays between requests to be polite.
 */
export async function fetchAllOdds(apiKey: string): Promise<{
  results: { mapping: OddsLeagueMapping; events: OddsApiEvent[] }[];
  errors: string[];
  requestsRemaining?: number;
}> {
  const results: { mapping: OddsLeagueMapping; events: OddsApiEvent[] }[] = [];
  const errors: string[] = [];
  let requestsRemaining: number | undefined;

  for (const mapping of ODDS_LEAGUE_MAPPINGS) {
    const result = await fetchOddsForLeague(mapping.oddsApiKey, apiKey);

    if (result.requestsRemaining !== undefined) {
      requestsRemaining = result.requestsRemaining;
    }

    if (result.error) {
      errors.push(`${mapping.label}: ${result.error}`);
      // Stop if auth failed or rate limited
      if (result.requestsRemaining === 0) break;
    }

    if (result.events.length > 0) {
      results.push({ mapping, events: result.events });
    }

    // Rate limit ourselves
    await delay(300);
  }

  return { results, errors, requestsRemaining };
}
