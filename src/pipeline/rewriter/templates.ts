/**
 * Humor templates for rewriting sports content in a beer-themed style.
 * Each template is a function that takes extracted data and returns a string.
 */

export interface TemplateData {
  winner?: string;
  loser?: string;
  home?: string;
  away?: string;
  homeScore?: number;
  awayScore?: number;
  score?: string;
  venue?: string;
  player?: string;
  event?: string;
  team?: string;
  league?: string;
  sport?: string;
  description?: string;
}

type TemplateFn = (data: TemplateData) => string;

// ─── Game Recap Templates ────────────────────────────────────────────────────

export const gameRecapTemplates: TemplateFn[] = [
  (d) =>
    `${d.winner ?? 'The winners'} walked into ${d.venue ?? 'the arena'} like they owned the place — and honestly, after that ${d.score ?? 'dominant'} performance, they might as well put their name on the lease.`,

  (d) =>
    `It was supposed to be competitive. ${d.loser ?? 'The losing side'} had other plans — namely, handing ${d.winner ?? 'their opponents'} the W on a silver platter with a garnish of embarrassment.`,

  (d) =>
    `If ${d.winner ?? 'the victors'} played any better, they'd need to be drug tested for having too much fun. That ${d.score ?? ''} scoreline tells you everything and nothing at the same time.`,

  (d) =>
    `Somewhere in ${d.venue ?? 'that stadium'}, a ${d.loser ?? 'losing team'} fan just ordered their third pint and it's only the post-game presser. Can you blame them? That ${d.score ?? ''} result was rough.`,

  (d) =>
    `${d.winner ?? 'The winning squad'} came out swinging like someone insulted their favorite brewery. ${d.loser ?? 'Their opponents'} never stood a chance.`,

  (d) =>
    `We've seen some lopsided affairs in our time, but ${d.winner ?? 'the victors'} treating ${d.loser ?? 'their rivals'} like a training dummy? That's a whole new level of disrespect. Beautiful, beautiful disrespect.`,

  (d) =>
    `${d.winner ?? 'The winners'} showed up with the energy of someone who just found out happy hour got extended. ${d.loser ?? 'The other guys'}? More like last call on a Tuesday energy.`,

  (d) =>
    `Let's pour one out for ${d.loser ?? 'the fallen'}. Actually, let's pour several. After what ${d.winner ?? 'their opponents'} did to them (${d.score ?? ''}), they're going to need the whole keg.`,

  (d) =>
    `This one was over before it started. ${d.winner ?? 'The victors'} came prepared, ${d.loser ?? 'the losers'} came like they forgot it was game day.`,

  (d) =>
    `In a performance that can only be described as "hold my beer and watch this," ${d.winner ?? 'the winning side'} absolutely dismantled ${d.loser ?? 'their opponents'} with a final of ${d.score ?? 'something embarrassing'}.`,

  (d) =>
    `${d.winner ?? 'The champs'} treated this game like a pub quiz they'd studied for all week. ${d.loser ?? 'The opposition'}? They showed up thinking it was trivia night at a different bar.`,

  (d) =>
    `If this game were a beer, it'd be an imperial stout — dark, heavy, and absolutely punishing for ${d.loser ?? 'the losing side'}.`,

  (d) =>
    `${d.winner ?? 'The winners'} put on a masterclass tonight. The kind of performance that makes you want to buy a round for the whole bar and tell strangers about it.`,

  (d) =>
    `We'd say ${d.loser ?? 'the losers'} put up a fight, but that would be like saying flat beer is "still technically a beverage." Technically true, entirely depressing.`,

  (d) =>
    `${d.winner ?? 'The victors'} played like they were fueled by something stronger than Gatorade — and we approve.`,
];

// ─── Score Report Templates ─────────────────────────────────────────────────

export const blowoutTemplates: TemplateFn[] = [
  (d) =>
    `${d.winner ?? 'The dominant side'} ${d.score ?? ''} ${d.loser ?? 'their victims'}. That's not a score, that's a cry for help.`,

  (d) =>
    `Stop, stop — they're already dead! ${d.winner ?? 'The winners'} put up ${d.score ?? 'an absurd number'} and showed absolutely zero mercy.`,

  (d) =>
    `This wasn't a game, it was a public demonstration of superiority. ${d.winner ?? 'Winners'} ${d.score ?? ''} ${d.loser ?? 'Losers'}. We'd call it a massacre but that feels too gentle.`,

  (d) =>
    `${d.loser ?? 'The losing team'} might want to check if their season is covered by insurance, because ${d.winner ?? 'the other side'} just totaled it.`,

  (d) =>
    `The Geneva Convention should probably have something to say about what ${d.winner ?? 'the victors'} did tonight. Final: ${d.score ?? 'absolute carnage'}.`,
];

