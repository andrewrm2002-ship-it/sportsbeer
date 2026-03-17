import fs from 'fs';
import { fetchFromRss } from '../src/pipeline/fetchers/rss';
import { getArticleHash } from '../src/pipeline/deduplicator';
import { writeAllStyles } from '../src/pipeline/agents/writer';
import { judgeWithCoreJudges } from '../src/pipeline/agents/judge';
import { isEligibleForAiGeneration } from '../src/pipeline/source-policy';
import { callClaudeParallel } from '../src/pipeline/agents/claude-cli';

const config = {
  id: 'basketball',
  name: 'Basketball',
  slug: 'basketball',
  espnSlug: 'basketball/nba',
  sportsDbId: 'Basketball',
  isActive: true,
};

const TARGET_URL = 'https://www.theguardian.com/sport/2026/mar/04/burner-account-or-not-kevin-durant-is-bitter-petty-and-entirely-relatable';
const SCORE_KEYS = [
  'humorQuality',
  'factualAccuracy',
  'beerIntegration',
  'readabilityFlow',
  'headlineQuality',
  'overallEngagement',
] as const;

type ScoreKey = typeof SCORE_KEYS[number];

type PanelResult = Record<ScoreKey, number> & {
  feedback: string;
  totalScore: number;
};

type PanelScoreRow = {
  judgeId: string;
  result: PanelResult;
  error?: string;
};

const PANEL_REVIEWERS = [
  {
    judgeId: 'line_editor',
    angle: 'You are ruthless about clarity, pacing, compression, and whether every paragraph earns its place. Penalize repetition, overlong setup, and weak transitions.',
  },
  {
    judgeId: 'fact_checker',
    angle: 'You are obsessive about source-only discipline. Compare every implication to the source text. Penalize unsupported context, invented history, embellished motives, and speculation.',
  },
  {
    judgeId: 'sports_reader',
    angle: 'You care whether this is interesting enough to share with a friend. Reward concrete detail, memorable lines, and a clear lede. Penalize generic tone and filler.',
  },
  {
    judgeId: 'packaging_editor',
    angle: 'You focus on headline, subtitle, framing, and publishability. Reward specificity and clean setup. Penalize headlines that are too long, too vague, or reusable across unrelated stories.',
  },
] as const;

function buildPrompt(
  judgeId: string,
  angle: string,
  article: { title: string; subtitle: string; body: string; summary: string },
  source: Awaited<ReturnType<typeof pickSource>>,
): string {
  return `You are reviewer "${judgeId}" evaluating a sports article.

ANGLE:
${angle}

Return ONLY valid JSON:
{"humorQuality":N,"factualAccuracy":N,"beerIntegration":N,"readabilityFlow":N,"headlineQuality":N,"overallEngagement":N,"feedback":"2-4 sentences of specific feedback"}

Scoring guidance:
- 5 = mediocre or generic
- 7 = publishable
- 8 = good
- 9 = excellent
- 10 = exceptional and rare
- Penalize unsupported facts hard
- Prefer subtle beer integration over forced theming
- Headline should be specific, not templated

=== SOURCE ===
TITLE: ${source.title}
DESCRIPTION: ${source.description}
SPORT: ${source.sport}
CATEGORY: ${source.category}
${source.scores ? `SCORES: ${source.scores.home} ${source.scores.homeScore} - ${source.scores.away} ${source.scores.awayScore}` : ''}
${source.teams?.length ? `TEAMS: ${source.teams.join(', ')}` : ''}
${source.players?.length ? `PLAYERS: ${source.players.join(', ')}` : ''}
${source.venue ? `VENUE: ${source.venue}` : ''}

FULL SOURCE TEXT:
${source.fullContent ?? ''}
=== END SOURCE ===

=== ARTICLE ===
HEADLINE: ${article.title}
SUBTITLE: ${article.subtitle}
BODY:
${article.body}
SUMMARY: ${article.summary}
=== END ARTICLE ===`;
}

async function pickSource() {
  const rss = await fetchFromRss(config);
  const raw = rss.articles.find((a) => a.sourceUrl === TARGET_URL)
    ?? rss.articles
      .filter((a) => isEligibleForAiGeneration(a))
      .sort((a, b) => (b.fullContent?.length ?? 0) - (a.fullContent?.length ?? 0))[0];

  if (!raw) {
    throw new Error('No RSS candidate with sufficient fullContent found');
  }

  return raw;
}

