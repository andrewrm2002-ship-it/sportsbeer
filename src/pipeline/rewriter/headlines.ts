/**
 * Headline generator with 50+ humorous patterns.
 * Rebalanced: majority witty sports headlines, minority beer-themed.
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
  // Non-beer (7)
  (d) => `Stop the Presses: ${d.winner ?? 'Winners'} Demolish ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} Leave No Survivors in ${d.score ?? ''} Rout of ${d.loser ?? 'Losers'}`,
  (d) => `${d.loser ?? 'The Losers'} Might Want to Sit Down for This One: ${d.score ?? 'Ouch'}`,
  (d) => `${d.winner ?? 'The Victors'} Just Committed a Sports Crime Against ${d.loser ?? 'Humanity'}`,
  (d) => `This Wasn't a Game — It Was a Statement: ${d.winner ?? 'Winners'} ${d.score ?? ''} ${d.loser ?? 'Losers'}`,
  (d) => `${d.winner ?? 'Winners'} Dismantle ${d.loser ?? 'Losers'} in a Performance for the Ages`,
  (d) => `We're Going to Need a Bigger Highlight Reel: ${d.winner ?? 'Winners'} ${d.score ?? ''} ${d.loser ?? 'Losers'}`,
  // Beer-themed (3)
  (d) => `Hold My Beer: ${d.winner ?? 'Winners'} Demolish ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} Send ${d.loser ?? 'Losers'} Home Early — Someone Call Them a Cab`,
  (d) => `Stop the Count: ${d.winner ?? 'Winners'} Obliterate ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
];

// ─── Close Game Headlines ───────────────────────────────────────────────────

const closeGameHeadlines: HeadlineFn[] = [
  // Non-beer (7)
  (d) => `Photo Finish: ${d.winner ?? 'Winners'} Edge ${d.loser ?? 'Losers'} in Instant Classic`,
  (d) => `${d.winner ?? 'Winners'} Survive ${d.loser ?? 'Losers'} in a Game That Took Years Off Our Lives`,
  (d) => `Too Close for Comfort: ${d.winner ?? 'Winners'} Squeak Past ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `Both Teams Deserve a Vacation After This: ${d.winner ?? 'Winners'} Win ${d.score ?? ''}`,
  (d) => `The Kind of Game That Ages You in Real Time: ${d.winner ?? 'Winners'} ${d.score ?? ''} ${d.loser ?? 'Losers'}`,
  (d) => `Instant Classic: ${d.winner ?? 'Winners'} and ${d.loser ?? 'Losers'} Deliver an All-Timer`,
  (d) => `By a Hair: ${d.winner ?? 'Winners'} Outlast ${d.loser ?? 'Losers'} in Instant Classic`,
  // Beer-themed (3)
  (d) => `Nail-Biter Alert: ${d.winner ?? 'Winners'} Edge ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `Our Hearts Can't Take It: ${d.winner ?? 'Winners'} Win a Thriller ${d.score ?? ''}`,
  (d) => `Cardiac Special: ${d.winner ?? 'Winners'} Barely Survive ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
];

// ─── Upset Headlines ────────────────────────────────────────────────────────

const upsetHeadlines: HeadlineFn[] = [
  // Non-beer (7)
  (d) => `Check the Scoreboard Again: ${d.winner ?? 'Underdogs'} Actually Beat ${d.loser ?? 'Favorites'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'The Underdogs'} Just Rewrote the Script: ${d.score ?? 'Unbelievable'}`,
  (d) => `Not a Typo: ${d.winner ?? 'The Little Guys'} Actually Beat ${d.loser ?? 'The Big Guys'} ${d.score ?? ''}`,
  (d) => `${d.loser ?? 'The Favorites'} in Shambles After ${d.winner ?? 'Underdogs'} Pull Off the Impossible`,
  (d) => `Pigs Fly, Hell Freezes Over, and ${d.winner ?? 'Underdogs'} Beat ${d.loser ?? 'Giants'}`,
  (d) => `Nobody Saw This Coming: ${d.winner ?? 'Underdogs'} Shock ${d.loser ?? 'Favorites'} ${d.score ?? ''}`,
  (d) => `The Biggest Upset of the Season? ${d.winner ?? 'Underdogs'} ${d.score ?? ''} ${d.loser ?? 'Favorites'}`,
  // Beer-themed (3)
  (d) => `UPSET: ${d.winner ?? 'Underdogs'} Stun ${d.loser ?? 'Favorites'} — Vegas in Shambles`,
  (d) => `Alert the Bookmakers: ${d.winner ?? 'Underdogs'} Topple ${d.loser ?? 'Giants'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'The Underdogs'} Just Made a Lot of People Very Rich (and Very Poor)`,
];

// ─── General Score Headlines ────────────────────────────────────────────────

const generalScoreHeadlines: HeadlineFn[] = [
  // Non-beer (7)
  (d) => `${d.winner ?? 'Home Team'} Top ${d.loser ?? 'Away Team'} ${d.score ?? ''} — Here's What Happened`,
  (d) => `${d.winner ?? 'Winners'} Over ${d.loser ?? 'Losers'}: The Scoreboard Don't Lie`,
  (d) => `Final: ${d.winner ?? 'Team A'} ${d.score ?? 'Beats'} ${d.loser ?? 'Team B'} in Convincing Fashion`,
  (d) => `${d.winner ?? 'The Victors'} Get the Job Done Against ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} ${d.score ?? ''}: A Recap of Everything You Missed`,
  (d) => `The Result Is In: ${d.winner ?? 'Winners'} Handle ${d.loser ?? 'Losers'} ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Winners'} Take Care of Business Against ${d.loser ?? 'Losers'}`,
  // Beer-themed (3)
  (d) => `${d.winner ?? 'The Victors'} Claim Victory and We Claim Another Round`,
  (d) => `${d.winner ?? 'Them'} ${d.score ?? 'Win'}: A Recap for People Who'd Rather Be at a Bar`,
  (d) => `${d.winner ?? 'Home Team'} Top ${d.loser ?? 'Away Team'} ${d.score ?? ''} — Cheers All Around`,
];

// ─── News Headlines ─────────────────────────────────────────────────────────

const newsHeadlines: HeadlineFn[] = [
  // Non-beer — use original title when available (6)
  (d) => d.originalTitle ? `${d.originalTitle}` : `${d.player ?? d.team ?? 'Big News'}: ${d.event ?? 'Something Wild Just Happened'}`,
  (d) => d.originalTitle ? `Breaking: ${d.originalTitle}` : `Breaking: ${d.player ?? d.team ?? 'A Star'} Drops a Bombshell`,
  (d) => d.originalTitle ? `You're Going to Want to Sit Down for This: ${d.originalTitle}` : `Well, That Happened: ${d.player ?? d.team ?? 'Someone'} Makes Headlines`,
  (d) => d.originalTitle ? `The Sports World Won't Shut Up About This: ${d.originalTitle}` : `The ${d.sport ?? 'Sports'} World Just Got Interesting`,
  (d) => d.originalTitle ? `${d.originalTitle} — And the Takes Are Already Flying` : `${d.player ?? 'A Legend'} Just Did Something and the Internet Is Losing It`,
  (d) => d.originalTitle ? `Developing Story: ${d.originalTitle}` : `Big Moves in the World of ${d.sport ?? 'Sports'}`,
  // Beer-themed (3)
  (d) => d.originalTitle ? `${d.originalTitle} — Pour One Out` : `${d.event ?? 'Breaking News'} — This One's a Doozy`,
  (d) => d.originalTitle ? `Hold My Beer: ${d.originalTitle}` : `Breaking News Best Served Cold`,
  (d) => d.originalTitle ? `Cheers to This: ${d.originalTitle}` : `Grab a Seat — ${d.sport ?? 'Sports'} News Just Dropped`,
];

// ─── Draw Headlines ─────────────────────────────────────────────────────────

const drawHeadlines: HeadlineFn[] = [
  // Non-beer (5)
  (d) => `Honors Even: ${d.winner ?? 'Team A'} and ${d.loser ?? 'Team B'} Can't Be Separated ${d.score ?? ''}`,
  (d) => `A Draw? In This Economy? ${d.winner ?? 'Both Teams'} Split the Points`,
  (d) => `Neither Side Blinks: ${d.winner ?? 'Home'} and ${d.loser ?? 'Away'} Draw ${d.score ?? ''}`,
  (d) => `Stalemate: ${d.winner ?? 'Home'} and ${d.loser ?? 'Away'} Share the Spoils ${d.score ?? ''}`,
  (d) => `Nothing Settled: ${d.winner ?? 'Both Sides'} Walk Away with a Point After ${d.score ?? ''} Draw`,
  // Beer-themed (2)
  (d) => `Nobody Wins, Everyone Drinks: ${d.winner ?? 'Team A'} and ${d.loser ?? 'Team B'} Draw ${d.score ?? ''}`,
  (d) => `${d.winner ?? 'Home'} and ${d.loser ?? 'Away'} Can't Be Separated — ${d.score ?? 'Stalemate'}. Split a Pitcher?`,
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
