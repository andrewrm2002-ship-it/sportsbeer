/**
 * Content generation pipeline orchestrator.
 * Fetches sports data, deduplicates, rewrites with humor, and stores in DB.
 */

import { db } from '../../db';
import { sports, articles, generationLogs } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { SportConfig, RawArticleData } from './fetchers/types';
import { fetchFromEspn } from './fetchers/espn';
import { fetchFromTheSportsDb } from './fetchers/thesportsdb';
import { fetchFromRss } from './fetchers/rss';
import { fetchFromLeagueSites } from './fetchers/league-sites';
import { deduplicateArticles, getArticleHash } from './deduplicator';
import { scrapeArticleText } from './fetchers/scraper';
import { rewriteArticle } from './rewriter';
import {
  isEligibleForAiGeneration,
  shouldAttemptArticleScrape,
} from './source-policy';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GenerationProgress {
  sport: string;
  status: 'fetching' | 'deduplicating' | 'rewriting' | 'saving' | 'complete' | 'error';
  articleCount: number;
  error?: string;
}

export interface GenerationResult {
  totalArticles: number;
  sportsProcessed: number;
  errors: string[];
  progress: GenerationProgress[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process items in batches with concurrency control.
 */
async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(processor));

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    }

    // Small delay between batches to avoid hammering APIs
    if (i + batchSize < items.length) {
      await delay(500);
    }
  }

  return results;
}

// ─── Fetch for a Single Sport ───────────────────────────────────────────────

async function fetchForSport(sportConfig: SportConfig): Promise<{
  articles: RawArticleData[];
  errors: string[];
}> {
  const allArticles: RawArticleData[] = [];
  const allErrors: string[] = [];

  // Fetch from ESPN if the sport has an ESPN slug
  if (sportConfig.espnSlug) {
    const espnResult = await fetchFromEspn(sportConfig);
    allArticles.push(...espnResult.articles);
    allErrors.push(...espnResult.errors);
  }

  // Small delay between API sources
  if (sportConfig.espnSlug && sportConfig.sportsDbId) {
    await delay(300);
  }

  // Fetch from TheSportsDB if the sport has a sportsDbId
  if (sportConfig.sportsDbId) {
    const tsdbResult = await fetchFromTheSportsDb(sportConfig);
    allArticles.push(...tsdbResult.articles);
    allErrors.push(...tsdbResult.errors);
  }

  // Always try RSS feeds for real news content
  try {
    const rssResult = await fetchFromRss(sportConfig);
    allArticles.push(...rssResult.articles);
    allErrors.push(...rssResult.errors);
  } catch {
    // RSS is supplementary, don't block on errors
  }

  await delay(300);

  // Try official league news pages
  try {
    const leagueResult = await fetchFromLeagueSites(sportConfig);
    allArticles.push(...leagueResult.articles);
    allErrors.push(...leagueResult.errors);
  } catch {
    // League sites are supplementary
  }

  return { articles: allArticles, errors: allErrors };
}

// ─── Save Articles to DB ────────────────────────────────────────────────────

