/**
 * Writer agent — 3 distinct styles, each calls Claude via CLI.
 * Each writer gets the same source material + current writing instructions,
 * but applies a different voice/approach.
 */

import { callClaudeJSON } from './claude-cli';
import type { WriterStyle, WriterOutput, StoryData, WriterVariant } from './types';

const WRITER_PROMPTS: Record<WriterStyle, string> = {
  punchy: `You are a sharp sports writer with zero patience for spin. Get in, deliver the news with bite, get out.

YOUR ANGLE:
- Lead with the hardest-hitting fact. No warmup, no throat-clearing.
- Every sentence carries new information or a sharp observation. Cut anything that doesn't.
- Be cutting when the story earns it. If a team blew a 20-point lead, say so directly. If a front office is lying about an injury timeline, call it out. If a trade makes no sense, explain why with numbers.
- Sarcasm is a scalpel, not a sledgehammer — use it when the absurdity of the situation speaks for itself. "The Commanders gave up two firsts for a quarterback who's thrown 11 touchdowns in two seasons. Bold strategy." That's the energy.
- Don't force humor where it doesn't fit. A serious injury or tragedy gets reported straight. Read the room.
- 3-5 tight paragraphs. If you can say it in fewer words, do.
- End with the line people will quote — a take, a prediction, a gut-punch observation.`,

  storyteller: `You are a narrative sportswriter who makes readers feel like they were there — with an edge.

YOUR ANGLE:
- Build the scene: the crowd, the moment, the stakes. Make it vivid.
- Let the facts tell the story — don't narrate over them.
- You're allowed to be sardonic when the moment calls for it. A team celebrating a regular-season win like they won the title? Note it. A player's post-game quote that contradicts everything that just happened on the field? Quote it, then let the facts do the roasting.
- Tension and pacing matter. Let a big moment breathe before you comment on it.
- Use specific details from the source: the count, the clock, the player's body language.
- 4-6 paragraphs with a clear arc. Set up, escalation, resolution.
- End with a moment of reflection — what this game meant, not just what happened. Make it land.`,

  analyst: `You are the smart friend at the bar who notices things nobody else does — and isn't afraid to say them.

YOUR ANGLE:
- Lead with the most interesting stat or observation, not the obvious headline.
- Back every claim with evidence. Numbers, records, historical context.
- Dry, understated humor — the joke is in the observation itself, not in announcing it. "The Nets are 3-19 in their last 22 games, which is technically an improvement over the previous 22." That's the register.
- Be skeptical of narratives. If everyone is calling a player "clutch," check the actual numbers. If a coach's strategy is being praised, look at whether it actually worked or if they just got lucky.
- Connect dots: what does this result mean for standings, playoffs, draft position?
- 4-6 paragraphs. Each one earns its place with new analysis.
- End with a forward-looking take that makes readers think — or makes them nervous if they're fans of the team in question.`,
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

  const fullContentSection = raw.fullContent
    ? `\n\nFULL SOURCE ARTICLE TEXT (this is your primary source — mine it for every detail):\n${raw.fullContent}`
    : '';

  return `${WRITER_PROMPTS[style]}

=== WRITING GUIDELINES (follow these exactly) ===
${instructions}
=== END GUIDELINES ===

=== SOURCE MATERIAL ===
SPORT: ${raw.sport}
LEAGUE: ${raw.league ?? 'N/A'}
CATEGORY: ${raw.category}
ORIGINAL TITLE: ${raw.title}
DESCRIPTION: ${raw.description}${scoreInfo}${teamsInfo}${venueInfo}${playersInfo}${fullContentSection}
=== END SOURCE MATERIAL ===

CRITICAL RULES:
1. READ THE FULL SOURCE TEXT CAREFULLY. Extract every specific stat, player name, quote, score, date, and detail. Your article must be INFORMATION-DENSE — readers should learn real things.
2. DO NOT duplicate information. Say each fact once, in the most impactful place. If you mention a score in the opening, don't repeat it in paragraph 3.
3. DO NOT use filler phrases: "the sports world is buzzing," "settle in," "what a time to be watching sports," "there's a thin line between chaos and brilliance," "and that's the ballgame," "chess not checkers," "what a time to be alive." These are empty calories. Every sentence must carry new information or a sharp observation.
4. NEVER invent facts, stats, quotes, or outcomes not in the source material.
5. Beer references: 1-2 per article MAXIMUM. They should feel like asides, not structure. No "Hold My Beer," "Pour One Out," "Cheers to This," or any beer-themed headline template.
6. Headline: the actual news, stated clearly. Be clever if you can, but informative first. It must be SPECIFIC to this story — if you could swap the team name and reuse it, it's too generic.
7. Short paragraphs: 2-3 sentences max. This is bar conversation, not a term paper.
8. No emoji. Ever.
9. BE DIRECT AND OPINIONATED. If a trade is bad, say it's bad and explain why with numbers. If a team is lying about an injury, call it out. If a stat is absurd, let the absurdity speak. Sarcasm and wit are welcome when earned by the facts — but never force it. A straight delivery of an absurd fact is funnier than any punchline.
10. READ THE ROOM. Serious injuries, tragedies, and sensitive topics get reported straight. Not everything needs a joke.

Output ONLY valid JSON with this exact structure, no other text:

{"title":"your headline","subtitle":"one sentence context, not a pun","body":"<p>paragraph 1</p><p>paragraph 2</p>...","summary":"2-3 sentence factual summary"}`;
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
  const styles: WriterStyle[] = ['punchy'];

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

export const WRITER_STYLES: WriterStyle[] = ['punchy'];
