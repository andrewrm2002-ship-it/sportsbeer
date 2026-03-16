/**
 * Sport-specific pun databases.
 * At least 10 puns per sport across 30 sports.
 * Each pun can be used as a standalone interjection or worked into a sentence.
 */

export const sportPuns: Record<string, string[]> = {
  // ─── Team Sports ────────────────────────────────────────────────────────────

  soccer: [
    'A real net-positive outcome.',
    'They kicked it up a notch — literally.',
    'They really scored with that strategy.',
    "That's what we call a goal-oriented performance.",
    'The defense was pitch perfect.',
    "They couldn't handle the pressure — it was a total corner kick to the gut.",
    "This team's got sole. Get it? Cleats? We'll see ourselves out.",
    'A header and shoulders above the competition.',
    'They passed the test with flying colors.',
    'The ref showed them the red card — and the bar showed them the door.',
    "That performance was off-sides of spectacular.",
    "They trapped the ball and the opponent's hopes in one move.",
    "Striker? Barely knew 'er. (We're sorry.)",
  ],

  basketball: [
    'Nothing but net — in every sense.',
    'A slam dunk decision by the coaching staff.',
    'Full court press on entertainment value.',
    "They bounced back — pun very much intended.",
    'That performance was above the rim of expectations.',
    "They're on a fast break to the top of the standings.",
    'Traveling violation on anyone who left early.',
    "Threw up a brick? More like a whole apartment building.",
    'Alley-oop, there it is.',
    'Their bench was deeper than a philosophical conversation at a bar.',
    "Three-point shooting like they've got GPS guidance.",
    "Airball? More like air-balled their entire season.",
    "That crossover broke ankles and spirits.",
  ],

  football: [
    'A Hail Mary that actually worked — someone check the sky.',
    'They fumbled the bag. And the ball. And the game.',
    'Touchdown and a round for the house.',
    "The defense sacked more than a bartender on New Year's.",
    'They punted on that opportunity and everyone saw it.',
    'A real gridiron grind.',
    'Fourth and beer — and they went for it.',
    'That play was a lateral move in the best possible way.',
    "The QB's arm was stronger than our coffee this morning.",
    'They blitzed through the competition like it was happy hour.',
    "Interception! Of their dignity.",
    "End zone dance worthy of a bar mitzvah.",
    "Flag on the play — for being too entertaining.",
  ],

  baseball: [
    "They knocked it out of the park — and we're not just talking about the ball.",
    'A curveball nobody saw coming.',
    'That pitcher was throwing absolute heat — like a summer day at the ballpark.',
    "Three strikes and they're out. Of excuses.",
    'A real diamond in the rough performance.',
    'They stole more bases than a moving company.',
    "Home run! And we're not just talking about leaving early.",
    'That was a swing and a miss — at relevance.',
    'The bullpen was on fire. Figuratively. Please nobody call the fire department.',
    "They batted a thousand in the entertainment department.",
    "That pitch was nastier than day-old bar peanuts.",
    "Caught looking — at the scoreboard in disbelief.",
    "They've got good chemistry in the dugout. Unlike our homebrew attempts.",
  ],

  hockey: [
    'They iced the competition.',
    'A power play performance for the ages.',
    'That hit was absolutely checking all the boxes.',
    "The goalie was a brick wall. A cold, icy brick wall.",
    'Five-hole goal — straight through the embarrassment gap.',
    'They dropped the gloves and the pretense of sportsmanship.',
    'A hat trick of bad decisions by the losing team.',
    'Puck luck was definitely on their side tonight.',
    'The penalty box was busier than a bar at last call.',
    "That slap shot had more velocity than our waiter at happy hour.",
    "They zamboni'd over the competition.",
    "Icing on the cake — and the rink.",
    "The boards saw more action than a Friday night downtown.",
  ],

  rugby: [
    'They scrummed their way to victory.',
    'A try-umphant performance.',
    'They converted the try and our skepticism.',
    "That tackle was harder than explaining rugby to Americans.",
    'A real ruck-us out there today.',
    'They kicked for touch — and touched greatness.',
    'Lineout? More like lineup at the bar after that game.',
    'The maul was mauling. We know. We tried.',
    'Drop goal and drop mic. Same energy.',
    'They played with the kind of forward momentum that would make a freight train jealous.',
    "Sin bin? More like win bin for the other team.",
    "That breakdown was messier than our last pub crawl.",
  ],

  cricket: [
    "They bowled them over. Literally and figuratively.",
    "A century of great plays in that innings.",
    "Caught behind — and behind in the match.",
    "That was a wicket way to lose.",
    "Six! Both the runs and the beers we've had watching this.",
    "LBW: Literally a Bad Weekend for the batting team.",
    "They declared — boldly, some might say. Foolishly, we would say.",
    "Maiden over? More like maiden voyage into disaster.",
    "Clean bowled and cleanly outclassed.",
    "The batting collapse was more dramatic than a soap opera.",
    "Duck! No, really — zero runs. A literal duck.",
    "They hit it for four. Beers, that is. The score was also four.",
  ],

  volleyball: [
    'They served up a masterclass.',
    "That spike was sharper than the wit at our writers' table.",
    'Set, spike, celebrate.',
    'A dig that would make an archaeologist jealous.',
    'They blocked everything — shots, points, and our ability to look away.',
    "Kill shot? More like thrill shot.",
    "The rotation was smoother than a well-poured pilsner.",
    "Ace! Like the look on the other team's face.",
    "They rallied harder than a Monday morning coffee.",
    "Net gain for the winners. Net loss for everyone else.",
    "That serve had more spin than a politician.",
    "Side out and lights out for the opposition.",
  ],

  // ─── Individual Sports ──────────────────────────────────────────────────────

  tennis: [
    "Love means nothing in tennis. And apparently neither did their opponent's serve.",
    'A smashing performance, literally.',
    'Game, set, match — and our attention.',
    "That backhand was more devastating than a Monday morning alarm.",
    'They aced the test. And the serve. And the whole match.',
    "Deuce? More like 'we're done here.'",
    'The rally was longer than a pub crawl through Dublin.',
    "They broke serve and maybe a few spirits along the way.",
    "That drop shot was softer than our feelings about sports.",
    "Match point was more tense than a shaken beer can.",
    "Net play so good it should be illegal.",
    "Fault! Both the serve and the losing team's strategy.",
  ],

  golf: [
    "They drove it home. And by 'it,' we mean the championship and the golf cart.",
    "Under par and under pressure — they still delivered.",
    'That birdie was sweeter than a cold one on the 19th hole.',
    "The back nine was wilder than a bachelor party.",
    'They putted their way to glory.',
    'A hole-in-one performance overall.',
    "That approach shot was closer than most of our relationships.",
    "In the rough? Story of their weekend.",
    "Iron will and iron clubs.",
    "They sandbagged the competition. Wait, that means something different here.",
    "Bogey? Horror movie for their scorecard.",
    "The green was their kingdom and the pin was their crown.",
  ],

  boxing: [
    "A knockout in every sense of the word.",
    "They came out swinging — unlike us, who came out drinking.",
    'That uppercut changed the trajectory of the fight and our jaws.',
    "Down for the count. We've all been there. Usually at last call.",
    'They went the distance — twelve rounds of pure entertainment.',
    "Saved by the bell — the sports kind, not the TV show.",
    "Pound for pound, the best performance we've seen this week.",
    'Corner advice: hit them harder. Groundbreaking strategy.',
    "That jab was faster than the bartender on a Friday night.",
    "TKO: Totally Knocked Out. Also our state after watching this.",
    "They rolled with the punches. Unlike their opponent.",
    "Below the belt? Only the commentary. The fight was clean.",
  ],

  mma: [
    'A ground-and-pound that pounded the competition into the mat and our memory.',
    "Submitted in the first round. We've seen longer bar tabs.",
    "That takedown was smoother than a wheat beer.",
    "They tapped out. We tapped another keg. Circle of life.",
    'A rear naked choke on the competition — figuratively, legally.',
    "Octagon of doom. Hexagon of slightly less doom. We're in the octagon.",
    "That flying knee came out of nowhere. Like our bar tab at the end of the night.",
    "They went to the judges' scorecards, and the judges chose chaos.",
    "Ground game stronger than our willpower at a buffet.",
    "KO of the year candidate. Hangover of the year: also us.",
    "The standup was electric. The grappling was magnetic. Physics.",
    "Spinning back fist? Spinning our heads trying to process that.",
  ],

  athletics: [
    "They ran away with it. Both the race and our hearts.",
    'A record-breaking performance that broke records and our expectations.',
    "They cleared the bar — the high jump bar, not the drinking kind.",
    "Threw it farther than we throw caution on a Friday.",
    'That sprint was faster than our server at happy hour.',
    "They hurdled every obstacle. Unlike us at the office.",
    "Personal best! Which is more than we can say about our lap times at the pub.",
    "The finish line has never looked so dramatic.",
    "Relay? More like replay — we want to watch it again.",
    "They vaulted into the record books.",
    "That long jump covered more distance than our Uber last Saturday.",
    "Lane one, but they ran it like it was lane VIP.",
  ],

  swimming: [
    'They made waves — literally.',
    "Dive in — the results are refreshing.",
    'That butterfly stroke was more beautiful than a sunset over a beer garden.',
    'They were in their own lane — and dominating it.',
    "Pool-side seats for an absolute showcase.",
    "That flip turn was smoother than a bartender's pour.",
    "They crushed it like a cannonball at a pool party.",
    "Backstroke? More like back-to-back victories.",
    "Touching the wall first: the only touch that matters.",
    "They were underwater for so long we checked for gills.",
    "Freestyle and carefree — must be nice.",
    "A medley of excellence from start to finish.",
  ],

  cycling: [
    "They wheeled their way to victory.",
    'A tour de force — pun absolutely intended.',
    "They pedaled harder than we pedal excuses on Monday mornings.",
    'The breakaway was more exciting than a brewery opening.',
    "In the peloton of life, they're at the front.",
    "That sprint finish was tighter than lycra on a hot day.",
    'They shifted gears and the whole race changed.',
    "Drafting? That's just smart cycling. And smart beer ordering.",
    "Uphill battle? They climbed it like a mountain goat on espresso.",
    "Chain reaction of greatness.",
    "They pumped the brakes on everyone else's hopes.",
    "Dropped from the group? More like dropped from contention.",
  ],

  // ─── Combat Sports ──────────────────────────────────────────────────────────

  wrestling: [
    "Pinned it! Both the win and our attention.",
    "They grappled their way to glory.",
    'A takedown so smooth it should come with a garnish.',
    "On the mat and on a mission.",
    "That reversal was more surprising than finding a $20 in your jeans.",
    "Heavyweight performance, featherweight effort from the opponent.",
    "They went to the mat for this win. Literally.",
    "Escape artist on the mat, champion at the buzzer.",
    "Near fall? More like near heart attack for the fans.",
    "Cradle hold tighter than we hold our beers during close games.",
    "Technical fall: technically devastating.",
  ],

  fencing: [
    "They had the point. Several, actually.",
    "En garde and en route to victory.",
    "A touche of brilliance.",
    "Their riposte was sharper than a sommelier's corkscrew.",
    "They parried everything thrown at them.",
    "Foiled again — the opponent, that is.",
    "Epee-c performance. (We're not sorry.)",
    "The right of way belonged to only one fencer tonight.",
    "That lunge covered more ground than a beer delivery truck.",
    "Sabre-rattling that actually backed it up.",
    "They fenced like poetry in motion. Violent, pointy poetry.",
  ],

  judo: [
    "Ippon! One perfect throw, one perfect moment.",
    'They threw the competition — in the best possible way.',
    "That was judone. (It's judo. They're done. We'll leave.)",
    "A grip stronger than our attachment to happy hour.",
    "They swept the legs and the tournament.",
    "Golden score drama — better than any overtime in any sport.",
    "Wazari! Halfway to perfect. All the way to exciting.",
    "The groundwork was more intricate than a craft beer recipe.",
    "Osoto gari'd right out of the competition.",
    "That newaza was smoother than a jazz bar on a Tuesday.",
    "Hajime! And just like that, it was over.",
  ],

  taekwondo: [
    'High kick, higher aspirations.',
    'A spinning hook kick that spun the outcome on its head.',
    "That head kick was more shocking than our electric bill.",
    "Round kick, knockout result.",
    "They fought with the precision of a master brewer.",
    "Ax kick? More like ask kick — as in, don't even ask what happened.",
    "Points racking up like a bar tab at an open event.",
    "They blocked and countered like a chess player with feet.",
    "That back kick came out of the blue. And it left a mark.",
    "Olympic spirit and Olympic kicks. Both 10/10.",
    "Dobok on, game face activated, medals earned.",
  ],

  karate: [
    'A kata-strophic defeat for the opponent.',
    "They earned that point with surgical precision.",
    'Wax on, win on.',
    "That kumite was more intense than a double espresso martini.",
    "Mawashi geri to the scoreboard. Beautiful.",
    "Sensei would be proud. We're proud. Everyone's proud.",
    "Osu! The only word needed after that performance.",
    "They chopped the competition down to size.",
    "Belt-level performance from a world-class competitor.",
    "That counter was faster than a bartender making change.",
    "Kiai! (That's the sound of victory and our excitement.)",
  ],

  // ─── Motor Sports ───────────────────────────────────────────────────────────

  'formula-1': [
    "They were in the fast lane — both on track and in life.",
    "Box box! Time for fresh tires and fresh jokes.",
    "That overtake was DRS-lightful.",
    "They pitted at the perfect time. Unlike our timing on bar orders.",
    'Pole position and the whole podium.',
    "Lights out and away we go — straight to a dominant victory.",
    "The pit crew was faster than our WiFi. And our bartender.",
    "That chicane was more dramatic than a reality TV finale.",
    "Dirty air? Dirty win? No, just a clean sweep.",
    "Safety car period: the only time anyone caught their breath.",
    "DRS-enabled dominance.",
    "They drove like they had somewhere to be. (The podium.)",
  ],

  nascar: [
    "They took the checkered flag and our hearts.",
    'Four hundred laps and every single one mattered.',
    "That last-lap pass was more exciting than a pit stop beer run.",
    "Left turns and right decisions all day.",
    "Drafting partners and drinking partners — both essential.",
    "They led the pack like a designated driver leads the group.",
    "Caution flag? The only caution was how fast they were going.",
    "That restrictor plate racing was tighter than a six-pack.",
    "Victory lane celebrations incoming. Pass the champagne. Or the Miller.",
    "They bumped and drafted their way to glory.",
    "Green flag, gone. Like our sobriety at a race weekend.",
  ],

  motogp: [
    "They leaned into every corner and every challenge.",
    "Knee down, throttle up, competition behind.",
    "Two-wheeled terror on the circuit today.",
    "That lean angle was more extreme than our weekend plans.",
    "Wheelie into victory? Don't mind if they do.",
    "The apex of performance. Literally — every apex was perfect.",
    "They braked later than everyone. Including common sense.",
    "Grid to glory in record time.",
    "Traction control couldn't save the competition from embarrassment.",
    "They rode like the wind. If the wind had a death wish and exceptional skill.",
    "Podium finish sweeter than a post-race beer.",
  ],

  // ─── Water Sports ───────────────────────────────────────────────────────────

  surfing: [
    "They caught the perfect wave — and the perfect score.",
    "Hanging ten and hanging tough.",
    "That barrel was more tubular than an 80s catchphrase.",
    "Wipeout? Not today. Just pure stoke.",
    "Shredding the competition like cheese on nachos.",
    "The swell was gnarly and so was their performance.",
    "They dropped in and the crowd dropped their jaws.",
    "Carving lines on waves like a calligrapher on water.",
    "Shore thing they were going to win. (We're not sorry.)",
    "That aerial was higher than our expectations. And that's saying something.",
    "Paddle out, dominate, paddle back. Simple.",
  ],

  sailing: [
    "They sailed to victory. What did you expect the pun to be?",
    "A windfall of points for the winning crew.",
    "Tacking toward triumph — one leg at a time.",
    "That was a stern performance. (The back of the boat. Also serious.)",
    "They had the wind at their backs and opponents in their wake.",
    "Smooth sailing all the way. We jinxed nothing.",
    "The crew was tighter than a sailor's knot.",
    "Starboard side of history.",
    "They navigated that course like a Friday night bar crawl — with purpose.",
    "Keelhaul the competition? Metaphorically, yes.",
    "Port and starboard domination.",
  ],

  rowing: [
    "They rowed to victory with oar-some power.",
    "In perfect sync — like a well-coordinated round of shots.",
    "Stroke rate: high. Entertainment value: higher.",
    "They pulled ahead and never looked back.",
    "Cox said row. They rowed. That's teamwork.",
    "That photo finish was closer than a crowded bar.",
    "Bow to stern domination.",
    "They caught more crabs than... no wait, they caught zero crabs. Perfect technique.",
    "The erg doesn't lie. Neither does the finish line.",
    "Eight people, one boat, one goal. Also describes our party bus.",
    "They powered through like a river of determination.",
  ],

  'water-polo': [
    "They made a splash — the good kind.",
    "Goals flowing like beer from a tap.",
    "Treading water and treading on dreams.",
    "That skip shot skipped right past the goalie's dignity.",
    "Pool domination that would make any lifeguard proud.",
    "Ejection! Not from the bar — from the pool. Different vibe.",
    "Man up defense? More like man down offense for the other team.",
    "They swam circles around the competition.",
    "Dry pass, wet result. (Goals. We mean goals.)",
    "Cap number one, ranked number one.",
    "The counterattack was faster than the chlorine burn in their eyes.",
  ],

  // ─── Other Sports ───────────────────────────────────────────────────────────

  'table-tennis': [
    "Ping, pong, and gone. That match was over fast.",
    "A smash hit in every sense.",
    "That spin was dirtier than a dive bar floor.",
    "Rally of the century! All three seconds of it.",
    "They served aces like a bartender serves drinks — consistently.",
    "Backhand winner? More like backhand finisher.",
    "The table was set for greatness.",
    "Net cord luck? They'll take it.",
    "That chop was nastier than a karate demonstration.",
    "Edge ball! The most controversial millimeter in sports.",
    "Forehand topspin that could strip paint.",
  ],

  badminton: [
    "Shuttlecock comedy — and we're trying very hard not to elaborate.",
    "They smashed it. The birdie and the competition.",
    "Net kills so cold they needed a jacket.",
    "That clear was clearer than our editorial direction.",
    "Drop shot dropped jaws.",
    "Rally for the ages — back and forth like a pub debate.",
    "Cross-court winner that crossed every expectation.",
    "Service ace — served up with style.",
    "The court was their canvas. The racket was their brush.",
    "Deceptive play worthy of a poker face.",
    "They covered the court like carpet covers a floor.",
  ],

  gymnastics: [
    "A perfect ten and a perfect performance.",
    "They stuck the landing — and our attention.",
    "That vault was more twists than a mystery novel.",
    "Floor exercise more entertaining than a floor show.",
    "Uneven bars? Their performance was anything but.",
    "The dismount was cleaner than our apartment. Which isn't saying much.",
    "Tumbling through the competition like they're made of springs.",
    "Balance beam? More like imbalance between them and everyone else.",
    "Points deduction for the judges' inability to give higher scores.",
    "That routine was more polished than a freshly cleaned pint glass.",
    "Chalk it up to talent. And actual chalk.",
  ],

  'figure-skating': [
    "Triple axel and a triple espresso — both thrilling.",
    "They glided to gold.",
    "That spin was faster than a DJ at a club.",
    "The artistry was off the charts. The scores? Also off the charts.",
    "A perfect program that left us cold — because ice rinks are cold.",
    "Quad jump? Quad-rupled our expectations.",
    "The choreography told a story. The story was 'I'm better than all of you.'",
    "Edge work sharper than a good cheddar.",
    "Throw jump that threw the competition into panic.",
    "They skated clean. Spotless. Immaculate.",
    "The crowd threw flowers. We threw our fists in celebration.",
  ],

  skiing: [
    "They slalomed through the competition.",
    "Downhill all the way — in the best possible sense.",
    "That run was steeper than our bar tabs.",
    "Powder day and power performance.",
    "They carved their name into the record books.",
    "Moguls? More like mogul — as in, they owned the mountain.",
    "Gate after gate, domination after domination.",
    "The finish line came fast. Their time came faster.",
    "Apres-ski celebrations are going to be WILD after that performance.",
    "Cross-country domination from coast to coast.",
    "Wax on, ski on, win on.",
  ],

  snowboarding: [
    "They shredded the course and our expectations.",
    "A half-pipe full of full-send energy.",
    "That 1080 was a perfect rotation — like our bar stools.",
    "Slopestyle? More like showstopper-style.",
    "They dropped in and jaws dropped with them.",
    "Board meeting — the only kind worth attending.",
    "Grab trick so stylish it belongs in a museum.",
    "The landing was buttery. Like movie theater popcorn butter.",
    "Corked rotation? We're just glad they landed it.",
    "Pow pow and how how — as in, how did they DO that?",
    "Rail slide smoother than a saxophone solo.",
  ],

  esports: [
    "GG. EZ. (It was not EZ, but the winner earned the right to say it.)",
    "They fragged the competition into respawn purgatory.",
    "Clutch play? More like clutch the trophy.",
    "That 1v5 was more improbable than our productivity on a Friday.",
    "Nerf incoming — they're too good. It's unfair.",
    "Lag? The only lag was the losers falling behind.",
    "They speedran the competition. No glitches required.",
    "Critical hit on the scoreboard and our expectations.",
    "The meta shifted and they shifted with it. Adapt or uninstall.",
    "MVP performance that would make NPCs jealous.",
    "Respawn timer on the opponent's dignity: infinity.",
  ],

  'horse-racing': [
    "And they're off! So is the lid of this beer.",
    "By a nose — the most dramatic nostril in sports.",
    "Photo finish closer than a crowded bar on Derby day.",
    "They galloped to glory like a thoroughbred to the trough.",
    "Furlong story short: they won.",
    "That horse ran like it heard there was oats at the finish.",
    "Triple Crown of entertainment value.",
    "The jockey rode a perfect race. The horse did some running too.",
    "Post position one, finished position one.",
    "They were neck and neck. Then neck. Then just neck ahead. Then won.",
    "Betting window: open. Wallets: closed after that upset.",
  ],

  handball: [
    "They threw themselves at the competition — and the ball at the goal.",
    "Seven meters of pure drama.",
    "The goalkeeper was a wall. The shooters were a wrecking ball.",
    "Fast break faster than a bar run during halftime.",
    "That spin shot spun the match on its head.",
    "They dribbled past everyone like they were traffic cones.",
    "Two-minute suspension? Two minutes of rage for the coach.",
    "Empty net goal? They earned it by earning the red card on the opponent.",
    "Wing play wider than the selection at a beer festival.",
    "Pivot performance that pivoted the entire game.",
    "Court domination from the first whistle.",
  ],

  'field-hockey': [
    "They dribbled circles around the opposition.",
    "That penalty corner was sharper than cheddar.",
    "Stick skills stickier than a bar floor at 2 AM.",
    "Green card, yellow card, doesn't matter — they still won.",
    "Reverse stick goal — because doing it normally was too mainstream.",
    "The turf was their kingdom and the ball was their scepter.",
    "They scored in the circle and celebrated in the pub.",
    "That aerial ball was loftier than our ambitions.",
    "Drag flick nastier than day-old nachos.",
    "Short corner, tall order for the defense. They failed.",
    "Regulation time? More like regulation domination time.",
  ],

  lacrosse: [
    "They cradled the ball and the victory.",
    "That rip was filthier than a frat house after game day.",
    "Ground ball! The most unglamorous yet essential hustle.",
    "Behind-the-back goal — show-off, but make it sports.",
    "The face-off specialist won more draws than an artist.",
    "Clear! Both the play and what you should do with your schedule to watch highlights.",
    "Ride and slide on defense was suffocating.",
    "That crease dive was braver than our last karaoke performance.",
    "Man down? Man up? Either way, they dominated.",
    "The goalie saved the game and our faith in athletics.",
    "D-pole domination from the long-stick middie.",
  ],
};

/**
 * Get puns for a specific sport, falling back to generic ones.
 */
export function getPunsForSport(sportId: string): string[] {
  return sportPuns[sportId] ?? genericPuns;
}

/**
 * Get a random pun for a specific sport.
 */
export function randomPun(sportId: string): string {
  const puns = getPunsForSport(sportId);
  return puns[Math.floor(Math.random() * puns.length)]!;
}

/**
 * Get N random unique puns for a sport.
 */
export function randomPuns(sportId: string, count: number): string[] {
  const puns = getPunsForSport(sportId);
  const shuffled = [...puns].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

const genericPuns: string[] = [
  'What a performance for the ages.',
  'A win that writes its own headlines.',
  "They showed up, showed out, and showed everyone who's boss.",
  "That's the kind of game that makes you glad you follow sports.",
  'Dominant from start to finish.',
  'The scoreboard tells the story.',
  'A masterclass in competitive excellence.',
  "They've raised the bar — and we've raised our glasses.",
  "Sports at its finest. We couldn't look away.",
  "A performance that pairs perfectly with whatever you're drinking.",
  "That was more fun than a brewery tour.",
  "They brought their A-game and left nothing on the table.",
];
