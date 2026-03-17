/**
 * Judge agent — 3 independent judges score article variants.
 * Each judge has a different perspective to reduce correlated bias.
 */

import { callClaudeJSON } from './claude-cli';
import type { JudgeId, JudgeResult, WriterVariant } from './types';
import type { RawArticleData } from '../fetchers/types';

const JUDGE_PROMPTS: Record<JudgeId, string> = {
  editor: `You are a senior editor evaluating article quality. Be brutally honest.

SCORING PHILOSOPHY:
- A 5 is "mediocre — generic, no real information, filler phrases"
- A 7 is "publishable — has real facts and reads well"
- An 8 is "good — information-dense, sharp writing, would share on social"
- A 9 is "excellent — every paragraph earns its place, memorable closing line"
- A 10 is "exceptional" — reserve for truly outstanding work
- AUTOMATIC FAIL (score 3 or below) if:
  * The article contains filler phrases like "settle in," "what a time," "the sports world is buzzing"
  * Information is repeated/duplicated across paragraphs
  * The article lacks specific stats, scores, or player names from the source
  * More than 2 beer references
  * The headline uses templates like "Hold My Beer" or "Pour One Out"`,

  reader: `You are a sports fan who reads articles for information. You want to learn what happened, with some personality.

SCORING PHILOSOPHY:
- Did you actually learn something from this article? Specific stats, context, implications?
- Would you share this with a friend? Is there a line worth quoting?
- A 5 means "this told me nothing I couldn't get from the score ticker"
- A 7 means "decent, I know what happened and why it matters"
- An 8 means "good, I'd text this to someone"
- A 9 means "great, I'm reading parts of this out loud"
- SCORE LOW if the article is vague, repetitive, or full of empty phrases instead of facts`,

  fact_checker: `You are a skeptical fact-checker reviewing a sports article against the source.

SCORING PHILOSOPHY:
- Treat unsupported context as a real defect even if it is probably true
- Penalize invented team/position labels, added history, motive attribution, and summary language that reaches beyond the source
- A 5 means "mostly right, but embellished or sloppy"
- A 7 means "factually solid, minor unsupported framing"
- A 9 means "tight, source-disciplined, no meaningful drift from the source"
- Give low factualAccuracy if the writer adds background knowledge not explicitly supported by the source
- If the article speculates about intent, consequences, or historical patterns without source support, call it out directly`,
};

const SCORING_RUBRIC = `
SCORING DIMENSIONS (each 1-10):
1. humorQuality: Does the humor come from sharp observations about the actual story? Score LOW for forced jokes, puns, generic quips. Score HIGH for wit rooted in specific facts.
2. factualAccuracy: Compare EVERY claim against the source material. Are scores, names, dates, stats correct? Score 1 if facts are invented. Score 10 only if every detail checks out.
3. beerIntegration: Score HIGH (8-10) if beer references are 0-2, subtle, and feel natural. Score LOW (1-4) if there are 3+ beer references, beer-themed headlines, or beer is the focus instead of the sport. LESS IS MORE.
4. readabilityFlow: Short paragraphs? No repeated information? No filler phrases? Good pacing? Score LOW for any duplicated information or empty transitions like "settle in" or "what a time to be watching sports."
5. headlineQuality: Is the headline SPECIFIC to this story (not a reusable template)? Does it tell you what happened? Score LOW for generic headlines or beer-pun headlines.
6. overallEngagement: Did you actually LEARN something? Are there specific stats, standings implications, player context? Score LOW for vague articles. Score HIGH for information-dense writing with personality.

IMPORTANT: Check for these AUTOMATIC DEDUCTIONS:
- Duplicated information across paragraphs: -3 points from readabilityFlow
- Generic filler phrases ("what a time," "settle in," "the sports world"): -2 from overallEngagement
- More than 2 beer references: -3 from beerIntegration
- Headline could work for any team/sport with name swap: -3 from headlineQuality

Provide 2-3 sentences of specific, actionable feedback.

Output ONLY valid JSON:
{"humorQuality":N,"factualAccuracy":N,"beerIntegration":N,"readabilityFlow":N,"headlineQuality":N,"overallEngagement":N,"feedback":"your feedback here"}`;

