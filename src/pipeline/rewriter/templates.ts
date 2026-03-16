/**
 * Humor templates for rewriting sports content.
 * Rebalanced: majority are witty sports writing, minority are beer-themed.
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

export type TemplateFn = (data: TemplateData) => string;

// ─── Game Recap Templates ────────────────────────────────────────────────────

export const gameRecapTemplates: TemplateFn[] = [
  // Non-beer (10)
  (d) =>
    `${d.winner ?? 'The winners'} walked into ${d.venue ?? 'the arena'} like they owned the place — and honestly, after that ${d.score ?? 'dominant'} performance, they might as well put their name on the lease.`,
  (d) =>
    `It was supposed to be competitive. ${d.loser ?? 'The losing side'} had other plans — namely, handing ${d.winner ?? 'their opponents'} the W on a silver platter with a garnish of embarrassment.`,
  (d) =>
    `If ${d.winner ?? 'the victors'} played any better, they'd need to be drug tested for having too much fun. That ${d.score ?? ''} scoreline tells you everything and nothing at the same time.`,
  (d) =>
    `We've seen some lopsided affairs in our time, but ${d.winner ?? 'the victors'} treating ${d.loser ?? 'their rivals'} like a training dummy? That's a whole new level of disrespect. Beautiful, beautiful disrespect.`,
  (d) =>
    `This one was over before it started. ${d.winner ?? 'The victors'} came prepared, ${d.loser ?? 'the losers'} came like they forgot it was game day.`,
  (d) =>
    `${d.winner ?? 'The winners'} put on a masterclass tonight. The kind of performance that makes you want to tell strangers about it.`,
  (d) =>
    `${d.winner ?? 'The victors'} played with the composure of a team that knew exactly how this was going to end. ${d.loser ?? 'Their opponents'} did not share that confidence, evidently.`,
  (d) =>
    `${d.winner ?? 'The winning side'} controlled this game from the opening whistle to the final buzzer. ${d.loser ?? 'The opposition'} were passengers in their own stadium.`,
  (d) =>
    `If you're looking for a game where both teams showed up, this is not it. ${d.winner ?? 'The winners'} showed up. ${d.loser ?? 'The losers'} showed up late, confused, and outmatched.`,
  (d) =>
    `${d.winner ?? 'The victors'} played like a team possessed. And by "possessed," we mean every decision was correct, every pass was crisp, and every shot found its target. ${d.score ?? ''}.`,

  // Beer-themed (5)
  (d) =>
    `Somewhere in ${d.venue ?? 'that stadium'}, a ${d.loser ?? 'losing team'} fan just ordered their third pint and it's only the post-game presser. Can you blame them? That ${d.score ?? ''} result was rough.`,
  (d) =>
    `${d.winner ?? 'The winning squad'} came out swinging like someone insulted their favorite brewery. ${d.loser ?? 'Their opponents'} never stood a chance.`,
  (d) =>
    `${d.winner ?? 'The winners'} showed up with the energy of someone who just found out happy hour got extended. ${d.loser ?? 'The other guys'}? More like last call on a Tuesday energy.`,
  (d) =>
    `Let's pour one out for ${d.loser ?? 'the fallen'}. Actually, let's pour several. After what ${d.winner ?? 'their opponents'} did to them (${d.score ?? ''}), they're going to need the whole keg.`,
  (d) =>
    `In a performance that can only be described as "hold my beer and watch this," ${d.winner ?? 'the winning side'} absolutely dismantled ${d.loser ?? 'their opponents'} with a final of ${d.score ?? 'something embarrassing'}.`,
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
  (d) =>
    `${d.winner ?? 'The victors'} put on a performance so dominant it bordered on unsportsmanlike. ${d.score ?? ''} doesn't even begin to capture how one-sided this was.`,
  (d) =>
    `We're going to need a bigger highlight reel. ${d.winner ?? 'The winners'} dismantled ${d.loser ?? 'the opposition'} in a game that was over by halftime.`,
  (d) =>
    `${d.loser ?? 'The losing side'} came in with a plan. ${d.winner ?? 'The winners'} came in with a wrecking ball. Final: ${d.score ?? 'painful'}.`,
];

export const closeGameTemplates: TemplateFn[] = [
  (d) =>
    `${d.winner ?? 'The victors'} edged out ${d.loser ?? 'their opponents'} ${d.score ?? ''} in a nail-biter that had everyone on the edge of their seats.`,
  (d) =>
    `If this game were any closer, you'd need a microscope and nerves of steel to tell the teams apart. ${d.winner ?? 'Winners'} barely survived with a ${d.score ?? ''} finish.`,
  (d) =>
    `That's the kind of game that takes years off your life. ${d.winner ?? 'The winners'} squeaked by ${d.score ?? ''} in what was genuinely one of the best games of the season.`,
  (d) =>
    `One-possession game. Overtime drama. The whole nine yards. ${d.winner ?? 'The victors'} survive ${d.score ?? ''}, and every fan in attendance needs a moment to recover.`,
  (d) =>
    `${d.winner ?? 'The winning side'} escaped with a ${d.score ?? ''} win by the skin of their teeth. Somewhere, their coach is stress-eating an entire buffet.`,
  (d) =>
    `This game had more twists than a Christopher Nolan film. ${d.winner ?? 'Winners'} pull it out ${d.score ?? ''} in what was genuinely one of the best games of the season.`,
  (d) =>
    `Both teams deserve a standing ovation after that one. ${d.winner ?? 'The winners'} just barely came out on top ${d.score ?? ''}, but honestly, neither side deserved to lose.`,
  (d) =>
    `The kind of game that ages you in real time. ${d.winner ?? 'The victors'} survive ${d.score ?? ''}, and somewhere a cardiologist is seeing a spike in appointments.`,
];

export const upsetTemplates: TemplateFn[] = [
  (d) =>
    `UPSET ALERT: ${d.winner ?? 'The underdogs'} just sent ${d.loser ?? 'the favorites'} packing with a ${d.score ?? ''} stunner. Someone check the betting lines — people just lost money.`,
  (d) =>
    `In a result absolutely nobody predicted (except that one person who "totally called it"), ${d.winner ?? 'the underdogs'} toppled ${d.loser ?? 'the giants'} ${d.score ?? ''}.`,
  (d) =>
    `${d.loser ?? 'The favorites'} showed up expecting a stroll. ${d.winner ?? 'The underdogs'} had other ideas. Final: ${d.score ?? 'Pain.'}.`,
  (d) =>
    `${d.winner ?? 'The winners'} just wrote themselves into the history books. ${d.loser ?? 'The presumed victors'} just wrote themselves into therapy. ${d.score ?? ''}.`,
  (d) =>
    `Alert the authorities: an upset has occurred. ${d.winner ?? 'Winners'} over ${d.loser ?? 'Losers'} ${d.score ?? ''}. Vegas is in shambles.`,
  (d) =>
    `Check the scoreboard again. We did. It still says ${d.winner ?? 'the underdogs'} ${d.score ?? ''} ${d.loser ?? 'the favorites'}. This is real life.`,
  (d) =>
    `Predictions? Out the window. Brackets? Destroyed. ${d.winner ?? 'The underdogs'} just did what everyone said they couldn't: beat ${d.loser ?? 'the giants'}.`,
  (d) =>
    `The form guide said one thing. The scoreboard said another. ${d.winner ?? 'The underdogs'} pulled off the upset of the season against ${d.loser ?? 'the favorites'} ${d.score ?? ''}.`,
];

export const drawTemplates: TemplateFn[] = [
  (d) =>
    `${d.home ?? 'Home'} and ${d.away ?? 'Away'} couldn't separate themselves — ${d.score ?? 'a draw'}. Nobody's truly happy, but nobody's devastated either.`,
  (d) =>
    `Neither team could find the finishing touch, ending ${d.score ?? 'all square'}. Technically acceptable, deeply unsatisfying.`,
  (d) =>
    `${d.home ?? 'Home'} ${d.score ?? 'ties'} ${d.away ?? 'Away'}. In the immortal words of every disappointed sports fan: "Well, at least we didn't lose."`,
  (d) =>
    `A draw that satisfied absolutely nobody. ${d.home ?? 'Both sides'} share the points after ${d.score ?? 'a stalemate'} that will be forgotten by next week.`,
  (d) =>
    `${d.home ?? 'Home'} and ${d.away ?? 'Away'} played to a ${d.score ?? ''} draw in a game that had all the tension of a thriller and all the payoff of a cliffhanger that never resolves.`,
];

// ─── News/Trade Templates ───────────────────────────────────────────────────

export const transferTemplates: TemplateFn[] = [
  (d) =>
    `${d.player ?? 'A key player'} is on the move! ${d.description ?? 'The deal is done.'} Time to update your fantasy roster and your list of grievances.`,
  (d) =>
    `Breaking: ${d.player ?? 'Someone important'} has been traded. ${d.team ?? 'The new team'} fans are celebrating; the old fans are in mourning.`,
  (d) =>
    `Another day, another blockbuster move. ${d.player ?? 'A big name'} heads to ${d.team ?? 'a new home'}. The debate about whether this was a good trade starts... now.`,
  (d) =>
    `The trade deadline gods have spoken, and ${d.player ?? 'a star'} is switching jerseys. ${d.description ?? ''} The hot take machine is already warming up.`,
  (d) =>
    `${d.player ?? 'A marquee name'} in a new uniform. ${d.description ?? ''} Some fans are thrilled, some fans are furious, and the rest of us are just here for the drama.`,
  (d) =>
    `The rumor mill was right for once: ${d.player ?? 'a major player'} has officially moved to ${d.team ?? 'a new squad'}. ${d.description ?? ''} The ripple effects of this one will be felt for seasons.`,
];

export const injuryTemplates: TemplateFn[] = [
  (d) =>
    `Bad news, folks: ${d.player ?? 'a key player'} is on the injured list. ${d.description ?? ''} Fantasy owners everywhere just felt a disturbance in the force.`,
  (d) =>
    `${d.player ?? 'A star'} down with an injury. ${d.description ?? ''} The depth chart just got a lot more interesting.`,
  (d) =>
    `The injury bug strikes again. ${d.player ?? 'An important player'} is sidelined. ${d.description ?? ''} Next person up — the pressure is on.`,
  (d) =>
    `${d.team ?? 'The team'} just lost ${d.player ?? 'a key piece'} to injury. ${d.description ?? ''} The implications for the season could be significant.`,
  (d) =>
    `Nobody wants to see injuries, but here we are: ${d.player ?? 'a star'} is out. ${d.description ?? ''} The team's resilience is about to be tested.`,
];

export const retirementTemplates: TemplateFn[] = [
  (d) =>
    `Raise your glasses: ${d.player ?? 'a legend'} has hung up the cleats. ${d.description ?? ''} What a career. What a ride.`,
  (d) =>
    `End of an era. ${d.player ?? 'A true great'} calls it a career. ${d.description ?? ''} The kind of career that deserves a standing ovation from everyone who watched.`,
  (d) =>
    `${d.player ?? 'A legend'} is officially retired. ${d.description ?? ''} The sport won't be the same without them, and that's not hyperbole.`,
];

export const suspensionTemplates: TemplateFn[] = [
  (d) =>
    `${d.player ?? 'Someone'} has been suspended. ${d.description ?? ''} On the bright side, they'll have plenty of time to reflect on their choices.`,
  (d) =>
    `Suspension incoming: ${d.player ?? 'a player'} is benched. ${d.description ?? ''} The team will have to adjust, and the discourse will be relentless.`,
  (d) =>
    `${d.player ?? 'A player'} is watching from the sidelines — involuntarily. ${d.description ?? ''} The consequences of their actions are now official.`,
];

export const generalNewsTemplates: TemplateFn[] = [
  (d) =>
    `${d.description ?? 'News just dropped in the sports world.'} We're still processing this one — it's a lot to take in.`,
  (d) =>
    `In today's episode of "You Can't Make This Stuff Up": ${d.description ?? 'something wild just happened in sports.'}`,
  (d) =>
    `The ${d.sport ?? 'sports'} world is buzzing about ${d.description ?? 'the latest developments'}. Settle in and let us walk you through it.`,
  (d) =>
    `Hot off the press and straight to your feed: ${d.description ?? 'major sports news.'} This one's going to generate some takes.`,
  (d) =>
    `Breaking news in the world of ${d.sport ?? 'sports'}: ${d.description ?? 'a significant development just dropped.'} The reactions are already pouring in.`,
  (d) =>
    `${d.description ?? 'A major development just shook the sports world.'} If you haven't heard yet, you're about to — because everyone is talking about it.`,
];

// ─── Standings Templates ────────────────────────────────────────────────────

export const standingsTemplates: TemplateFn[] = [
  (d) =>
    `${d.team ?? 'The leaders'} sit atop the ${d.league ?? 'league'} table and they don't look like they're coming down anytime soon. ${d.description ?? ''}`,
  (d) =>
    `The ${d.league ?? 'league'} standings are shaking up, and ${d.team ?? 'some teams'} are feeling it. ${d.description ?? ''} The playoff race is going to require a lot of patience to follow.`,
  (d) =>
    `${d.team ?? 'A rising squad'} is making a move in the standings. ${d.description ?? ''} They've been building quietly and now everyone's paying attention.`,
  (d) =>
    `Standings update: ${d.description ?? 'Things are getting spicy.'} The playoff picture has way too many variables and none of them are clear frontrunners.`,
  (d) =>
    `The race for the top of the ${d.league ?? 'league'} is tighter than anyone expected. ${d.description ?? ''} Buckle up — this is going to be a wild finish.`,
  (d) =>
    `Bottom of the ${d.league ?? 'table'} alert: ${d.team ?? 'some teams'} are officially in "what went wrong" territory. ${d.description ?? ''}`,
];

// ─── Body Paragraph Templates ───────────────────────────────────────────────

export const bodyParagraphTemplates: TemplateFn[] = [
  // Non-beer (10)
  (d) =>
    `The first half was a masterclass in controlled aggression by ${d.winner ?? d.home ?? 'the dominant side'}. They moved the ball with the confidence of a team that had rehearsed every scenario.`,
  (d) =>
    `${d.loser ?? d.away ?? 'The other team'} tried to mount a comeback, and we'll give them credit — it took guts. It also took several coaching timeouts and what appeared to be a motivational speech involving hand gestures we can't describe on a family-friendly platform.`,
  (d) =>
    `The stats tell one story. The box score tells another. But the look on ${d.loser ?? 'the losing team'}'s faces? That tells the whole novel, the sequel, and the inevitable Netflix adaptation.`,
  (d) =>
    `${d.winner ?? 'The victors'} controlled the tempo from start to finish. It was like watching someone who's been doing this for twenty years — smooth, efficient, and everyone leaves satisfied.`,
  (d) =>
    `Key moments? Where do we even start? Every time ${d.loser ?? 'the trailing side'} thought they had a foothold, ${d.winner ?? 'their opponents'} pulled the rug out like a magician at a talent show.`,
  (d) =>
    `Defensively, ${d.winner ?? 'the winning side'} was a fortress. We've seen banks with less security. ${d.loser ?? 'The opposition'} threw everything they had at them and got absolutely nothing in return.`,
  (d) =>
    `The coaching staff for ${d.winner ?? 'the victors'} deserves recognition for this game plan. Every substitution was perfect, every tactical tweak was chef's kiss.`,
  (d) =>
    `The crowd was electric. The kind of electric that makes you understand why people pay good money to watch grown adults chase a ball around. Add the stakes and honestly, is there a better way to spend an evening?`,
  (d) =>
    `${d.winner ?? 'The winners'} showed the kind of composure under pressure that separates contenders from pretenders. When the moment called for calm, they delivered it with surgical precision.`,
  (d) =>
    `There was a stretch in the second half where ${d.winner ?? 'the dominant side'} scored three times in ten minutes, and the entire complexion of the game changed. ${d.loser ?? 'The opposition'} never recovered.`,

  // Beer-themed (3)
  (d) =>
    `${d.winner ?? 'The victors'} played like a bartender who's been doing this for twenty years — smooth, efficient, and with an understanding of pressure that borders on zen.`,
  (d) =>
    `The atmosphere in ${d.venue ?? 'the stadium'} was intoxicating — and we don't just mean the concession stands. Both sets of fans gave everything.`,
  (d) =>
    `If this game were a drink order, it would be something complicated that nobody expected to be this good. Layer after layer of brilliance from ${d.winner ?? 'the winning side'}.`,
];

// ─── Analysis Paragraphs (intelligent sports commentary) ─────────────────────

export const analysisParagraphs: TemplateFn[] = [
  (d) =>
    `The tactical battle here was fascinating. ${d.winner ?? 'The winning side'} adjusted their formation midway through the first half, and ${d.loser ?? 'the opposition'} never found an answer. When a team can adapt in real time like that, you know they're well-coached.`,
  (d) =>
    `What separated these two sides wasn't talent — it was discipline. ${d.winner ?? 'The victors'} stuck to their game plan when ${d.loser ?? 'the other team'} threw everything at them, and that patience paid off in the most decisive moments.`,
  (d) =>
    `The ${d.score ?? ''} scoreline might suggest a one-sided affair, but the underlying numbers tell a more nuanced story. Possession was relatively even, but ${d.winner ?? 'the winners'} were lethal in transition — converting chances at a rate their opponents simply couldn't match.`,
  (d) =>
    `This result speaks volumes about where both teams are in their respective trajectories. ${d.winner ?? 'The victors'} look like a team peaking at the right time, while ${d.loser ?? 'the losers'} have some serious questions to answer before their next fixture.`,
  (d) =>
    `If you're looking for a single stat that explains this result, look at turnovers. ${d.winner ?? 'The winning side'} forced mistakes all game long, and when you give a team of this caliber extra possessions, the outcome is inevitable.`,
  (d) =>
    `The momentum swings in this one were almost unprecedented. For about fifteen minutes, ${d.loser ?? 'the losing side'} looked like the better team. Then ${d.winner ?? 'the winners'} flipped a switch that nobody knew existed, and the rest was history.`,
  (d) =>
    `There's a reason ${d.winner ?? 'this team'} is where they are in the ${d.league ?? 'league'} standings. Games like this — where the margin is thin and the pressure is immense — are exactly where they thrive. ${d.loser ?? 'Their opponents'} learned that the hard way tonight.`,
  (d) =>
    `From an analytical perspective, the key matchup was in midfield. ${d.winner ?? 'The winners'} dominated the central areas, and once they established control there, everything else fell into place. ${d.loser ?? 'The losers'} simply couldn't compete in that zone.`,
  (d) =>
    `What makes ${d.winner ?? 'this team'} dangerous is their ability to shift gears. They played conservatively when they needed to, and when ${d.loser ?? 'the opposition'} committed forward, they punished them on the counter. It was chess, not checkers.`,
  (d) =>
    `It would be easy to pile on ${d.loser ?? 'the losing side'}, but credit needs to go to ${d.winner ?? 'the winners'}. They executed a near-perfect game plan, and when you perform at that level, most teams in the ${d.league ?? 'league'} would have lost by the same margin.`,
  (d) =>
    `The ${d.sport ?? 'game'} world loves narratives, and this one writes itself. ${d.winner ?? 'The victors'} have now won their last several matches in this kind of fashion — controlled, clinical, and increasingly confident. That's a trend worth watching.`,
  (d) =>
    `Depth was the difference-maker tonight. ${d.winner ?? 'The winning side'} brought on fresh legs that were just as effective as the starters, while ${d.loser ?? 'the opposition'} visibly faded down the stretch. Squad building matters, and this result proves it.`,
];

// ─── Context Paragraphs (set the scene, explain why the game matters) ────────

export const contextParagraphs: TemplateFn[] = [
  (d) =>
    `This matchup carried weight well beyond the final whistle. In the context of the ${d.league ?? 'league'} standings, ${d.winner ?? 'the winning side'} just put significant distance between themselves and the chasing pack, while ${d.loser ?? 'the losers'} are left wondering what might have been.`,
  (d) =>
    `Heading into this one, both teams knew the stakes. The ${d.league ?? 'league'} race is tight enough that every result matters, and ${d.winner ?? 'the winners'} delivered when the pressure was highest. That's the mark of a serious contender.`,
  (d) =>
    `Context matters here: ${d.loser ?? 'the losing side'} came into this game on a strong run of form, which makes this result even more significant. ${d.winner ?? 'The victors'} didn't just beat a team — they halted a momentum surge that had the whole ${d.league ?? 'league'} taking notice.`,
  (d) =>
    `The rivalry between these two sides adds another layer to an already compelling result. The history, the previous encounters, the off-field drama — it all fed into an atmosphere that was electric from minute one.`,
  (d) =>
    `With the playoffs approaching, this result could prove pivotal in the final standings. ${d.winner ?? 'The victors'} have given themselves breathing room, while ${d.loser ?? 'the losers'} now face a challenging run of fixtures with their confidence dented.`,
  (d) =>
    `It's worth remembering that ${d.winner ?? 'the winning team'} was dealing with several key absences tonight, which makes this result all the more impressive. The squad depth on display suggested this team is built for the long haul.`,
  (d) =>
    `For ${d.loser ?? 'the losing side'}, this represents a missed opportunity. With several rivals dropping points this weekend, a win here would have changed the landscape entirely. Instead, they leave with nothing and a lot of regrets.`,
  (d) =>
    `${d.venue ?? 'The venue'} has been a fortress for the home side this season, and today was no exception. The atmosphere pushed ${d.winner ?? 'the winners'} forward at every opportunity, and the visiting side struggled to cope with the intensity.`,
  (d) =>
    `The implications of this result will echo through the ${d.league ?? 'league'} for weeks. Not just because of the score, but because of how it happened. ${d.winner ?? 'The winning side'} sent a message that everyone else in the title race heard loud and clear.`,
  (d) =>
    `This was more than just a regular season fixture. For both teams, it was a referendum on their ambitions. ${d.winner ?? 'The victors'} passed the test emphatically. ${d.loser ?? 'The losers'} have some soul-searching ahead.`,
];

// ─── Player Focus Paragraphs ─────────────────────────────────────────────────

export const playerFocusParagraphs: TemplateFn[] = [
  (d) =>
    `${d.player ?? 'The standout performer'} was absolutely sensational today. The kind of individual performance that reminds you why this person gets paid to play a sport. Every touch, every decision, every moment — immaculate.`,
  (d) =>
    `It would be remiss not to single out ${d.player ?? 'the key player'}, who was the driving force behind this result. When the game hung in the balance, they grabbed it by the throat and refused to let go.`,
  (d) =>
    `${d.player ?? 'The star of the show'} put in a shift that will be talked about for a long time. Not just because of the end product, but because of the relentless work rate that made everything else possible.`,
  (d) =>
    `Individual brilliance made the difference today, and ${d.player ?? 'the MVP'} was the primary source. There's a reason their name trends after games like this — they simply operate on a different level.`,
  (d) =>
    `You could argue that ${d.player ?? 'the standout'} single-handedly swung this result. The stats will back that up, but even the stats can't capture the intangibles — the leadership, the intensity, the sheer desire to win.`,
  (d) =>
    `${d.player ?? 'The key performer'} showed exactly why they're considered one of the best in the ${d.league ?? 'league'}. Tonight wasn't about potential or promise — it was about delivering, and they delivered emphatically.`,
  (d) =>
    `What ${d.player ?? 'the star'} did tonight will be on every highlight package for the next week. And it should be. That level of performance deserves every second of screen time it gets.`,
  (d) =>
    `Keep an eye on ${d.player ?? 'this player'} — performances like tonight's don't come along often, and when they do, they tend to be the beginning of something special. The confidence they played with was remarkable.`,
  (d) =>
    `While the team result grabs the headline, ${d.player ?? 'the individual performance'} deserves its own spotlight. They were involved in everything positive, and when a single player's influence is that pervasive, you know you're watching something special.`,
  (d) =>
    `${d.player ?? 'The standout'} has been building toward a performance like this all season. Tonight, everything clicked — and their opponents had absolutely no answer for what was coming at them.`,
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