async function saveArticlesToDb(
  rawArticles: RawArticleData[],
  rewrittenArticles: { title: string; subtitle: string; body: string; summary: string }[],
): Promise<number> {
  let savedCount = 0;

  for (let i = 0; i < rawArticles.length; i++) {
    const raw = rawArticles[i]!;
    const rewritten = rewrittenArticles[i]!;

    try {
      await db.insert(articles).values({
        sportId: raw.sport,
        title: rewritten.title,
        subtitle: rewritten.subtitle,
        body: rewritten.body,
        summary: rewritten.summary,
        originalSourceUrl: raw.sourceUrl ?? null,
        originalSourceName: raw.sourceName,
        sourceDataHash: getArticleHash(raw),
        imageUrl: null,
        category: raw.category,
        tags: raw.teams ?? [],
        publishedAt: raw.publishedAt,
      });
      savedCount++;
    } catch (error) {
      console.error(
        `Failed to save article "${rewritten.title}":`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return savedCount;
}

// ─── Generate Content for a Single Sport ────────────────────────────────────

/**
 * Generate content for a single sport.
 * Fetches, deduplicates, rewrites, and saves articles.
 */
export async function generateContentForSport(
  sportConfig: SportConfig,
  onProgress?: (progress: GenerationProgress) => void,
): Promise<GenerationProgress> {
  const progress: GenerationProgress = {
    sport: sportConfig.name,
    status: 'fetching',
    articleCount: 0,
  };

  try {
    // 1. Fetch raw data
    onProgress?.({ ...progress, status: 'fetching' });
    const { articles: rawArticles, errors: fetchErrors } = await fetchForSport(sportConfig);

    if (fetchErrors.length > 0) {
      console.warn(`Fetch warnings for ${sportConfig.name}:`, fetchErrors);
    }

    if (rawArticles.length === 0) {
      return { ...progress, status: 'complete', articleCount: 0 };
    }

    // 2. Deduplicate
    onProgress?.({ ...progress, status: 'deduplicating' });
    const newArticles = await deduplicateArticles(rawArticles);

    if (newArticles.length === 0) {
      return { ...progress, status: 'complete', articleCount: 0 };
    }

    // 2b. Scrape full content for articles that lack sufficient content
    const needsScraping = newArticles.filter((a) => shouldAttemptArticleScrape(a));
    if (needsScraping.length > 0) {
      const SCRAPE_BATCH = 5;
      for (let i = 0; i < needsScraping.length; i += SCRAPE_BATCH) {
        const batch = needsScraping.slice(i, i + SCRAPE_BATCH);
        await Promise.allSettled(
          batch.map(async (article) => {
            try {
              const text = await scrapeArticleText(article.sourceUrl!);
              if (text) article.fullContent = text;
            } catch { /* best-effort */ }
          }),
        );
        if (i + SCRAPE_BATCH < needsScraping.length) await delay(300);
      }
    }

    // 2c. Only generate from sources with enough full text (800 chars min, no exceptions).
    const contentArticles = newArticles.filter((a) => isEligibleForAiGeneration(a));

    if (contentArticles.length === 0) {
      return { ...progress, status: 'complete', articleCount: 0 };
    }

    // 3. Rewrite each article (individually wrapped so one failure doesn't kill the batch)
    onProgress?.({ ...progress, status: 'rewriting' });
    const rewriteResults = contentArticles.map((article) => {
      try {
        return { ok: true as const, value: rewriteArticle(article) };
      } catch (error) {
        console.error(
          `Failed to rewrite article "${article.title}":`,
          error instanceof Error ? error.message : error,
        );
        return { ok: false as const };
      }
    });

    // Filter out failed rewrites and keep corresponding raw articles in sync
    const successfulPairs = rewriteResults
      .map((r, i) => (r.ok ? { raw: contentArticles[i]!, rewritten: r.value } : null))
      .filter((pair): pair is NonNullable<typeof pair> => pair !== null);

    const filteredRaw = successfulPairs.map((p) => p.raw);
    const rewrittenArticles = successfulPairs.map((p) => p.rewritten);

    // 4. Save to database
    onProgress?.({ ...progress, status: 'saving' });
    const savedCount = await saveArticlesToDb(filteredRaw, rewrittenArticles);

    progress.status = 'complete';
    progress.articleCount = savedCount;
    onProgress?.(progress);

    return progress;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    progress.status = 'error';
    progress.error = errorMsg;
    onProgress?.(progress);
    return progress;
  }
}

// ─── Generate Content for All Sports ────────────────────────────────────────

/**
 * Main content generation pipeline.
 * Loads all active sports from DB and generates content for each,
 * processing 5 sports at a time.
 */
export async function generateContent(
  onProgress?: (progress: GenerationProgress) => void,
  logId?: string,
): Promise<GenerationResult> {
  const result: GenerationResult = {
    totalArticles: 0,
    sportsProcessed: 0,
    errors: [],
    progress: [],
  };

  try {
    // 1. Load all active sports
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
      console.log('No active sports found. Skipping content generation.');
      return result;
    }

    console.log(`Starting content generation for ${activeSports.length} active sports...`);

    // 2. Process sports in batches of 5
    const sportConfigs: SportConfig[] = activeSports.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      espnSlug: s.espnSlug,
      sportsDbId: s.sportsDbId,
      isActive: s.isActive,
    }));

    const progressResults = await processBatch(
      sportConfigs,
      5,
      async (sportConfig) => {
        const sportProgress = await generateContentForSport(sportConfig, onProgress);
        return sportProgress;
      },
    );

    // 3. Aggregate results
    for (const sportProgress of progressResults) {
      result.progress.push(sportProgress);
      result.totalArticles += sportProgress.articleCount;
      result.sportsProcessed++;

      if (sportProgress.error) {
        result.errors.push(`${sportProgress.sport}: ${sportProgress.error}`);
      }
    }

    console.log(
      `Content generation complete: ${result.totalArticles} articles from ${result.sportsProcessed} sports`,
    );

    // 4. Update generation log
    if (logId) {
      try {
        await db
          .update(generationLogs)
          .set({
            status: result.errors.length > 0 ? 'failed' : 'completed',
            completedAt: new Date(),
            sportsProcessed: result.sportsProcessed,
            articlesGenerated: result.totalArticles,
            errors: result.errors.length > 0 ? result.errors : null,
          })
          .where(eq(generationLogs.id, logId));
      } catch (error) {
        console.warn('Failed to update generation log:', error);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Pipeline error: ${errorMsg}`);

    // Mark log as failed
    if (logId) {
      try {
        await db
          .update(generationLogs)
          .set({
            status: 'failed',
            completedAt: new Date(),
            errors: [errorMsg],
          })
          .where(eq(generationLogs.id, logId));
      } catch {
        // Silent fail on log update
      }
    }
  }

  return result;
}
