/**
 * Diagnostic: analyze what content each source provides
 * to understand the content gate bottleneck.
 */

import { db } from '../db';
import { sports } from '../db/schema';
import { eq } from 'drizzle-orm';
import { fetchFromEspn } from '../src/pipeline/fetchers/espn';
import { fetchFromRss } from '../src/pipeline/fetchers/rss';
import { fetchFromLeagueSites } from '../src/pipeline/fetchers/league-sites';
import type { SportConfig } from '../src/pipeline/fetchers/types';

async function main() {
  const activeSports = await db
    .select({ id: sports.id, name: sports.name, slug: sports.slug, espnSlug: sports.espnSlug, sportsDbId: sports.sportsDbId, isActive: sports.isActive })
    .from(sports)
    .where(eq(sports.isActive, true));

  // Test 3 popular sports
  const testSports = activeSports.filter(s => ['american-football', 'basketball', 'soccer', 'f1', 'baseball', 'cricket'].includes(s.id)).slice(0, 4);

  const stats = { total: 0, withFullContent: 0, withSourceUrl: 0, espnScrapable: 0, bySource: {} as Record<string, { total: number; withContent: number; avgLen: number }> };

  for (const sport of testSports) {
    const config: SportConfig = { id: sport.id, name: sport.name, slug: sport.slug, espnSlug: sport.espnSlug, sportsDbId: sport.sportsDbId, isActive: true };
    console.log(`\n=== ${sport.name} ===`);

    // ESPN
    try {
      const espn = await fetchFromEspn(config);
      for (const a of espn.articles) {
        stats.total++;
        const src = a.sourceName;
        if (!stats.bySource[src]) stats.bySource[src] = { total: 0, withContent: 0, avgLen: 0 };
        stats.bySource[src]!.total++;
        if (a.fullContent && a.fullContent.length >= 200) {
          stats.bySource[src]!.withContent++;
          stats.bySource[src]!.avgLen += a.fullContent.length;
        }
        if (a.sourceUrl) stats.withSourceUrl++;
        console.log(`  ESPN [${a.category}] "${a.title.slice(0, 60)}" — fullContent: ${a.fullContent?.length ?? 0} chars, sourceUrl: ${a.sourceUrl ? 'YES' : 'no'}`);
      }
    } catch (e) { console.log(`  ESPN error: ${e}`); }

    // RSS
    try {
      const rss = await fetchFromRss(config);
      for (const a of rss.articles) {
        stats.total++;
        const src = a.sourceName;
        if (!stats.bySource[src]) stats.bySource[src] = { total: 0, withContent: 0, avgLen: 0 };
        stats.bySource[src]!.total++;
        if (a.fullContent && a.fullContent.length >= 200) {
          stats.bySource[src]!.withContent++;
          stats.bySource[src]!.avgLen += a.fullContent.length;
        }
        if (a.sourceUrl) stats.withSourceUrl++;
        if (a.fullContent && a.fullContent.length >= 200) {
          console.log(`  RSS [${a.sourceName}] "${a.title.slice(0, 60)}" — fullContent: ${a.fullContent.length} chars ✓`);
        }
      }
      console.log(`  RSS: ${rss.articles.length} articles, ${rss.articles.filter(a => a.fullContent && a.fullContent.length >= 200).length} with content`);
    } catch (e) { console.log(`  RSS error: ${e}`); }

    // League sites
    try {
      const league = await fetchFromLeagueSites(config);
      for (const a of league.articles) {
        stats.total++;
        const src = a.sourceName;
        if (!stats.bySource[src]) stats.bySource[src] = { total: 0, withContent: 0, avgLen: 0 };
        stats.bySource[src]!.total++;
        if (a.fullContent && a.fullContent.length >= 200) {
          stats.bySource[src]!.withContent++;
          stats.bySource[src]!.avgLen += a.fullContent.length;
        }
        console.log(`  League [${a.sourceName}] "${a.title.slice(0, 60)}" — fullContent: ${a.fullContent?.length ?? 0} chars`);
      }
    } catch (e) { console.log(`  League error: ${e}`); }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total articles: ${stats.total}`);
  console.log(`With sourceUrl: ${stats.withSourceUrl}`);
  console.log('\nBy source:');
  for (const [src, data] of Object.entries(stats.bySource)) {
    const avgLen = data.withContent > 0 ? Math.round(data.avgLen / data.withContent) : 0;
    console.log(`  ${src}: ${data.total} total, ${data.withContent} with content (avg ${avgLen} chars)`);
  }
}

main().catch(console.error);
