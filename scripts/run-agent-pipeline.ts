#!/usr/bin/env npx tsx
/**
 * CLI entry point for the multi-agent writing quality pipeline.
 *
 * Usage:
 *   npx tsx scripts/run-agent-pipeline.ts [options]
 *
 * Options:
 *   --rounds N        Max optimization rounds (default: 5)
 *   --stories N       Stories per round (default: 3)
 *   --target-score N  Stop when avg score reaches this (default: 8.0)
 *   --verbose         Show detailed progress
 *   --help            Show this help message
 */

import { runOptimizationLoop } from '../src/pipeline/agents/loop';

function parseArgs(): {
  maxRounds: number;
  storiesPerRound: number;
  targetScore: number;
  verbose: boolean;
} {
  const args = process.argv.slice(2);
  const opts = {
    maxRounds: 5,
    storiesPerRound: 3,
    targetScore: 8.0,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--rounds':
        opts.maxRounds = parseInt(args[++i] ?? '5', 10);
        break;
      case '--stories':
        opts.storiesPerRound = parseInt(args[++i] ?? '3', 10);
        break;
      case '--target-score':
        opts.targetScore = parseFloat(args[++i] ?? '8.0');
        break;
      case '--verbose':
        opts.verbose = true;
        break;
      case '--help':
        console.log(`
Brews & Box Scores — AI Writing Pipeline

Usage:
  npx tsx scripts/run-agent-pipeline.ts [options]

Options:
  --rounds N        Max optimization rounds (default: 5)
  --stories N       Stories per round (default: 3)
  --target-score N  Stop when avg score hits this (default: 8.0)
  --verbose         Show detailed progress
  --help            Show this help
`);
        process.exit(0);
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();

  try {
    const result = await runOptimizationLoop(opts);

    // Exit code based on results
    if (result.rounds.length === 0) {
      console.error('No rounds completed. Check your data sources.');
      process.exit(1);
    }

    const finalAvg = result.rounds[result.rounds.length - 1]?.avgScore ?? 0;
    if (finalAvg >= opts.targetScore) {
      console.log(`Target score of ${opts.targetScore} achieved!`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Pipeline failed:', err);
    process.exit(1);
  }
}

main();
