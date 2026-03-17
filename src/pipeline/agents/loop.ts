/**
 * Main optimization loop orchestrator.
 * Coordinates researchers, writers, judges, and optimizer across multiple rounds.
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { getArticleHash } from '../deduplicator';
import { researchStories } from './researcher';
import { writeAllStyles, WRITER_STYLES } from './writer';
import { judgeWithCoreJudges, JUDGE_IDS } from './judge';
import { optimizeInstructions } from './optimizer';
import { fallbackRewrite } from './fallback';
import type {
  AgentProgressEvent,
  LoopResult,
  RoundStats,
  ScoredVariant,
  WriterVariant,
  StoryData,
} from './types';

const INSTRUCTIONS_PATH = path.join(process.cwd(), 'writing-instructions.md');

export interface LoopOptions {
  maxRounds: number;
  storiesPerRound: number;
  targetScore: number;
  verbose: boolean;
  onProgress?: (event: AgentProgressEvent) => void;
}

const DEFAULT_OPTIONS: LoopOptions = {
  maxRounds: 5,
  storiesPerRound: 6,
  targetScore: 8.0,
  verbose: false,
};

function readInstructions(): string {
  try {
    return fs.readFileSync(INSTRUCTIONS_PATH, 'utf-8');
  } catch {
    return 'Write beer-themed sports articles that preserve all facts while being entertaining and funny.';
  }
}

function saveInstructions(content: string): void {
  fs.writeFileSync(INSTRUCTIONS_PATH, content, 'utf-8');
}

function log(verbose: boolean, ...args: unknown[]): void {
  if (verbose) console.log(...args);
}

function isPlateauing(rounds: RoundStats[]): boolean {
  if (rounds.length < 3) return false;
  const last3 = rounds.slice(-3);
  const improvement = last3[2]!.avgScore - last3[0]!.avgScore;
  return improvement < 0.2;
}

/**
 * Save the best variant for each story to the articles database.
 */
async function saveBestArticles(
  stories: StoryData[],
  scoredVariants: ScoredVariant[],
): Promise<number> {
  let saved = 0;

  for (const story of stories) {
    const storyVariants = scoredVariants.filter(
      (sv) => sv.variant.sourceHash === story.hash,
    );

    if (storyVariants.length === 0) continue;

    // Pick the highest-scoring variant
    const best = storyVariants.sort((a, b) => b.avgScore - a.avgScore)[0]!;

    // Quality gate: don't publish articles below minimum score
    const MIN_PUBLISH_SCORE = 6.0;
    if (best.avgScore < MIN_PUBLISH_SCORE) {
      console.log(`  Skipping "${best.variant.output.title.slice(0, 50)}..." — score ${best.avgScore.toFixed(1)} below threshold ${MIN_PUBLISH_SCORE}`);
      continue;
    }

    try {
      await db.insert(schema.articles).values({
        sportId: story.raw.sport,
        title: best.variant.output.title,
        subtitle: best.variant.output.subtitle,
        body: best.variant.output.body,
        summary: best.variant.output.summary,
        originalSourceUrl: story.raw.sourceUrl ?? null,
        originalSourceName: story.raw.sourceName,
        sourceDataHash: getArticleHash(story.raw),
        imageUrl: null,
        category: story.raw.category,
        tags: [...(story.raw.teams ?? []), 'ai-generated'],
        publishedAt: story.raw.publishedAt,
      });
      saved++;
    } catch (err) {
      console.error(`Failed to save article "${best.variant.output.title}":`, err);
    }
  }

  return saved;
}

/**
 * Run a single round of the optimization loop.
 */
