import { scrapeArticleText } from '../src/pipeline/fetchers/scraper';
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 10000 });

async function main() {
  // Try ESPN MLB RSS
  try {
    const feed = await parser.parseURL('https://www.espn.com/espn/rss/mlb/news');
    for (const item of (feed.items ?? []).slice(0, 3)) {
      if (!item?.link) continue;
      console.log('=== SOURCE ===');
      console.log('TITLE:', item.title);
      console.log('LINK:', item.link);
      
      const fullText = await scrapeArticleText(item.link);
      if (fullText && fullText.length >= 1500) {
        console.log('CHARS:', fullText.length);
        console.log('=== FULL TEXT ===');
        console.log(fullText.slice(0, 4000));
        return; // Got one good article
      }
    }
  } catch(e) {
    console.error('ESPN failed:', e);
  }

  // Fallback: BBC Sport
  try {
    const feed = await parser.parseURL('https://feeds.bbci.co.uk/sport/rss.xml');
    for (const item of (feed.items ?? []).slice(0, 5)) {
      if (!item?.link) continue;
      console.log('=== BBC SOURCE ===');
      console.log('TITLE:', item.title);
      console.log('LINK:', item.link);
      
      const fullText = await scrapeArticleText(item.link);
      if (fullText && fullText.length >= 1500) {
        console.log('CHARS:', fullText.length);
        console.log('=== FULL TEXT ===');
        console.log(fullText.slice(0, 4000));
        return;
      }
    }
  } catch(e) {
    console.error('BBC failed:', e);
  }

  // Fallback: Guardian
  try {
    const feed = await parser.parseURL('https://www.theguardian.com/sport/rss');
    for (const item of (feed.items ?? []).slice(0, 5)) {
      if (!item?.link) continue;
      console.log('=== GUARDIAN SOURCE ===');
      console.log('TITLE:', item.title);
      console.log('LINK:', item.link);
      
      const fullText = await scrapeArticleText(item.link);
      if (fullText && fullText.length >= 1500) {
        console.log('CHARS:', fullText.length);
        console.log('=== FULL TEXT ===');
        console.log(fullText.slice(0, 4000));
        return;
      }
    }
  } catch(e) {
    console.error('Guardian failed:', e);
  }
  
  console.log('No articles with 1500+ chars found');
}

main();
