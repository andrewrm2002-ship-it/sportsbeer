/**
 * Diagnostic: test scraping a handful of URLs from different sources
 * to see what content lengths we get back.
 */

import { scrapeArticleText, scrapeArticleLinks } from '../src/pipeline/fetchers/scraper';

const TEST_URLS = [
  // ESPN RSS article pages
  'https://www.espn.com/nfl/story/_/id/44023456',
  'https://www.espn.com/nba/story/_/id/44023456',
  // BBC Sport
  'https://www.bbc.com/sport/football',
  // Guardian
  'https://www.theguardian.com/sport',
];

const LEAGUE_INDEX_TESTS = [
  { url: 'https://www.nfl.com/news/', pattern: /nfl\.com\/news\//, name: 'NFL.com' },
  { url: 'https://www.nba.com/news', pattern: /nba\.com\/news\//, name: 'NBA.com' },
  { url: 'https://www.mlb.com/news', pattern: /mlb\.com\/news\//, name: 'MLB.com' },
  { url: 'https://www.premierleague.com/news', pattern: /premierleague\.com\/news\//, name: 'Premier League' },
];

async function main() {
  console.log('=== LEAGUE INDEX LINK SCRAPING ===\n');

  for (const test of LEAGUE_INDEX_TESTS) {
    console.log(`Testing ${test.name} (${test.url})...`);
    try {
      const links = await scrapeArticleLinks(test.url, test.pattern, 3);
      console.log(`  Found ${links.length} links:`);
      for (const link of links) {
        console.log(`    ${link}`);
        // Try scraping each article
        try {
          const text = await scrapeArticleText(link);
          console.log(`    → ${text ? `${text.length} chars` : 'NO CONTENT'}`);
          if (text) {
            console.log(`    → Preview: "${text.slice(0, 150).replace(/\n/g, ' ')}..."`);
          }
        } catch (e) {
          console.log(`    → SCRAPE ERROR: ${e}`);
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${e}`);
    }
    console.log();
  }

  // Also test RSS-sourced URLs by checking what the RSS fetcher typically gives us
  console.log('\n=== RSS FEED CONTENT TEST ===\n');

  // Fetch ESPN RSS to get real article URLs
  const rssUrls = [
    'https://www.espn.com/espn/rss/news',
    'https://feeds.bbci.co.uk/sport/rss.xml',
  ];

  for (const rssUrl of rssUrls) {
    console.log(`Fetching RSS: ${rssUrl}`);
    try {
      const resp = await fetch(rssUrl, {
        headers: { 'User-Agent': 'SportsBeer/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      const xml = await resp.text();

      // Extract first 3 <link> tags from items
      const linkMatches = [...xml.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>/g)].slice(0, 3);
      console.log(`  Found ${linkMatches.length} article links in RSS`);

      for (const m of linkMatches) {
        const articleUrl = m[1]!.trim();
        console.log(`  Testing: ${articleUrl}`);
        try {
          const text = await scrapeArticleText(articleUrl);
          console.log(`    → ${text ? `${text.length} chars` : 'NO CONTENT'}`);
          if (text) {
            console.log(`    → Preview: "${text.slice(0, 150).replace(/\n/g, ' ')}..."`);
          }
        } catch (e) {
          console.log(`    → ERROR: ${e}`);
        }
      }
    } catch (e) {
      console.log(`  RSS FETCH ERROR: ${e}`);
    }
    console.log();
  }
}

main().catch(console.error);