async function runRound(
  roundNumber: number,
  stories: StoryData[],
  instructions: string,
  opts: LoopOptions,
): Promise<RoundStats> {
  const emit = (phase: AgentProgressEvent['phase'], message: string, avgScore?: number) => {
    opts.onProgress?.({ round: roundNumber, phase, message, avgScore });
    log(opts.verbose, `  [Round ${roundNumber}] ${message}`);
  };

  const allScoredVariants: ScoredVariant[] = [];
  const errors: string[] = [];

  // ── Phase 1: Writing ──────────────────────────────────────────────────
  emit('writing', `Writing ${stories.length} stories × ${WRITER_STYLES.length} styles...`);

  const allVariants: { story: StoryData; variant: WriterVariant }[] = [];

  for (const story of stories) {
    const results = await writeAllStyles(story, instructions);

    for (const r of results) {
      if (r.variant) {
        allVariants.push({ story, variant: r.variant });
      } else if (r.error) {
        errors.push(`Writer (${r.style}) failed: ${r.error}`);
        // Fallback to template engine
        try {
          const fb = fallbackRewrite(story.raw, r.style);
          allVariants.push({ story, variant: fb });
          log(opts.verbose, `    Fallback used for ${r.style} on "${story.raw.title}"`);
        } catch (fbErr) {
          errors.push(`Fallback also failed for ${r.style}: ${fbErr}`);
        }
      }
    }
  }

  emit('writing', `${allVariants.length} variants produced.`);

  // ── Phase 2: Judging ──────────────────────────────────────────────────
  emit('judging', `Judging ${allVariants.length} variants with ${JUDGE_IDS.length} judges...`);

  for (const { story, variant } of allVariants) {
    try {
      const scores = await judgeWithCoreJudges(variant, story.raw);
      const avgScore =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s.result.totalScore, 0) / scores.length
          : 0;

      allScoredVariants.push({ variant, scores, avgScore });
    } catch (err) {
      errors.push(
        `Judging failed for "${variant.output.title}": ${err instanceof Error ? err.message : err}`,
      );
      // Still include the variant with score 0
      allScoredVariants.push({ variant, scores: [], avgScore: 0 });
    }
  }

  // ── Compute round stats ───────────────────────────────────────────────
  const validScores = allScoredVariants.filter((sv) => sv.avgScore > 0);
  const avgScore =
    validScores.length > 0
      ? validScores.reduce((sum, sv) => sum + sv.avgScore, 0) / validScores.length
      : 0;
  const bestScore = validScores.length > 0
    ? Math.max(...validScores.map((sv) => sv.avgScore))
    : 0;
  const worstScore = validScores.length > 0
    ? Math.min(...validScores.map((sv) => sv.avgScore))
    : 0;

  emit('judging', `Avg: ${avgScore.toFixed(1)}/10, Best: ${bestScore.toFixed(1)}, Worst: ${worstScore.toFixed(1)}`, avgScore);

  return {
    roundNumber,
    avgScore: Math.round(avgScore * 10) / 10,
    bestScore: Math.round(bestScore * 10) / 10,
    worstScore: Math.round(worstScore * 10) / 10,
    scoredVariants: allScoredVariants,
    errors,
  };
}

/**
 * Run the full optimization loop.
 */