function buildJudgePrompt(
  variant: WriterVariant,
  sourceArticle: RawArticleData,
  judgeId: JudgeId,
): string {
  const scoreInfo = sourceArticle.scores
    ? `\nORIGINAL SCORES: ${sourceArticle.scores.home} ${sourceArticle.scores.homeScore} - ${sourceArticle.scores.away} ${sourceArticle.scores.awayScore}`
    : '';
  const teamsInfo = sourceArticle.teams?.length ? `\nTEAMS: ${sourceArticle.teams.join(', ')}` : '';
  const venueInfo = sourceArticle.venue ? `\nVENUE: ${sourceArticle.venue}` : '';
  const playersInfo = sourceArticle.players?.length ? `\nKEY PLAYERS: ${sourceArticle.players.join(', ')}` : '';

  // Give the judge the full source text so they can verify every claim.
  const fullContentSection = sourceArticle.fullContent
    ? `\n\nFULL SOURCE TEXT (use this to verify every claim in the article):\n${sourceArticle.fullContent}`
    : '';

  return `${JUDGE_PROMPTS[judgeId]}

${SCORING_RUBRIC}

=== ORIGINAL SOURCE DATA (verify every fact against this) ===
TITLE: ${sourceArticle.title}
DESCRIPTION: ${sourceArticle.description}
SPORT: ${sourceArticle.sport}
CATEGORY: ${sourceArticle.category}${scoreInfo}${teamsInfo}${venueInfo}${playersInfo}${fullContentSection}
=== END SOURCE DATA ===

=== ARTICLE TO JUDGE ===
WRITER STYLE: ${variant.style}
HEADLINE: ${variant.output.title}
SUBTITLE: ${variant.output.subtitle}

${variant.output.body}

SUMMARY: ${variant.output.summary}
=== END ARTICLE ===`;
}

/**
 * Score a single variant with a single judge.
 */
export async function judgeVariant(
  variant: WriterVariant,
  sourceArticle: RawArticleData,
  judgeId: JudgeId,
): Promise<JudgeResult> {
  const prompt = buildJudgePrompt(variant, sourceArticle, judgeId);
  const scores = await callClaudeJSON<JudgeResult>(prompt);

  // Validate and clamp scores to 1-10
  const dims = [
    'humorQuality', 'factualAccuracy', 'beerIntegration',
    'readabilityFlow', 'headlineQuality', 'overallEngagement',
  ] as const;

  for (const dim of dims) {
    const val = scores[dim];
    if (typeof val !== 'number' || val < 1 || val > 10) {
      scores[dim] = Math.max(1, Math.min(10, Math.round(Number(val) || 5)));
    }
  }

  // Compute total as average
  const total = dims.reduce((sum, d) => sum + scores[d], 0) / dims.length;
  scores.totalScore = Math.round(total * 10) / 10;
  scores.feedback = scores.feedback || 'No feedback provided.';

  return scores;
}

/**
 * Run the core judge panel on a single variant.
 */
export async function judgeWithCoreJudges(
  variant: WriterVariant,
  sourceArticle: RawArticleData,
): Promise<{ judgeId: JudgeId; result: JudgeResult }[]> {
  const judges = CORE_JUDGE_IDS;

  const results = await Promise.allSettled(
    judges.map((judgeId) => judgeVariant(variant, sourceArticle, judgeId)),
  );

  const scored: { judgeId: JudgeId; result: JudgeResult }[] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    if (r.status === 'fulfilled') {
      scored.push({ judgeId: judges[i]!, result: r.value });
    } else {
      console.warn(`Judge ${judges[i]} failed:`, r.reason);
    }
  }

  return scored;
}

export const CORE_JUDGE_IDS = ['editor', 'reader', 'fact_checker'] as const satisfies JudgeId[];
export const JUDGE_IDS: JudgeId[] = [...CORE_JUDGE_IDS];

// Backward-compatible alias for older scripts.
export const judgeWithBothJudges = judgeWithCoreJudges;
