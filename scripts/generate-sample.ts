/**
 * Generate a single sample article and print it for review.
 */

import { researchStories } from '../src/pipeline/agents/researcher';
import { writeArticle } from '../src/pipeline/agents/writer';
import fs from 'fs';

async function main() {
  console.log('Researching fresh stories...\n');
  const stories = await researchStories(3);

  if (stories.length === 0) {
    console.log('No fresh stories found.');
    return;
  }

  const story = stories[0]!;
  console.log(`Source: "${story.raw.title}"`);
  console.log(`Sport: ${story.raw.sport} | From: ${story.raw.sourceName}`);
  console.log(`Content: ${story.raw.fullContent?.length ?? 0} chars\n`);

  const instructions = fs.readFileSync('writing-instructions.md', 'utf-8');
  const result = await writeArticle(story, 'punchy', instructions);

  const bodyText = result.output.body
    .replace(/<\/p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  console.log('══════════════════════════════════════');
  console.log(`HEADLINE: ${result.output.title}`);
  console.log(`SUBTITLE: ${result.output.subtitle}`);
  console.log('══════════════════════════════════════');
  console.log();
  console.log(bodyText);
  console.log();
  console.log('──────────────────────────────────────');
  console.log(`SUMMARY: ${result.output.summary}`);
}

main().catch(console.error);