export async function runOptimizationLoop(
  options?: Partial<LoopOptions>,
): Promise<LoopResult> {
  const opts: LoopOptions = { ...DEFAULT_OPTIONS, ...options };
  const emit = (phase: AgentProgressEvent['phase'], message: string, avgScore?: number) => {
    opts.onProgress?.({ round: 0, phase, message, avgScore });
  };

  console.log(`\n🍺 Brews & Box Scores — AI Writing Pipeline`);
  console.log(`   Rounds: ${opts.maxRounds} | Stories/round: ${opts.storiesPerRound} | Target: ${opts.targetScore}/10\n`);

  let currentInstructions = readInstructions();
  const allRounds: RoundStats[] = [];
  let totalSaved = 0;

  for (let round = 1; round <= opts.maxRounds; round++) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  ROUND ${round}/${opts.maxRounds}`);
    console.log(`${'═'.repeat(60)}`);

    // ── Research ──────────────────────────────────────────────────────
    emit('researching', `Fetching ${opts.storiesPerRound} fresh stories...`);
    log(opts.verbose, `  [Round ${round}] Researching stories...`);

    let stories: StoryData[];
    try {
      stories = await researchStories(opts.storiesPerRound);
    } catch (err) {
      console.error(`  Research failed: ${err}`);
      continue;
    }

    if (stories.length === 0) {
      console.log('  No new stories found. Skipping round.');
      continue;
    }

    console.log(`  Found ${stories.length} fresh stories:`);
    for (const s of stories) {
      console.log(`    - [${s.raw.sport}] ${s.raw.title}`);
    }

    // ── Run round ────────────────────────────────────────────────────
    const roundStats = await runRound(round, stories, currentInstructions, opts);
    allRounds.push(roundStats);

    // ── Save round to DB ─────────────────────────────────────────────
    try {
      const roundRow = await db.insert(schema.aiGenerationRounds).values({
        roundNumber: round,
        status: 'completed',
        storiesProcessed: stories.length,
        avgScore: Math.round(roundStats.avgScore * 10),
        bestScore: Math.round(roundStats.bestScore * 10),
        completedAt: new Date(),
        errors: roundStats.errors.length > 0 ? roundStats.errors : null,
      }).returning({ id: schema.aiGenerationRounds.id });

      const roundId = roundRow[0]?.id;

      if (roundId) {
        // Save variants and scores
        for (const sv of roundStats.scoredVariants) {
          const variantRow = await db.insert(schema.aiArticleVariants).values({
            roundId,
            sourceArticleHash: sv.variant.sourceHash,
            sourceTitle: sv.variant.sourceTitle,
            writerStyle: sv.variant.style,
            title: sv.variant.output.title,
            subtitle: sv.variant.output.subtitle,
            body: sv.variant.output.body,
            summary: sv.variant.output.summary,
          }).returning({ id: schema.aiArticleVariants.id });

          const variantId = variantRow[0]?.id;
          if (variantId) {
            for (const score of sv.scores) {
              await db.insert(schema.aiVariantScores).values({
                variantId,
                judgeId: score.judgeId,
                humorQuality: score.result.humorQuality,
                factualAccuracy: score.result.factualAccuracy,
                beerIntegration: score.result.beerIntegration,
                readabilityFlow: score.result.readabilityFlow,
                headlineQuality: score.result.headlineQuality,
                overallEngagement: score.result.overallEngagement,
                totalScore: Math.round(score.result.totalScore * 10),
                feedback: score.result.feedback,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('  Failed to save round to DB:', err);
    }

    // ── Print round summary ──────────────────────────────────────────
    console.log(`\n  Round ${round} Results:`);
    console.log(`  ┌─────────────┬───────┬────────┬──────┬──────────┬──────────┬────────────┐`);
    console.log(`  │ Style       │ Humor │ Accur. │ Beer │ Readable │ Headline │ Engagement │`);
    console.log(`  ├─────────────┼───────┼────────┼──────┼──────────┼──────────┼────────────┤`);

    for (const sv of roundStats.scoredVariants) {
      if (sv.scores.length === 0) continue;
      const avg = (dim: 'humorQuality' | 'factualAccuracy' | 'beerIntegration' | 'readabilityFlow' | 'headlineQuality' | 'overallEngagement') =>
        (sv.scores.reduce((s, sc) => s + sc.result[dim], 0) / sv.scores.length).toFixed(1);

      console.log(
        `  │ ${sv.variant.style.padEnd(11)} │ ${avg('humorQuality').padStart(5)} │ ${avg('factualAccuracy').padStart(6)} │ ${avg('beerIntegration').padStart(4)} │ ${avg('readabilityFlow').padStart(8)} │ ${avg('headlineQuality').padStart(8)} │ ${avg('overallEngagement').padStart(10)} │`,
      );
    }
    console.log(`  └─────────────┴───────┴────────┴──────┴──────────┴──────────┴────────────┘`);
    console.log(`  AVG: ${roundStats.avgScore.toFixed(1)} | BEST: ${roundStats.bestScore.toFixed(1)} | WORST: ${roundStats.worstScore.toFixed(1)}`);

    // ── Save best articles ───────────────────────────────────────────
    emit('saving', 'Saving best articles to database...');
    const saved = await saveBestArticles(stories, roundStats.scoredVariants);
    totalSaved += saved;
    console.log(`  Saved ${saved} best articles to database.`);

    // ── Check stopping conditions ────────────────────────────────────
    if (roundStats.avgScore >= opts.targetScore) {
      console.log(`\n  Target score ${opts.targetScore} reached! Stopping.`);
      break;
    }

    if (isPlateauing(allRounds)) {
      console.log(`\n  Score plateau detected. Stopping.`);
      break;
    }

    // ── Optimize instructions ────────────────────────────────────────
    if (round < opts.maxRounds) {
      emit('optimizing', 'Analyzing scores and updating writing instructions...');
      console.log(`\n  Optimizing writing instructions...`);

      try {
        const previousRounds = allRounds.slice(0, -1);
        const optimization = await optimizeInstructions(
          currentInstructions,
          roundStats,
          previousRounds,
        );

        // Save instruction version to DB
        try {
          await db.insert(schema.aiInstructionVersions).values({
            roundId: null,
            content: optimization.updatedInstructions,
            avgScoreBefore: Math.round(roundStats.avgScore * 10),
            changesSummary: optimization.changesSummary,
          });
        } catch {
          // Non-critical
        }

        currentInstructions = optimization.updatedInstructions;
        saveInstructions(currentInstructions);

        console.log(`  Changes: ${optimization.changesSummary}`);
      } catch (err) {
        console.warn(`  Optimizer failed, keeping current instructions:`, err);
      }
    }

    emit('complete', `Round ${round} complete.`, roundStats.avgScore);
  }

  // ── Final summary ──────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  PIPELINE COMPLETE`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Rounds completed: ${allRounds.length}`);
  console.log(`  Articles saved: ${totalSaved}`);

  if (allRounds.length > 0) {
    console.log(`  Score progression:`);
    for (const r of allRounds) {
      const bar = '█'.repeat(Math.round(r.avgScore));
      console.log(`    Round ${r.roundNumber}: ${bar} ${r.avgScore.toFixed(1)}/10`);
    }
  }

  console.log(`\n  Writing instructions saved to: ${INSTRUCTIONS_PATH}\n`);

  return {
    rounds: allRounds,
    finalInstructions: currentInstructions,
    totalStoriesSaved: totalSaved,
  };
}