async function generateWinner(
  story: { raw: Awaited<ReturnType<typeof pickSource>>; hash: string },
  instructions: string,
) {
  let lastResults:
    | Awaited<ReturnType<typeof writeAllStyles>>
    | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    lastResults = await writeAllStyles(story, instructions);
    const winner = lastResults.find((v) => v.variant)?.variant;
    if (winner) return winner;
  }

  throw new Error(`Writer produced no variant: ${JSON.stringify(lastResults, null, 2)}`);
}

function normalizeScores(result: Record<string, unknown>): PanelResult {
  const normalized = {
    humorQuality: 5,
    factualAccuracy: 5,
    beerIntegration: 5,
    readabilityFlow: 5,
    headlineQuality: 5,
    overallEngagement: 5,
    feedback: typeof result.feedback === 'string' ? result.feedback : 'No feedback provided.',
    totalScore: 5,
  };

  for (const key of SCORE_KEYS) {
    const value = result[key];
    normalized[key] = typeof value === 'number'
      ? Math.max(1, Math.min(10, Math.round(value)))
      : 5;
  }

  normalized.totalScore = Number(
    (SCORE_KEYS.reduce((sum, key) => sum + normalized[key], 0) / SCORE_KEYS.length).toFixed(1),
  );

  return normalized;
}

function parseClaudeJson(raw: string): Record<string, unknown> {
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1]!.trim() : raw;

  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to parse reviewer response as JSON: ${raw.slice(0, 300)}`);
    }
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  }
}

function averageScores(
  rows: { result: Record<ScoreKey | 'totalScore', number> }[],
): Record<ScoreKey | 'totalScore', number> {
  if (rows.length === 0) {
    return {
      humorQuality: 0,
      factualAccuracy: 0,
      beerIntegration: 0,
      readabilityFlow: 0,
      headlineQuality: 0,
      overallEngagement: 0,
      totalScore: 0,
    };
  }

  return {
    humorQuality: Number((rows.reduce((sum, row) => sum + row.result.humorQuality, 0) / rows.length).toFixed(1)),
    factualAccuracy: Number((rows.reduce((sum, row) => sum + row.result.factualAccuracy, 0) / rows.length).toFixed(1)),
    beerIntegration: Number((rows.reduce((sum, row) => sum + row.result.beerIntegration, 0) / rows.length).toFixed(1)),
    readabilityFlow: Number((rows.reduce((sum, row) => sum + row.result.readabilityFlow, 0) / rows.length).toFixed(1)),
    headlineQuality: Number((rows.reduce((sum, row) => sum + row.result.headlineQuality, 0) / rows.length).toFixed(1)),
    overallEngagement: Number((rows.reduce((sum, row) => sum + row.result.overallEngagement, 0) / rows.length).toFixed(1)),
    totalScore: Number((rows.reduce((sum, row) => sum + row.result.totalScore, 0) / rows.length).toFixed(1)),
  };
}

async function main() {
  const instructions = fs.readFileSync('writing-instructions.md', 'utf-8');
  const raw = await pickSource();
  const story = { raw, hash: getArticleHash(raw) };
  const winner = await generateWinner(story, instructions);
  const builtIn = await judgeWithCoreJudges(winner, raw);
  const panelResponses = await callClaudeParallel(
    PANEL_REVIEWERS.map((reviewer) => ({
      prompt: buildPrompt(reviewer.judgeId, reviewer.angle, winner.output, raw),
      parse: parseClaudeJson,
    })),
    2,
  );
  const panel: PanelScoreRow[] = panelResponses.map((response, i) => ({
    judgeId: PANEL_REVIEWERS[i]!.judgeId,
    result: response.result ? normalizeScores(response.result) : {
      humorQuality: 5,
      factualAccuracy: 5,
      beerIntegration: 5,
      readabilityFlow: 5,
      headlineQuality: 5,
      overallEngagement: 5,
      feedback: response.error ?? 'Reviewer failed.',
      totalScore: 5,
    },
    error: response.error,
  }));
  const successfulPanel = panel.filter((row) => !row.error);

  console.log(JSON.stringify({
    source: {
      sourceName: raw.sourceName,
      title: raw.title,
      sourceUrl: raw.sourceUrl,
      fullContentLength: raw.fullContent?.length ?? 0,
      category: raw.category,
    },
    output: {
      style: winner.style,
      title: winner.output.title,
      subtitle: winner.output.subtitle,
      summary: winner.output.summary,
      bodyPreview: winner.output.body.slice(0, 1200),
    },
    builtInThreeJudgePanel: {
      judges: builtIn,
      averages: averageScores(builtIn),
    },
    adHocFourJudgePanel: {
      judges: panel,
      averages: averageScores(successfulPanel.length > 0 ? successfulPanel : panel),
    },
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
