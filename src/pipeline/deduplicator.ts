/**
 * Simple hash-based deduplication for articles.
 * Checks externalId + sourceName against existing articles in the database.
 */

import { db } from '../../db';
import { articles } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import type { RawArticleData } from './fetchers/types';

/**
 * Create a deterministic hash string from externalId and sourceName.
 * Uses a simple but effective string hash — no crypto needed for dedup.
 */
export function createSourceHash(externalId: string, sourceName: string): string {
  const input = `${sourceName}::${externalId}`;
  // Simple djb2-style hash converted to hex
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) & 0xffffffff;
  }
  // Convert to unsigned and then to hex for a clean string
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Filter out articles that already exist in the database.
 * Returns only new (non-duplicate) articles.
 */
export async function deduplicateArticles(
  rawArticles: RawArticleData[],
): Promise<RawArticleData[]> {
  if (rawArticles.length === 0) return [];

  // Compute hashes for all incoming articles
  const articleHashes = rawArticles.map((article) => ({
    article,
    hash: createSourceHash(article.externalId, article.sourceName),
  }));

  const allHashes = articleHashes.map((a) => a.hash);

  // Query existing hashes in batches of 100 to avoid huge IN clauses
  const existingHashes = new Set<string>();

  for (let i = 0; i < allHashes.length; i += 100) {
    const batch = allHashes.slice(i, i + 100);
    try {
      const existing = await db
        .select({ hash: articles.sourceDataHash })
        .from(articles)
        .where(inArray(articles.sourceDataHash, batch));

      for (const row of existing) {
        if (row.hash) existingHashes.add(row.hash);
      }
    } catch (error) {
      // If DB query fails, we'll include all articles (better to have dupes than miss content)
      console.warn('Deduplication query failed, including all articles:', error);
      return rawArticles;
    }
  }

  // Filter to only new articles
  const newArticles = articleHashes
    .filter(({ hash }) => !existingHashes.has(hash))
    .map(({ article }) => article);

  const dupeCount = rawArticles.length - newArticles.length;
  if (dupeCount > 0) {
    console.log(`Deduplication: filtered out ${dupeCount} existing articles, ${newArticles.length} new`);
  }

  return newArticles;
}

/**
 * Get the source hash for a single article (useful when inserting).
 */
export function getArticleHash(article: RawArticleData): string {
  return createSourceHash(article.externalId, article.sourceName);
}
