/**
 * Run the AI writing pipeline training loop.
 * Usage: npx tsx scripts/run-training.ts [rounds] [storiesPerRound]
 */

import { runOptimizationLoop } from '../src/pipeline/agents/loop';

const rounds = parseInt(process.argv[2] || '3', 10);
const stories = parseInt(process.argv[3] || '6', 10);

async function main() {
  const result = await runOptimizationLoop({
    maxRounds: rounds,
    storiesPerRound: stories,
    targetScore: 9.0,
    verbose: true,
  });

  console.log('\n=== FINAL ===');
  console.log(`Rounds: ${result.rounds.length}`);
  console.log(`Articles saved: ${result.totalStoriesSaved}`);
  console.log(`Scores: ${result.rounds.map((r) => r.avgScore.toFixed(1)).join(' → ')}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
