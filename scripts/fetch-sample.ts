import { scrapeArticleText } from '../src/pipeline/fetchers/scraper';
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 10000 });

async function main() {
  const feeds = [
    'https://www.espn.com/espn/rss/nfl/news',
    'https://www.espn.com/espn/rss/nba/news',
    'https://www.espn.com/espn/rss/mlb/news',
    'https://feeds.bbci.co.uk/sport/football/rss.xml',
    'https://www.theguardian.com/sport/rss',
  ];

  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of (feed.items ?? []).slice(0, 5)) {
        if (!item?.link) continue;
        const fullText = await scrapeArticleText(item.link);
        if (fullText && fullText.length >= 1500) {
          console.log('SOURCE:', item.title);
          console.log('SPORT:', feedUrl.includes('nfl') ? 'NFL' : feedUrl.includes('nba') ? 'NBA' : feedUrl.includes('mlb') ? 'MLB' : feedUrl.includes('football') ? 'Soccer' : 'General');
          console.log('LINK:', item.link);
          console.log('CHARS:', fullText.length);
          console.log('---TEXT---');
          console.log(fullText.slice(0, 5000));
          console.log('---END---');
          return;
        }
      }
    } catch { /* try next feed */ }
  }
  console.log('No articles with 1500+ chars found');
}

main();
