import fs from 'fs';
import { fetchFromRss } from '../src/pipeline/fetchers/rss';
import { getArticleHash } from '../src/pipeline/deduplicator';
import { writeAllStyles } from '../src/pipeline/agents/writer';
import { judgeWithCoreJudges } from '../src/pipeline/agents/judge';
import { isEligibleForAiGeneration } from '../src/pipeline/source-policy';

const config = {
  id: 'basketball',
  name: 'Basketball',
  slug: 'basketball',
  espnSlug: 'basketball/nba',
  sportsDbId: 'Basketball',
  isActive: true,
};

const TARGET_URL = 'https://www.theguardian.com/sport/2026/mar/04/burner-account-or-not-kevin-durant-is-bitter-petty-and-entirely-relatable';

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

async function main() {
  const instructions = fs.readFileSync('writing-instructions.md', 'utf-8');
  const raw = await pickSource();
  const story = { raw, hash: getArticleHash(raw) };
  const winner = await generateWinner(story, instructions);
  const scores = await judgeWithCoreJudges(winner, raw);

  console.log(JSON.stringify({
    source: {
      sourceName: raw.sourceName,
      title: raw.title,
      sourceUrl: raw.sourceUrl,
      fullContentLength: raw.fullContent?.length ?? 0,
      descriptionLength: raw.description.length,
      category: raw.category,
    },
    output: {
      style: winner.style,
      title: winner.output.title,
      subtitle: winner.output.subtitle,
      summary: winner.output.summary,
      bodyPreview: winner.output.body.slice(0, 1200),
    },
    judges: scores,
    averages: scores.length ? {
      humorQuality: Number((scores.reduce((s, x) => s + x.result.humorQuality, 0) / scores.length).toFixed(1)),
      factualAccuracy: Number((scores.reduce((s, x) => s + x.result.factualAccuracy, 0) / scores.length).toFixed(1)),
      beerIntegration: Number((scores.reduce((s, x) => s + x.result.beerIntegration, 0) / scores.length).toFixed(1)),
      readabilityFlow: Number((scores.reduce((s, x) => s + x.result.readabilityFlow, 0) / scores.length).toFixed(1)),
      headlineQuality: Number((scores.reduce((s, x) => s + x.result.headlineQuality, 0) / scores.length).toFixed(1)),
      overallEngagement: Number((scores.reduce((s, x) => s + x.result.overallEngagement, 0) / scores.length).toFixed(1)),
      totalScore: Number((scores.reduce((s, x) => s + x.result.totalScore, 0) / scores.length).toFixed(1)),
    } : null,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
