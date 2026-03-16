/**
 * Headline generator with 25+ humorous patterns.
 */

export interface HeadlineData {
  winner?: string;
  loser?: string;
  score?: string;
  player?: string;
  team?: string;
  event?: string;
  sport?: string;
  league?: string;
  homeScore?: number;
  awayScore?: number;
  originalTitle?: string; // The real headline from the source
}

type HeadlineFn = (data: HeadlineData) => string;

// ─── Blowout Headlines ─────────────────────────────────────────────────────

const blowoutHeadlines: HeadlineFn[] = [
  (d) => `Hold My Beer: ${d.winner ?? 'Winners'} Demolish ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} Send ${d.loser ?? 'Losers'} Home Early — Someone Call Them a Cab`,
  (d) => `${d.loser ?? 'The Losers'} Might Want to Sit Down for This One: ${d.score ?? 'Ouch'}`,
  (d) => `Stop the Count: ${d.winner ?? 'Winners'} Obliterate ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'The Victors'} Just Committed a Sports Crime Against ${d.loser ?? 'Humanity'}`,
];

// ─── Close Game Headlines ───────────────────────────────────────────────────

const closeGameHeadlines: HeadlineFn[] = [
  (d) => `Nail-Biter Alert: ${d.winner ?? 'Winners'} Edge ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} Survive ${d.loser ?? 'Losers'} in a Game That Took Years Off Our Lives`,
  (d) => `Too Close for Comfort: ${d.winner ?? 'Winners'} Squeak Past ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `Our Hearts Can't Take It: ${d.winner ?? 'Winners'} Win a Thriller ${d.score ?? ''}`,
  (d) => `By a Hair: ${d.winner ?? 'Winners'} Outlast ${d.loser ?? 'Losers'} in Instant Classic`,
];

// ─── Upset Headlines ────────────────────────────────────────────────────────

const upsetHeadlines: HeadlineFn[] = [
  (d) => `UPSET: ${d.winner ?? 'Underdogs'} Stun ${d.loser ?? 'Favorites'} — Vegas in Shambles`,
  (d) => `${d.winner ?? 'The Underdogs'} Just Rewrote the Script: ${d.score ?? 'Unbelievable'}`,
  (d) => `Pigs Fly, Hell Freezes Over, and ${d.winner ?? 'Underdogs'} Beat ${d.loser ?? 'Giants'}`,
  (d) => `Not a Typo: ${d.winner ?? 'The Little Guys'} Actually Beat ${d.loser ?? 'The Big Guys'} ${d.score ?? ''}`,
  (d) => `${d.loser ?? 'The Favorites'} in Shambles After ${d.winner ?? 'Underdogs'} Pull Off the Impossible`,
];

// ─── General Score Headlines ────────────────────────────────────────────────

const generalScoreHeadlines: HeadlineFn[] = [
  (d) => `${d.winner ?? 'Home Team'} Top ${d.loser ?? 'Away Team'} ${d.score ?? ''} — Cheers All Around`,
  (d) => `${d.winner ?? 'Winners'} Over ${d.loser ?? 'Losers'}: The Scoreboard Don't Lie`,
  (d) => `Final: ${d.winner ?? 'Team A'} ${d.score ?? 'Beats'} ${d.loser ?? 'Team B'} — Here's What Happened`,
  (d) => `${d.winner ?? 'The Victors'} Claim Victory and We Claim Another Round`,
  (d) => `${d.winner ?? 'Them'} ${d.score ?? 'Win'}: A Recap for People Who'd Rather Be at a Bar`,
];

// ─── News Headlines ─────────────────────────────────────────────────────────

const newsHeadlines: HeadlineFn[] = [
  // Patterns that USE the original headline when available
  (d) => d.originalTitle ? `${d.originalTitle} — Pour One Out` : `${d.player ?? d.team ?? 'Big News'}: ${d.event ?? 'Something Wild Just Happened'}`,
  (d) => d.originalTitle ? `Hold My Beer: ${d.originalTitle}` : `${d.event ?? 'Breaking News'} — We're Gonna Need a Bigger Pint`,
  (d) => d.originalTitle ? `${d.originalTitle} (Grab a Drink for This One)` : `Well, That Happened: ${d.player ?? d.team ?? 'Someone'} Makes Headlines`,
  (d) => d.originalTitle ? `Cheers to This: ${d.originalTitle}` : `Breaking: ${d.player ?? d.team ?? 'A Star'} Drops a Bombshell`,
  (d) => d.originalTitle ? `${d.originalTitle} — And We Need Another Round` : `${d.player ?? 'A Legend'} Just Did Something and the Internet Is Losing It`,
  (d) => d.originalTitle ? `🍺 ${d.originalTitle}` : `The ${d.sport ?? 'Sports'} World Just Got Interesting`,
  (d) => d.originalTitle ? `Last Call for Hot Takes: ${d.originalTitle}` : `Big Moves in the World of ${d.sport ?? 'Sports'}`,
  (d) => d.originalTitle ? `${d.originalTitle} — Bartender, Make It a Double` : `Breaking News Best Served Cold`,
];

// ─── Draw Headlines ─────────────────────────────────────────────────────────

const drawHeadlines: HeadlineFn[] = [
  (d) => `Nobody Wins, Everyone Drinks: ${d.winner ?? 'Team A'} and ${d.loser ?? 'Team B'} Draw ${d.score ?? ''}`,
  (d) => `A Draw? In This Economy? ${d.winner ?? 'Both Teams'} Split the Points`,
  (d) => `${d.winner ?? 'Home'} and ${d.loser ?? 'Away'} Can't Be Separated — ${d.score ?? 'Stalemate'}`,
];

// ─── Headline Selection Logic ───────────────────────────────────────────────

export type HeadlineCategory =
  | 'blowout'
  | 'close'
  | 'upset'
  | 'draw'
  | 'general_score'
  | 'news';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Determine the category of a score-based headline.
 */
export function categorizeScore(homeScore: number, awayScore: number): HeadlineCategory {
  const diff = Math.abs(homeScore - awayScore);
  const total = homeScore + awayScore;

  if (homeScore === awayScore) return 'draw';
  if (total === 0) return 'general_score';

  // Upset: large margin (>10 pts) and the away team won
  if (diff > 10 && awayScore > homeScore) return 'upset';

  // Blowout: margin is > 40% of total points
  if (diff / total > 0.4) return 'blowout';

  // Close: margin is < 10% of total or just 1 point
  if (diff <= 1 || diff / total < 0.1) return 'close';

  return 'general_score';
}

/**
 * Generate a humorous headline from article data.
 */
export function generateHeadline(data: HeadlineData, category?: HeadlineCategory): string {
  const cat = category ?? 'general_score';

  switch (cat) {
    case 'blowout':
      return pickRandom(blowoutHeadlines)(data);
    case 'close':
      return pickRandom(closeGameHeadlines)(data);
    case 'upset':
      return pickRandom(upsetHeadlines)(data);
    case 'draw':
      return pickRandom(drawHeadlines)(data);
    case 'news':
      return pickRandom(newsHeadlines)(data);
    case 'general_score':
    default:
      return pickRandom(generalScoreHeadlines)(data);
  }
}

/**
 * Generate multiple headline options to pick the best one.
 */
export function generateHeadlineOptions(
  data: HeadlineData,
  category?: HeadlineCategory,
  count: number = 3,
): string[] {
  const headlines: string[] = [];
  for (let i = 0; i < count; i++) {
    headlines.push(generateHeadline(data, category));
  }
  // Deduplicate
  return [...new Set(headlines)];
}
