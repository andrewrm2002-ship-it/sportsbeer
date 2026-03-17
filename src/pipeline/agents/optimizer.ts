/**
 * Meta-Optimizer agent — analyzes scores across a round and updates
 * writing instructions to improve quality in the next round.
 */

import { callClaudeJSON } from './claude-cli';
import type { OptimizationResult, RoundStats, ScoredVariant } from './types';

function formatVariantSummary(sv: ScoredVariant): string {
  const avgScores = sv.scores.reduce(
    (acc, s) => {
      acc.humor += s.result.humorQuality;
      acc.accuracy += s.result.factualAccuracy;
      acc.beer += s.result.beerIntegration;
      acc.readability += s.result.readabilityFlow;
      acc.headline += s.result.headlineQuality;
      acc.engagement += s.result.overallEngagement;
      return acc;
    },
    { humor: 0, accuracy: 0, beer: 0, readability: 0, headline: 0, engagement: 0 },
  );

  const n = sv.scores.length || 1;
  const feedback = sv.scores.map((s) => `  [${s.judgeId}]: ${s.result.feedback}`).join('\n');

  return `Style: ${sv.variant.style} | Source: "${sv.variant.sourceTitle}"
  Avg Score: ${sv.avgScore.toFixed(1)}/10
  Humor: ${(avgScores.humor / n).toFixed(1)} | Accuracy: ${(avgScores.accuracy / n).toFixed(1)} | Beer: ${(avgScores.beer / n).toFixed(1)}
  Readability: ${(avgScores.readability / n).toFixed(1)} | Headline: ${(avgScores.headline / n).toFixed(1)} | Engagement: ${(avgScores.engagement / n).toFixed(1)}
  Feedback:
${feedback}`;
}

function buildOptimizerPrompt(
  currentInstructions: string,
  currentRound: RoundStats,
  previousRounds: RoundStats[],
): string {
  // Sort variants by score
  const sorted = [...currentRound.scoredVariants].sort((a, b) => b.avgScore - a.avgScore);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const trendInfo = previousRounds.length > 0
    ? `\nSCORE TREND ACROSS ROUNDS:\n${previousRounds.map((r) => `  Round ${r.roundNumber}: avg=${r.avgScore.toFixed(1)}, best=${r.bestScore.toFixed(1)}`).join('\n')}\n  Round ${currentRound.roundNumber}: avg=${currentRound.avgScore.toFixed(1)}, best=${currentRound.bestScore.toFixed(1)}`
    : '\nThis is the first round — no previous data.';

  return `You are a writing coach analyzing article quality scores for "Brews & Box Scores."

YOUR JOB:
1. Analyze what the highest-scoring writers did differently from the lowest-scoring ones
2. Find patterns in the scores and judge feedback
3. APPEND a "## Lessons Learned" section to the existing instructions with specific, actionable improvements
4. You MUST NOT change the Voice, Rules, Stats Priority, Structure, Variety, or "What We're Not" sections — those are the editorial voice set by the editor-in-chief

CRITICAL CONSTRAINT:
- The existing instructions represent the publication's voice. DO NOT rewrite them.
- You may ONLY append new guidance in a "## Lessons Learned" section at the end.
- If the instructions already have a "## Lessons Learned" section, replace ONLY that section.
- Focus on specific, actionable tips like: "When covering injury reports, lead with the player's stats this season before the injury details" or "Avoid using 'chess not checkers' metaphor — it appeared in 3 articles this round."

=== CURRENT WRITING INSTRUCTIONS (preserve everything above "## Lessons Learned") ===
${currentInstructions}
=== END CURRENT INSTRUCTIONS ===
${trendInfo}

=== TOP SCORING ARTICLES THIS ROUND ===
${top3.map(formatVariantSummary).join('\n\n')}
=== END TOP ARTICLES ===

=== LOWEST SCORING ARTICLES THIS ROUND ===
${bottom3.map(formatVariantSummary).join('\n\n')}
=== END LOWEST ARTICLES ===

ROUND ${currentRound.roundNumber} OVERALL: avg=${currentRound.avgScore.toFixed(1)}, best=${currentRound.bestScore.toFixed(1)}, worst=${currentRound.worstScore.toFixed(1)}

Output ONLY valid JSON:
{"updatedInstructions":"the COMPLETE instructions with original sections preserved and only Lessons Learned section added/updated at the end","changesSummary":"2-3 sentences describing what patterns you found and what guidance you added"}`;
}

/**
 * Analyze round scores and produce updated writing instructions.
 */
export async function optimizeInstructions(
  currentInstructions: string,
  currentRound: RoundStats,
  previousRounds: RoundStats[],
): Promise<OptimizationResult> {
  const prompt = buildOptimizerPrompt(currentInstructions, currentRound, previousRounds);
  const result = await callClaudeJSON<OptimizationResult>(prompt);

  if (!result.updatedInstructions) {
    throw new Error('Optimizer returned empty instructions');
  }

  return {
    updatedInstructions: result.updatedInstructions,
    changesSummary: result.changesSummary || 'No changes summary provided.',
  };
}
