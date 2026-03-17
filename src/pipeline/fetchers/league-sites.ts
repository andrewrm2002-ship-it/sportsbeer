/**
 * League sites fetcher — scrapes official league and sports news pages
 * for article links, then scrapes each article for full text.
 */

import type { RawArticleData, SportConfig } from './types';
import { scrapeArticleLinks, scrapeArticleText } from './scraper';

interface LeagueSite {
  url: string;
  sourceName: string;
  linkPattern: RegExp;
}

// Map sport IDs to official news pages to scrape
const LEAGUE_SITES: Record<string, LeagueSite[]> = {
  'american-football': [
    { url: 'https://www.nfl.com/news/', sourceName: 'NFL.com', linkPattern: /nfl\.com\/news\// },
    { url: 'https://www.pro-football-reference.com/blog/', sourceName: 'Pro Football Ref', linkPattern: /pro-football-reference\.com\/blog\// },
  ],
  basketball: [
    { url: 'https://www.nba.com/news', sourceName: 'NBA.com', linkPattern: /nba\.com\/news\// },
  ],
  baseball: [
    { url: 'https://www.mlb.com/news', sourceName: 'MLB.com', linkPattern: /mlb\.com\/news\// },
  ],
  'ice-hockey': [
    { url: 'https://www.nhl.com/news', sourceName: 'NHL.com', linkPattern: /nhl\.com\/news\// },
  ],
  soccer: [
    { url: 'https://www.mlssoccer.com/news/', sourceName: 'MLS', linkPattern: /mlssoccer\.com\/news\// },
  ],
  golf: [
    { url: 'https://www.pgatour.com/news', sourceName: 'PGA Tour', linkPattern: /pgatour\.com\/news\// },
  ],
  mma: [
    { url: 'https://www.ufc.com/news', sourceName: 'UFC.com', linkPattern: /ufc\.com\/news\// },
  ],
  tennis: [
    { url: 'https://www.wtatennis.com/news', sourceName: 'WTA', linkPattern: /wtatennis\.com\/news\// },
  ],
  cricket: [
    { url: 'https://www.icc-cricket.com/news', sourceName: 'ICC', linkPattern: /icc-cricket\.com\/news\// },
  ],
  'rugby-union': [
    { url: 'https://www.world.rugby/news', sourceName: 'World Rugby', linkPattern: /world\.rugby\/news\// },
  ],
  boxing: [
    { url: 'https://www.boxingscene.com/news', sourceName: 'BoxingScene', linkPattern: /boxingscene\.com\// },
  ],
};

const MAX_ARTICLES_PER_SITE = 5;
const SCRAPE_CONCURRENCY = 3;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch articles from official league news pages for a given sport.
 * Scrapes article links from the index page, then scrapes each article's full text.
 */
export async function fetchFromLeagueSites(sport: SportConfig): Promise<{
  articles: RawArticleData[];
  errors: string[];
}> {
  const sites = LEAGUE_SITES[sport.id] ?? LEAGUE_SITES[sport.slug] ?? [];
  const articles: RawArticleData[] = [];
  const errors: string[] = [];

  for (const site of sites) {
    try {
      console.log(`    Scraping ${site.sourceName} for ${sport.name} articles...`);

      // Step 1: Get article links from the index page
      const links = await scrapeArticleLinks(site.url, site.linkPattern, MAX_ARTICLES_PER_SITE);

      if (links.length === 0) {
        console.log(`      No article links found on ${site.sourceName}`);
        continue;
      }

      console.log(`      Found ${links.length} article links on ${site.sourceName}`);

      // Step 2: Scrape each article in batches
      for (let i = 0; i < links.length; i += SCRAPE_CONCURRENCY) {
        const batch = links.slice(i, i + SCRAPE_CONCURRENCY);
        const results = await Promise.allSettled(
          batch.map(async (link) => {
            const fullContent = await scrapeArticleText(link);
            return { link, fullContent };
          }),
        );

        for (const result of results) {
          if (result.status !== 'fulfilled' || !result.value.fullContent) continue;

          const { link, fullContent } = result.value;

          // Extract title from the URL slug as fallback
          const urlPath = new URL(link).pathname;
          const slugTitle = urlPath
            .split('/')
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Untitled';

          // Try to extract a better title from the first line of content
          const firstLine = fullContent.split('\n')[0]?.trim() ?? slugTitle;
          const title = firstLine.length > 20 && firstLine.length < 200 ? firstLine : slugTitle;

          articles.push({
            externalId: `league-${site.sourceName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${urlPath.replace(/[^a-z0-9]/gi, '-').slice(0, 80)}`,
            sport: sport.id,
            title,
            description: fullContent.slice(0, 300),
            category: 'news',
            sourceUrl: link,
            sourceName: site.sourceName,
            fullContent,
            imageUrl: undefined,
            publishedAt: new Date(),
            rawData: { scrapedFrom: link },
          });
        }

        if (i + SCRAPE_CONCURRENCY < links.length) {
          await delay(300);
        }
      }

      console.log(`      Scraped ${articles.length} articles with full content from ${site.sourceName}`);
    } catch (error) {
      const msg = `League site fetch failed for ${site.sourceName}: ${error instanceof Error ? error.message : String(error)}`;
      console.warn(`      ${msg}`);
      errors.push(msg);
    }

    await delay(300);
  }

  return { articles, errors };
}
