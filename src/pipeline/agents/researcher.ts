/**
 * Researcher agent — reuses existing fetchers to pull fresh stories.
 * No LLM calls needed; this is pure data fetching.
 */

import { db } from '../../../db';
import { sports } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import type { SportConfig } from '../fetchers/types';
import { fetchFromEspn } from '../fetchers/espn';
import { fetchFromTheSportsDb } from '../fetchers/thesportsdb';
import { fetchFromRss } from '../fetchers/rss';
import { fetchFromLeagueSites } from '../fetchers/league-sites';
import { deduplicateArticles, getArticleHash } from '../deduplicator';
import { scrapeArticleText } from '../fetchers/scraper';
import {
  isEligibleForAiGeneration,
  shouldAttemptArticleScrape,
} from '../source-policy';
import type { StoryData } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchForSport(config: SportConfig): Promise<StoryData[]> {
  const allArticles: StoryData[] = [];

  if (config.espnSlug) {
    try {
      const result = await fetchFromEspn(config);
      for (const article of result.articles) {
        allArticles.push({ raw: article, hash: getArticleHash(article) });
      }
    } catch (err) {
      console.warn(`ESPN fetch failed for ${config.name}:`, err);
    }
  }

  if (config.espnSlug && config.sportsDbId) await delay(300);

  if (config.sportsDbId) {
    try {
      const result = await fetchFromTheSportsDb(config);
      for (const article of result.articles) {
        allArticles.push({ raw: article, hash: getArticleHash(article) });
      }
    } catch (err) {
      console.warn(`TheSportsDB fetch failed for ${config.name}:`, err);
    }
  }

  try {
    const result = await fetchFromRss(config);
    for (const article of result.articles) {
      allArticles.push({ raw: article, hash: getArticleHash(article) });
    }
  } catch {
    // RSS is supplementary
  }

  await delay(300);

  try {
    const result = await fetchFromLeagueSites(config);
    for (const article of result.articles) {
      allArticles.push({ raw: article, hash: getArticleHash(article) });
    }
  } catch {
    // League sites are supplementary
  }

  return allArticles;
}

/**
 * Fetch fresh, deduplicated stories from configured sports sources.
 * Returns up to `count` stories, spread across multiple sports for variety.
 */
export async function researchStories(count: number): Promise<StoryData[]> {
  const activeSports = await db
    .select({
      id: sports.id,
      name: sports.name,
      slug: sports.slug,
      espnSlug: sports.espnSlug,
      sportsDbId: sports.sportsDbId,
      isActive: sports.isActive,
    })
    .from(sports)
    .where(eq(sports.isActive, true));

  if (activeSports.length === 0) {
    console.log('No active sports found.');
    return [];
  }

  // Shuffle sports for variety, fetch from at least 6 different sports
  const shuffled = activeSports.sort(() => Math.random() - 0.5);
  const sportsToFetch = shuffled.slice(0, Math.min(12, shuffled.length));

  const allStories: StoryData[] = [];
  let sportsFetched = 0;

  for (const sport of sportsToFetch) {
    const config: SportConfig = {
      id: sport.id,
      name: sport.name,
      slug: sport.slug,
      espnSlug: sport.espnSlug,
      sportsDbId: sport.sportsDbId,
      isActive: sport.isActive,
    };

    const stories = await fetchForSport(config);
    allStories.push(...stories);
    sportsFetched++;

    // Ensure we fetch from at least 6 sports before considering early exit
    if (sportsFetched >= 6 && allStories.length >= count * 5) break;
    await delay(500);
  }

  // Deduplicate against existing DB articles
  const rawArticles = allStories.map((s) => s.raw);
  const deduped = await deduplicateArticles(rawArticles);

  // Rebuild StoryData for deduped articles
  const dedupedStories = deduped.map((raw) => ({
    raw,
    hash: getArticleHash(raw),
  }));

  // Scrape full article content for stories that lack sufficient content
  const needsScraping = dedupedStories.filter((s) => shouldAttemptArticleScrape(s.raw));
  if (needsScraping.length > 0) {
    console.log(`  Scraping full article text for ${needsScraping.length} stories...`);
    const SCRAPE_BATCH = 5;
    for (let i = 0; i < needsScraping.length; i += SCRAPE_BATCH) {
      const batch = needsScraping.slice(i, i + SCRAPE_BATCH);
      await Promise.allSettled(
        batch.map(async (story) => {
          try {
            const text = await scrapeArticleText(story.raw.sourceUrl!);
            if (text) {
              story.raw.fullContent = text;
              console.log(`    ✓ Scraped ${text.length} chars from ${story.raw.sourceName}: "${story.raw.title.slice(0, 50)}..."`);
            }
          } catch {
            // Scraping is best-effort
          }
        }),
      );
      if (i + SCRAPE_BATCH < needsScraping.length) await delay(300);
    }
  }

  // Filter to sources we trust for AI generation and require sufficient full text.
  const withContent = dedupedStories.filter((s) => isEligibleForAiGeneration(s.raw));

  console.log(`  ${withContent.length}/${dedupedStories.length} stories have sufficient content`);

  // Take up to `count`, preferring variety in sports
  const selected: StoryData[] = [];
  const seenSports = new Set<string>();

  // First pass: one per sport
  for (const story of withContent) {
    if (selected.length >= count) break;
    if (!seenSports.has(story.raw.sport)) {
      selected.push(story);
      seenSports.add(story.raw.sport);
    }
  }

  // Second pass: fill remaining
  for (const story of withContent) {
    if (selected.length >= count) break;
    if (!selected.includes(story)) {
      selected.push(story);
    }
  }

  return selected;
}
