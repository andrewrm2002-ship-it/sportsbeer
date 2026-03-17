/**
 * Judge agent — 2 independent judges score article variants.
 * Each judge has a different perspective to prevent correlated bias.
 */

import { callClaudeJSON } from './claude-cli';
import type { JudgeId, JudgeResult, WriterVariant } from './types';
import type { RawArticleData } from '../fetchers/types';

const JUDGE_PROMPTS: Record<JudgeId, string> = {
  editor: `You are a senior editor at a beer-themed sports publication called "Brews & Box Scores."
Your job is to evaluate article quality with brutal honesty and professional standards.

SCORING PHILOSOPHY:
- A 5 is "mediocre, needs work"
- A 7 is "publishable, decent"
- An 8 is "good, would share on social"
- A 9 is "excellent, best-of-week material"
- A 10 is "exceptional" — reserve for truly outstanding work
- Do NOT inflate scores. Be honest.`,

  reader: `You are a sports fan who reads articles for fun at the bar after work.
You have no patience for bad writing, forced jokes, or articles that bury the lead.

SCORING PHILOSOPHY:
- Would you finish reading this? Would you laugh? Would you share it with your buddy?
- A 5 means "I'd scroll past this"
- A 7 means "decent, I'd read it"
- An 8 means "this is good, I'd share it"
- A 9 means "this is great, I'm reading it out loud to the table"
- A 10 means "screenshot and send to the group chat"
- Be real. Don't be nice just to be nice.`,
};

const SCORING_RUBRIC = `
SCORING DIMENSIONS (each 1-10):
1. humorQuality: Are the jokes actually funny? Do they land naturally or feel forced?
2. factualAccuracy: Are ALL scores, names, dates, and facts preserved correctly from the source?
3. beerIntegration: Are beer/bar references woven naturally (~20-30%)? Not too much, not too little?
4. readabilityFlow: Does the article flow well? Good pacing? Easy to read?
5. headlineQuality: Is the headline catchy, informative, and makes you want to read more?
6. overallEngagement: Would someone actually enjoy reading this? Would they share it?

Also provide 2-3 sentences of specific feedback: what worked well and what needs improvement.

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

  return `${JUDGE_PROMPTS[judgeId]}

${SCORING_RUBRIC}

=== ORIGINAL SOURCE DATA (for fact-checking) ===
TITLE: ${sourceArticle.title}
DESCRIPTION: ${sourceArticle.description}
SPORT: ${sourceArticle.sport}
CATEGORY: ${sourceArticle.category}${scoreInfo}
TEAMS: ${sourceArticle.teams?.join(', ') ?? 'N/A'}
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
 * Run both judges on a single variant.
 */
export async function judgeWithBothJudges(
  variant: WriterVariant,
  sourceArticle: RawArticleData,
): Promise<{ judgeId: JudgeId; result: JudgeResult }[]> {
  const judges: JudgeId[] = ['editor', 'reader'];

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

export const JUDGE_IDS: JudgeId[] = ['editor', 'reader'];
