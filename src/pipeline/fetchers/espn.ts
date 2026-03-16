import type { RawArticleData, SportConfig } from './types';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string, maxRetries = 2): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SportsBeer/1.0',
        },
        signal: AbortSignal.timeout(10000),
      });

      // Retry on 429 or 5xx
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s
        console.warn(`ESPN API returned ${response.status} for ${url}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await delay(backoffMs);
        continue;
      }

      if (!response.ok) {
        console.warn(`ESPN API returned ${response.status} for ${url}`);
        return null;
      }
      return (await response.json()) as Record<string, unknown>;
    } catch (error) {
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(`ESPN fetch failed for ${url} (attempt ${attempt + 1}/${maxRetries}), retrying in ${backoffMs}ms:`, error instanceof Error ? error.message : error);
        await delay(backoffMs);
        continue;
      }
      console.warn(`ESPN fetch failed for ${url} after ${maxRetries + 1} attempts:`, error instanceof Error ? error.message : error);
      return null;
    }
  }
  return null;
}

interface EspnCompetitor {
  team?: { displayName?: string; abbreviation?: string; logo?: string };
  score?: string;
  homeAway?: string;
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
  venue?: { fullName?: string };
  status?: { type?: { description?: string; completed?: boolean } };
}

interface EspnEvent {
  id?: string;
  name?: string;
  shortName?: string;
  date?: string;
  competitions?: EspnCompetition[];
}

interface EspnArticleImage {
  url?: string;
  caption?: string;
}

interface EspnArticleLink {
  web?: { href?: string };
}

interface EspnArticle {
  headline?: string;
  description?: string;
  published?: string;
  images?: EspnArticleImage[];
  links?: EspnArticleLink;
  categories?: Array<{ description?: string }>;
  athletes?: Array<{ displayName?: string }>;
}

function parseScoreboardEvents(
  events: EspnEvent[],
  sport: SportConfig,
): RawArticleData[] {
  const articles: RawArticleData[] = [];

  for (const event of events) {
    const competition = event.competitions?.[0];
    if (!competition?.competitors || competition.competitors.length < 2) continue;

    const isComplete = competition.status?.type?.completed ?? false;

    // Skip in-progress or scheduled games — only create articles for completed events
    if (!isComplete) continue;

    const home = competition.competitors.find((c) => c.homeAway === 'home');
    const away = competition.competitors.find((c) => c.homeAway === 'away');

    if (!home?.team?.displayName || !away?.team?.displayName) continue;

    const homeScore = parseInt(home.score ?? '0', 10);
    const awayScore = parseInt(away.score ?? '0', 10);
    const homeName = home.team.displayName;
    const awayName = away.team.displayName;

    const title = `${homeName} ${homeScore} - ${awayScore} ${awayName}`;

    const description = `Final score: ${homeName} ${homeScore}, ${awayName} ${awayScore}. ${
      homeScore > awayScore
        ? `${homeName} win at home.`
        : homeScore < awayScore
          ? `${awayName} take the road victory.`
          : 'The game ends in a draw.'
    }`;

    const venue = competition.venue?.fullName;

    articles.push({
      externalId: `espn-score-${event.id ?? `${homeName}-${awayName}-${event.date}`}`,
      sport: sport.id,
      league: sport.espnSlug?.split('/')[1],
      title,
      description,
      category: 'scores',
      sourceName: 'ESPN',
      imageUrl: home.team.logo ?? away.team.logo,
      teams: [homeName, awayName],
      scores: { home: homeName, away: awayName, homeScore, awayScore },
      venue,
      publishedAt: event.date ? new Date(event.date) : new Date(),
      rawData: event as unknown as Record<string, unknown>,
    });
  }

  return articles;
}

function parseNewsArticles(
  newsArticles: EspnArticle[],
  sport: SportConfig,
): RawArticleData[] {
  const articles: RawArticleData[] = [];

  for (const article of newsArticles) {
    if (!article.headline) continue;

    // Extract player names if available
    const players = article.athletes
      ?.map((a) => a.displayName)
      .filter((name): name is string => !!name);

    articles.push({
      externalId: `espn-news-${article.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)}`,
      sport: sport.id,
      league: sport.espnSlug?.split('/')[1],
      title: article.headline,
      description: article.description ?? article.headline,
      category: 'news',
      sourceUrl: article.links?.web?.href,
      sourceName: 'ESPN',
      imageUrl: article.images?.[0]?.url,
      players: players && players.length > 0 ? players : undefined,
      publishedAt: article.published ? new Date(article.published) : new Date(),
      rawData: article as unknown as Record<string, unknown>,
    });
  }

  return articles;
}

/**
 * Fetch scores and news from ESPN's free public API for a given sport.
 * The espnSlug should be in "sport/league" format (e.g., "basketball/nba").
 */
export async function fetchFromEspn(sport: SportConfig): Promise<{
  articles: RawArticleData[];
  errors: string[];
}> {
  if (!sport.espnSlug) {
    return { articles: [], errors: [] };
  }

  const articles: RawArticleData[] = [];
  const errors: string[] = [];

  // Fetch scoreboard
  try {
    const scoreboardUrl = `${ESPN_BASE}/${sport.espnSlug}/scoreboard`;
    const scoreData = await fetchJson(scoreboardUrl);

    if (scoreData) {
      const events = (scoreData.events ?? []) as EspnEvent[];
      const scoreArticles = parseScoreboardEvents(events, sport);
      articles.push(...scoreArticles);
    }
  } catch (error) {
    const msg = `ESPN scoreboard fetch failed for ${sport.name}: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    errors.push(msg);
  }

  // Delay between requests to be polite
  await delay(300);

  // Fetch news
  try {
    const newsUrl = `${ESPN_BASE}/${sport.espnSlug}/news`;
    const newsData = await fetchJson(newsUrl);

    if (newsData) {
      // Check articles first, fall back to headlines
      const newsItems = (
        (newsData.articles as EspnArticle[] | undefined) ??
        (newsData.headlines as EspnArticle[] | undefined) ??
        []
      );
      const newsArticles = parseNewsArticles(newsItems, sport);
      articles.push(...newsArticles);
    }
  } catch (error) {
    const msg = `ESPN news fetch failed for ${sport.name}: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    errors.push(msg);
  }

  return { articles, errors };
}