export const closeGameTemplates: TemplateFn[] = [
  (d) =>
    `${d.winner ?? 'The victors'} edged out ${d.loser ?? 'their opponents'} ${d.score ?? ''} in a nail-biter that had us gripping our pints so hard we almost shattered the glass.`,

  (d) =>
    `If this game were any closer, you'd need a microscope and a stiff drink to tell the teams apart. ${d.winner ?? 'Winners'} barely survived with a ${d.score ?? ''} finish.`,

  (d) =>
    `That's the kind of game that takes years off your life — but adds stories to your bar tab. ${d.winner ?? 'The winners'} squeaked by ${d.score ?? ''}.`,

  (d) =>
    `One-possession game. Overtime drama. The whole nine yards. ${d.winner ?? 'The victors'} survive ${d.score ?? ''}, and every fan in attendance needs a refill.`,

  (d) =>
    `${d.winner ?? 'The winning side'} escaped with a ${d.score ?? ''} win by the skin of their teeth. Somewhere, their coach is stress-ordering a double.`,

  (d) =>
    `This game had more twists than a corkscrew. ${d.winner ?? 'Winners'} pull it out ${d.score ?? ''} in what was genuinely one of the best games of the season.`,
];

export const upsetTemplates: TemplateFn[] = [
  (d) =>
    `UPSET ALERT: ${d.winner ?? 'The underdogs'} just sent ${d.loser ?? 'the favorites'} packing with a ${d.score ?? ''} stunner. Someone check the betting lines — people just lost money.`,

  (d) =>
    `In a result absolutely nobody predicted (except that one guy at the bar who "totally called it"), ${d.winner ?? 'the underdogs'} toppled ${d.loser ?? 'the giants'} ${d.score ?? ''}.`,

  (d) =>
    `${d.loser ?? 'The favorites'} showed up expecting a stroll. ${d.winner ?? 'The underdogs'} had other ideas. Final: ${d.score ?? 'Pain.'}.`,

  (d) =>
    `You know that feeling when the craft beer you've never heard of turns out to be incredible? That's ${d.winner ?? 'the underdogs'} tonight. Nobody saw it coming.`,

  (d) =>
    `${d.winner ?? 'The winners'} just wrote themselves into the history books. ${d.loser ?? 'The presumed victors'} just wrote themselves into therapy. ${d.score ?? ''}.`,

  (d) =>
    `Alert the authorities: an upset has occurred. ${d.winner ?? 'Winners'} over ${d.loser ?? 'Losers'} ${d.score ?? ''}. Vegas is in shambles.`,
];

export const drawTemplates: TemplateFn[] = [
  (d) =>
    `${d.home ?? 'Home'} and ${d.away ?? 'Away'} couldn't separate themselves — ${d.score ?? 'a draw'}. Like splitting the last beer: nobody's truly happy.`,

  (d) =>
    `A draw. The sports equivalent of ordering a flight and liking all four beers equally. ${d.home ?? 'Both sides'} share the points after ${d.score ?? 'a stalemate'}.`,

  (d) =>
    `Neither team could find the finishing touch, ending ${d.score ?? 'all square'}. It's the sporting equivalent of lukewarm beer — technically acceptable, deeply unsatisfying.`,

  (d) =>
    `${d.home ?? 'Home'} ${d.score ?? 'ties'} ${d.away ?? 'Away'}. In the immortal words of every disappointed sports fan: "Well, at least we didn't lose."`,
];

// ─── News/Trade Templates ───────────────────────────────────────────────────

export const transferTemplates: TemplateFn[] = [
  (d) =>
    `${d.player ?? 'A key player'} is on the move! ${d.description ?? 'The deal is done.'} Time to update your fantasy roster and your list of grievances.`,

  (d) =>
    `Breaking: ${d.player ?? 'Someone important'} has been traded. ${d.team ?? 'The new team'} fans are celebrating; the old fans are ordering doubles.`,

  (d) =>
    `The trade deadline gods have spoken, and ${d.player ?? 'a star'} is switching jerseys. ${d.description ?? ''} We'll drink to that — cheers or tears, your choice.`,

  (d) =>
    `Another day, another blockbuster move. ${d.player ?? 'A big name'} heads to ${d.team ?? 'a new home'}. The bar debate about whether this was a good trade starts... now.`,
];

export const injuryTemplates: TemplateFn[] = [
  (d) =>
    `Bad news, folks: ${d.player ?? 'a key player'} is on the injured list. ${d.description ?? ''} Pour one out for fantasy owners everywhere.`,

  (d) =>
    `${d.player ?? 'A star'} down with an injury. ${d.description ?? ''} If you had them on your fantasy team, we suggest medicating with your beverage of choice.`,

  (d) =>
    `The injury bug strikes again. ${d.player ?? 'An important player'} is sidelined. ${d.description ?? ''} This calls for a sympathy round.`,

  (d) =>
    `${d.team ?? 'The team'} just lost ${d.player ?? 'a key piece'} to injury. That's the sports equivalent of dropping your freshly poured beer.`,
];

