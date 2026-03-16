import Parser from 'rss-parser';
import type { RawArticleData, SportConfig } from './types';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'SportsBeer/1.0' },
});

// Map sport IDs to relevant RSS feed URLs
// These are real, publicly available RSS feeds
const SPORT_RSS_FEEDS: Record<string, string[]> = {
  soccer: [
    'https://www.espn.com/espn/rss/soccer/news',
    'https://feeds.bbci.co.uk/sport/football/rss.xml',
  ],
  basketball: [
    'https://www.espn.com/espn/rss/nba/news',
  ],
  'american-football': [
    'https://www.espn.com/espn/rss/nfl/news',
  ],
  baseball: [
    'https://www.espn.com/espn/rss/mlb/news',
  ],
  'ice-hockey': [
    'https://www.espn.com/espn/rss/nhl/news',
  ],
  tennis: [
    'https://www.espn.com/espn/rss/tennis/news',
  ],
  golf: [
    'https://www.espn.com/espn/rss/golf/news',
  ],
  cricket: [
    'https://feeds.bbci.co.uk/sport/cricket/rss.xml',
  ],
  'rugby-union': [
    'https://feeds.bbci.co.uk/sport/rugby-union/rss.xml',
  ],
  'rugby-league': [
    'https://feeds.bbci.co.uk/sport/rugby-league/rss.xml',
  ],
  mma: [
    'https://www.espn.com/espn/rss/mma/news',
  ],
  f1: [
    'https://feeds.bbci.co.uk/sport/formula1/rss.xml',
    'https://www.espn.com/espn/rss/rpm/news',
  ],
  boxing: [
    'https://www.espn.com/espn/rss/boxing/news',
  ],
  cycling: [
    'https://feeds.bbci.co.uk/sport/cycling/rss.xml',
  ],
  swimming: [
    'https://feeds.bbci.co.uk/sport/swimming/rss.xml',
  ],
  gymnastics: [
    'https://feeds.bbci.co.uk/sport/gymnastics/rss.xml',
  ],
  athletics: [
    'https://feeds.bbci.co.uk/sport/athletics/rss.xml',
  ],
};

// Generic sports feeds as fallback for sports without dedicated feeds
const GENERIC_SPORTS_FEEDS = [
  'https://www.espn.com/espn/rss/news',
  'https://feeds.bbci.co.uk/sport/rss.xml',
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchFromRss(sport: SportConfig): Promise<{
  articles: RawArticleData[];
  errors: string[];
}> {
  const articles: RawArticleData[] = [];
  const errors: string[] = [];

  // Get feeds for this sport, or use generic feeds filtered by sport name
  const feedUrls = SPORT_RSS_FEEDS[sport.id] ?? SPORT_RSS_FEEDS[sport.slug] ?? [];

  for (const feedUrl of feedUrls) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of (feed.items ?? []).slice(0, 10)) { // Max 10 per feed
        if (!item.title) continue;

        articles.push({
          externalId: `rss-${feedUrl.replace(/[^a-z0-9]/gi, '')}-${(item.guid ?? item.link ?? item.title).replace(/[^a-z0-9]/gi, '-').slice(0, 80)}`,
          sport: sport.id,
          title: item.title,
          description: item.contentSnippet ?? item.content ?? item.title,
          category: 'news',
          sourceUrl: item.link ?? undefined,
          sourceName: extractSourceName(feedUrl),
          imageUrl: extractImageUrl(item),
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          rawData: item as unknown as Record<string, unknown>,
        });
      }
    } catch (error) {
      const msg = `RSS fetch failed for ${sport.name} (${feedUrl}): ${error instanceof Error ? error.message : String(error)}`;
      console.warn(msg);
      errors.push(msg);
    }

    await delay(300);
  }

  // If no sport-specific feeds, try generic feeds filtered by sport name keywords
  if (feedUrls.length === 0) {
    const sportKeywords = [sport.name.toLowerCase(), sport.id.toLowerCase(), sport.slug.toLowerCase()];

    for (const feedUrl of GENERIC_SPORTS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);

        for (const item of (feed.items ?? []).slice(0, 20)) {
          if (!item.title) continue;

          const text = `${item.title} ${item.contentSnippet ?? ''}`.toLowerCase();
          const isRelevant = sportKeywords.some(kw => text.includes(kw));

          if (isRelevant) {
            articles.push({
              externalId: `rss-generic-${(item.guid ?? item.link ?? item.title).replace(/[^a-z0-9]/gi, '-').slice(0, 80)}`,
              sport: sport.id,
              title: item.title,
              description: item.contentSnippet ?? item.content ?? item.title,
              category: 'news',
              sourceUrl: item.link ?? undefined,
              sourceName: extractSourceName(feedUrl),
              imageUrl: extractImageUrl(item),
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              rawData: item as unknown as Record<string, unknown>,
            });
          }
        }
      } catch {
        // Silent fail on generic feeds
      }

      await delay(300);
    }
  }

  return { articles, errors };
}

function extractSourceName(url: string): string {
  if (url.includes('espn.com')) return 'ESPN';
  if (url.includes('bbc')) return 'BBC Sport';
  if (url.includes('yahoo')) return 'Yahoo Sports';
  return 'RSS Feed';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  // Try common RSS image fields
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
  if (item['media:thumbnail']?.['$']?.url) return item['media:thumbnail']['$'].url;
  // Try to extract from content HTML
  const content = item.content ?? '';
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
  if (imgMatch) return imgMatch[1];
  return undefined;
}
