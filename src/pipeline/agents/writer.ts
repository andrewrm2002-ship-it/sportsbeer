/**
 * Writer agent — 3 distinct styles, each calls Claude via CLI.
 * Each writer gets the same source material + current writing instructions,
 * but applies a different voice/approach.
 */

import { callClaudeJSON } from './claude-cli';
import type { WriterStyle, WriterOutput, StoryData, WriterVariant } from './types';

const WRITER_PROMPTS: Record<WriterStyle, string> = {
  punchy: `You are "The Punchy Columnist" — a sports writer known for razor-sharp one-liners and quick-hit delivery.

VOICE & STYLE:
- Write like a bar-side sports commentator who gets to the point fast
- Short, punchy sentences. Every paragraph earns its place
- Beer references woven naturally (~25-30% of transitions), never forced
- Every paragraph should have at least one line that makes someone smirk
- Use active voice, strong verbs, no filler words
- Think "Twitter's best sports account wrote an article"

STRUCTURE:
- Catchy headline that makes you want to read
- Punchy subtitle (one line, sets the tone)
- 4-6 paragraphs max
- Opening line that hooks immediately
- Close with a zinger`,

  storyteller: `You are "The Storyteller" — a narrative sportswriter who turns box scores into campfire tales.

VOICE & STYLE:
- Build tension, use vivid imagery, make readers feel like they were there
- Beer references appear as natural metaphors and scene-setting (~20-25%)
  e.g., "the kind of game that empties the tap room"
- Longer, flowing sentences with dramatic pacing
- Paint the scene: crowd noise, player body language, the weight of the moment
- Think "if Ernest Hemingway wrote for a brewery's sports magazine"

STRUCTURE:
- Evocative headline that tells a mini-story
- Atmospheric subtitle
- 5-8 paragraphs with rising/falling action
- Scene-setting opener
- A moment of reflection at the close`,

  analyst: `You are "The Analyst with a Sense of Humor" — a sports analyst who backs every claim with evidence but delivers it with dry wit.

VOICE & STYLE:
- Data-driven observations with sardonic commentary
- Beer references used sparingly (~15-20%) as punchlines, never as the main course
- Balance insight with entertainment
- Dry, understated humor — the joke is in the observation, not in shouting it
- Think "the smart friend at the bar who notices things nobody else does"

STRUCTURE:
- Analytical headline with a twist
- Subtitle that hints at the deeper story
- 5-7 paragraphs
- Lead with the most interesting stat or observation
- Close with a forward-looking take`,
};

function buildWriterPrompt(
  story: StoryData,
  style: WriterStyle,
  instructions: string,
): string {
  const raw = story.raw;
  const scoreInfo = raw.scores
    ? `\nSCORES: ${raw.scores.home} ${raw.scores.homeScore} - ${raw.scores.away} ${raw.scores.awayScore}`
    : '';
  const teamsInfo = raw.teams?.length ? `\nTEAMS: ${raw.teams.join(', ')}` : '';
  const venueInfo = raw.venue ? `\nVENUE: ${raw.venue}` : '';
  const playersInfo = raw.players?.length ? `\nKEY PLAYERS: ${raw.players.join(', ')}` : '';

  return `${WRITER_PROMPTS[style]}

=== CURRENT WRITING GUIDELINES ===
${instructions}
=== END GUIDELINES ===

=== SOURCE ARTICLE DATA ===
SPORT: ${raw.sport}
LEAGUE: ${raw.league ?? 'N/A'}
CATEGORY: ${raw.category}
ORIGINAL TITLE: ${raw.title}
DESCRIPTION: ${raw.description}${scoreInfo}${teamsInfo}${venueInfo}${playersInfo}
=== END SOURCE DATA ===

CRITICAL RULES:
1. Preserve ALL facts exactly: scores, team names, player names, dates, venues
2. Do NOT invent facts, stats, or quotes that aren't in the source data
3. Output ONLY valid JSON with this exact structure, no other text:

{"title":"your headline","subtitle":"your subtitle","body":"<p>paragraph 1</p><p>paragraph 2</p>...","summary":"2-3 sentence summary"}`;
}

/**
 * Run a single writer agent on a single story.
 */
export async function writeArticle(
  story: StoryData,
  style: WriterStyle,
  instructions: string,
): Promise<WriterVariant> {
  const prompt = buildWriterPrompt(story, style, instructions);
  const output = await callClaudeJSON<WriterOutput>(prompt);

  // Validate required fields
  if (!output.title || !output.body) {
    throw new Error(`Writer (${style}) returned incomplete output: missing title or body`);
  }

  return {
    style,
    output: {
      title: output.title,
      subtitle: output.subtitle ?? '',
      body: output.body,
      summary: output.summary ?? '',
    },
    sourceHash: story.hash,
    sourceTitle: story.raw.title,
  };
}

/**
 * Run all 3 writers on a single story in parallel.
 */
export async function writeAllStyles(
  story: StoryData,
  instructions: string,
): Promise<{ variant?: WriterVariant; error?: string; style: WriterStyle }[]> {
  const styles: WriterStyle[] = ['punchy', 'storyteller', 'analyst'];

  const results = await Promise.allSettled(
    styles.map((style) => writeArticle(story, style, instructions)),
  );

  return results.map((r, i) => ({
    style: styles[i]!,
    variant: r.status === 'fulfilled' ? r.value : undefined,
    error: r.status === 'rejected'
      ? (r.reason instanceof Error ? r.reason.message : String(r.reason))
      : undefined,
  }));
}

export const WRITER_STYLES: WriterStyle[] = ['punchy', 'storyteller', 'analyst'];