export const retirementTemplates: TemplateFn[] = [
  (d) =>
    `Raise your glasses: ${d.player ?? 'a legend'} has hung up the cleats. ${d.description ?? ''} What a career. What a ride. What a bar tab they must have accumulated.`,

  (d) =>
    `End of an era. ${d.player ?? 'A true great'} calls it a career. ${d.description ?? ''} We'll need more than one round to properly send them off.`,
];

export const suspensionTemplates: TemplateFn[] = [
  (d) =>
    `${d.player ?? 'Someone'} has been suspended. ${d.description ?? ''} On the bright side, they'll have plenty of time to explore the local brewery scene.`,

  (d) =>
    `Suspension incoming: ${d.player ?? 'a player'} is benched. ${d.description ?? ''} Maybe use the free time to reflect — preferably over a cold one.`,
];

export const generalNewsTemplates: TemplateFn[] = [
  (d) =>
    `${d.description ?? 'News just dropped in the sports world.'} We're still processing this one — might need another round to fully digest it.`,

  (d) =>
    `In today's episode of "You Can't Make This Stuff Up": ${d.description ?? 'something wild just happened in sports.'}`,

  (d) =>
    `The ${d.sport ?? 'sports'} world is buzzing about ${d.description ?? 'the latest developments'}. Grab a seat at the bar and let us walk you through it.`,

  (d) =>
    `Hot off the press and straight to your feed: ${d.description ?? 'major sports news.'} We recommend reading this one with a drink in hand.`,
];

// ─── Standings Templates ────────────────────────────────────────────────────

export const standingsTemplates: TemplateFn[] = [
  (d) =>
    `${d.team ?? 'The leaders'} sit atop the ${d.league ?? 'league'} table like a perfectly crafted IPA sits atop everyone's "try this" list. ${d.description ?? ''}`,

  (d) =>
    `The ${d.league ?? 'league'} standings are shaking up, and ${d.team ?? 'some teams'} are feeling it. ${d.description ?? ''} The playoff race is going to require a lot of beer to follow.`,

  (d) =>
    `${d.team ?? 'A rising squad'} is making a move in the standings. ${d.description ?? ''} Like a good lager, they've been building quietly and now everyone's paying attention.`,

  (d) =>
    `Standings update: ${d.description ?? 'Things are getting spicy.'} If the playoff picture were a beer list, there are way too many options and none of them are clear frontrunners.`,

  (d) =>
    `The race for the top of the ${d.league ?? 'league'} is tighter than the cap on a new bottle. ${d.description ?? ''} Buckle up and stock the fridge.`,

  (d) =>
    `Bottom of the ${d.league ?? 'table'} alert: ${d.team ?? 'some teams'} are officially in "drowning their sorrows" territory. ${d.description ?? ''}`,
];

// ─── Body Paragraph Templates ───────────────────────────────────────────────

export const bodyParagraphTemplates: TemplateFn[] = [
  (d) =>
    `The first half was a masterclass in controlled aggression by ${d.winner ?? d.home ?? 'the dominant side'}. They moved the ball with the confidence of someone who just found a twenty in their jacket pocket.`,

  (d) =>
    `${d.loser ?? d.away ?? 'The other team'} tried to mount a comeback, and we'll give them credit — it took guts. It also took several coaching timeouts and what appeared to be a motivational speech involving hand gestures we can't describe on a family-friendly platform.`,

  (d) =>
    `The stats tell one story. The box score tells another. But the look on ${d.loser ?? 'the losing team'}'s faces? That tells the whole novel, the sequel, and the inevitable Netflix adaptation.`,

  (d) =>
    `${d.winner ?? 'The victors'} controlled the tempo from start to finish. It was like watching a bartender who's been doing this for twenty years — smooth, efficient, and everyone leaves satisfied.`,

  (d) =>
    `Key moments? Where do we even start? Every time ${d.loser ?? 'the trailing side'} thought they had a foothold, ${d.winner ?? 'their opponents'} pulled the rug out like a magician at a brewery open mic.`,

  (d) =>
    `The crowd was electric. The kind of electric that makes you understand why people pay good money to watch grown adults chase a ball around. Add a few beers and honestly, is there a better way to spend an evening?`,

  (d) =>
    `Defensively, ${d.winner ?? 'the winning side'} was a fortress. We've seen banks with less security. ${d.loser ?? 'The opposition'} threw everything they had at them and got absolutely nothing in return.`,

  (d) =>
    `The coaching staff for ${d.winner ?? 'the victors'} deserves a round on the house for this game plan. Every substitution was perfect, every tactical tweak was chef's kiss.`,
];

/**
 * Select a random template from an array.
 */
export function pickTemplate<T>(templates: T[]): T {
  return templates[Math.floor(Math.random() * templates.length)]!;
}

/**
 * Select multiple unique random templates from an array.
 */
export function pickTemplates<T>(templates: T[], count: number): T[] {
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
