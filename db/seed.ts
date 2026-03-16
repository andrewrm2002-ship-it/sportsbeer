import { db, sqlite } from './index';
import { sports, leagues } from './schema';

// ─── Sports Data ─────────────────────────────────────────────────────────────

const sportsData: (typeof sports.$inferInsert)[] = [
  { id: 'soccer', name: 'Soccer', slug: 'soccer', icon: '\u26BD', category: 'team', espnSlug: 'soccer/eng.1', sportsDbId: 'Soccer', sortOrder: 1 },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', icon: '\uD83C\uDFC0', category: 'team', espnSlug: 'basketball/nba', sportsDbId: 'Basketball', sortOrder: 2 },
  { id: 'american-football', name: 'American Football', slug: 'american-football', icon: '\uD83C\uDFC8', category: 'team', espnSlug: 'football/nfl', sportsDbId: 'American Football', sortOrder: 3 },
  { id: 'baseball', name: 'Baseball', slug: 'baseball', icon: '\u26BE', category: 'team', espnSlug: 'baseball/mlb', sportsDbId: 'Baseball', sortOrder: 4 },
  { id: 'ice-hockey', name: 'Ice Hockey', slug: 'ice-hockey', icon: '\uD83C\uDFD2', category: 'team', espnSlug: 'hockey/nhl', sportsDbId: 'Ice Hockey', sortOrder: 5 },
  { id: 'tennis', name: 'Tennis', slug: 'tennis', icon: '\uD83C\uDFBE', category: 'individual', espnSlug: 'tennis/atp', sportsDbId: 'Tennis', sortOrder: 6 },
  { id: 'golf', name: 'Golf', slug: 'golf', icon: '\u26F3', category: 'individual', espnSlug: 'golf/pga', sportsDbId: 'Golf', sortOrder: 7 },
  { id: 'cricket', name: 'Cricket', slug: 'cricket', icon: '\uD83C\uDFCF', category: 'team', espnSlug: 'cricket/icc', sportsDbId: 'Cricket', sortOrder: 8 },
  { id: 'rugby-union', name: 'Rugby Union', slug: 'rugby-union', icon: '\uD83C\uDFC9', category: 'team', espnSlug: 'rugby/sixnations', sportsDbId: 'Rugby', sortOrder: 9 },
  { id: 'rugby-league', name: 'Rugby League', slug: 'rugby-league', icon: '\uD83C\uDFC9', category: 'team', espnSlug: null, sportsDbId: 'Rugby League', sortOrder: 10 },
  { id: 'mma', name: 'MMA/UFC', slug: 'mma', icon: '\uD83E\uDD4A', category: 'combat', espnSlug: 'mma/ufc', sportsDbId: 'Fighting', sortOrder: 11 },
  { id: 'f1', name: 'F1 Racing', slug: 'f1', icon: '\uD83C\uDFCE\uFE0F', category: 'motor', espnSlug: 'racing/f1', sportsDbId: 'Motorsport', sortOrder: 12 },
  { id: 'volleyball', name: 'Volleyball', slug: 'volleyball', icon: '\uD83C\uDFD0', category: 'team', espnSlug: null, sportsDbId: 'Volleyball', sortOrder: 13 },
  { id: 'australian-football', name: 'Australian Football', slug: 'australian-football', icon: '\uD83C\uDFC9', category: 'team', espnSlug: 'australian-football/afl', sportsDbId: 'Australian Football', sortOrder: 14 },
  { id: 'field-hockey', name: 'Field Hockey', slug: 'field-hockey', icon: '\uD83C\uDFD1', category: 'team', espnSlug: null, sportsDbId: 'Field Hockey', sortOrder: 15 },
  { id: 'lacrosse', name: 'Lacrosse', slug: 'lacrosse', icon: '\uD83E\uDD4D', category: 'team', espnSlug: 'lacrosse/pll', sportsDbId: null, sortOrder: 16 },
  { id: 'water-polo', name: 'Water Polo', slug: 'water-polo', icon: '\uD83E\uDD3D', category: 'water', espnSlug: null, sportsDbId: null, sortOrder: 17 },
  { id: 'boxing', name: 'Boxing', slug: 'boxing', icon: '\uD83E\uDD4A', category: 'combat', espnSlug: null, sportsDbId: 'Boxing', sortOrder: 18 },
  { id: 'handball', name: 'Handball', slug: 'handball', icon: '\uD83E\uDD3E', category: 'team', espnSlug: null, sportsDbId: 'Handball', sortOrder: 19 },
  { id: 'swimming', name: 'Swimming', slug: 'swimming', icon: '\uD83C\uDFCA', category: 'individual', espnSlug: null, sportsDbId: 'Swimming', sortOrder: 20 },
  { id: 'track-and-field', name: 'Track & Field', slug: 'track-and-field', icon: '\uD83C\uDFC3', category: 'individual', espnSlug: null, sportsDbId: 'Athletics', sortOrder: 21 },
  { id: 'cycling', name: 'Cycling', slug: 'cycling', icon: '\uD83D\uDEB4', category: 'individual', espnSlug: null, sportsDbId: 'Cycling', sortOrder: 22 },
  { id: 'gymnastics', name: 'Gymnastics', slug: 'gymnastics', icon: '\uD83E\uDD38', category: 'individual', espnSlug: null, sportsDbId: 'Gymnastics', sortOrder: 23 },
  { id: 'wrestling', name: 'Wrestling', slug: 'wrestling', icon: '\uD83E\uDD3C', category: 'combat', espnSlug: null, sportsDbId: 'Wrestling', sortOrder: 24 },
  { id: 'skiing', name: 'Skiing', slug: 'skiing', icon: '\u26F7\uFE0F', category: 'individual', espnSlug: null, sportsDbId: 'Skiing', sortOrder: 25 },
  { id: 'surfing', name: 'Surfing', slug: 'surfing', icon: '\uD83C\uDFC4', category: 'individual', espnSlug: null, sportsDbId: 'Surfing', sortOrder: 26 },
  { id: 'table-tennis', name: 'Table Tennis', slug: 'table-tennis', icon: '\uD83C\uDFD3', category: 'individual', espnSlug: null, sportsDbId: 'Table Tennis', sortOrder: 27 },
  { id: 'badminton', name: 'Badminton', slug: 'badminton', icon: '\uD83C\uDFF8', category: 'individual', espnSlug: null, sportsDbId: 'Badminton', sortOrder: 28 },
  { id: 'esports', name: 'Esports', slug: 'esports', icon: '\uD83C\uDFAE', category: 'team', espnSlug: null, sportsDbId: 'ESports', sortOrder: 29 },
  { id: 'sailing', name: 'Sailing', slug: 'sailing', icon: '\u26F5', category: 'individual', espnSlug: null, sportsDbId: 'Sailing', sortOrder: 30 },
];

// ─── Leagues Data ────────────────────────────────────────────────────────────

const leaguesData: (typeof leagues.$inferInsert)[] = [
  // Soccer
  { id: 'eng-premier-league', sportId: 'soccer', name: 'English Premier League', slug: 'premier-league', espnSlug: 'eng.1', country: 'England' },
  { id: 'esp-la-liga', sportId: 'soccer', name: 'La Liga', slug: 'la-liga', espnSlug: 'esp.1', country: 'Spain' },
  { id: 'ger-bundesliga', sportId: 'soccer', name: 'Bundesliga', slug: 'bundesliga', espnSlug: 'ger.1', country: 'Germany' },
  { id: 'ita-serie-a', sportId: 'soccer', name: 'Serie A', slug: 'serie-a', espnSlug: 'ita.1', country: 'Italy' },
  { id: 'fra-ligue-1', sportId: 'soccer', name: 'Ligue 1', slug: 'ligue-1', espnSlug: 'fra.1', country: 'France' },
  { id: 'usa-mls', sportId: 'soccer', name: 'MLS', slug: 'mls', espnSlug: 'usa.1', country: 'USA' },
  { id: 'uefa-champions-league', sportId: 'soccer', name: 'UEFA Champions League', slug: 'champions-league', espnSlug: 'uefa.champions', country: null },

  // Basketball
  { id: 'nba', sportId: 'basketball', name: 'NBA', slug: 'nba', espnSlug: 'nba', country: 'USA' },
  { id: 'wnba', sportId: 'basketball', name: 'WNBA', slug: 'wnba', espnSlug: 'wnba', country: 'USA' },
  { id: 'euroleague', sportId: 'basketball', name: 'EuroLeague', slug: 'euroleague', espnSlug: null, country: null },
  { id: 'ncaa-basketball', sportId: 'basketball', name: 'NCAA Basketball', slug: 'ncaa-basketball', espnSlug: 'mens-college-basketball', country: 'USA' },

  // American Football
  { id: 'nfl', sportId: 'american-football', name: 'NFL', slug: 'nfl', espnSlug: 'nfl', country: 'USA' },
  { id: 'ncaa-football', sportId: 'american-football', name: 'NCAA Football', slug: 'ncaa-football', espnSlug: 'college-football', country: 'USA' },

  // Baseball
  { id: 'mlb', sportId: 'baseball', name: 'MLB', slug: 'mlb', espnSlug: 'mlb', country: 'USA' },
  { id: 'npb', sportId: 'baseball', name: 'NPB', slug: 'npb', espnSlug: null, country: 'Japan' },

  // Ice Hockey
  { id: 'nhl', sportId: 'ice-hockey', name: 'NHL', slug: 'nhl', espnSlug: 'nhl', country: 'USA/Canada' },
  { id: 'khl', sportId: 'ice-hockey', name: 'KHL', slug: 'khl', espnSlug: null, country: 'Russia' },

  // Tennis
  { id: 'atp-tour', sportId: 'tennis', name: 'ATP Tour', slug: 'atp', espnSlug: 'atp', country: null },
  { id: 'wta-tour', sportId: 'tennis', name: 'WTA Tour', slug: 'wta', espnSlug: 'wta', country: null },

  // Golf
  { id: 'pga-tour', sportId: 'golf', name: 'PGA Tour', slug: 'pga-tour', espnSlug: 'pga', country: 'USA' },
  { id: 'lpga-tour', sportId: 'golf', name: 'LPGA Tour', slug: 'lpga-tour', espnSlug: null, country: null },

  // Cricket
  { id: 'ipl', sportId: 'cricket', name: 'Indian Premier League', slug: 'ipl', espnSlug: 'ipl', country: 'India' },
  { id: 'bbl', sportId: 'cricket', name: 'Big Bash League', slug: 'bbl', espnSlug: null, country: 'Australia' },
  { id: 'icc-test', sportId: 'cricket', name: 'ICC Test Championship', slug: 'icc-test', espnSlug: 'icc', country: null },

  // Rugby Union
  { id: 'six-nations', sportId: 'rugby-union', name: 'Six Nations', slug: 'six-nations', espnSlug: 'sixnations', country: null },
  { id: 'rugby-championship', sportId: 'rugby-union', name: 'Rugby Championship', slug: 'rugby-championship', espnSlug: null, country: null },

  // Rugby League
  { id: 'nrl', sportId: 'rugby-league', name: 'NRL', slug: 'nrl', espnSlug: null, country: 'Australia' },
  { id: 'super-league-rl', sportId: 'rugby-league', name: 'Super League', slug: 'super-league-rl', espnSlug: null, country: 'England' },

  // MMA
  { id: 'ufc', sportId: 'mma', name: 'UFC', slug: 'ufc', espnSlug: 'ufc', country: null },
  { id: 'bellator', sportId: 'mma', name: 'Bellator', slug: 'bellator', espnSlug: null, country: null },

  // F1
  { id: 'f1-championship', sportId: 'f1', name: 'Formula 1 World Championship', slug: 'f1-championship', espnSlug: 'f1', country: null },

  // Australian Football
  { id: 'afl', sportId: 'australian-football', name: 'AFL', slug: 'afl', espnSlug: 'afl', country: 'Australia' },
];

// ─── Run Seed ────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding sports...');
  db.insert(sports).values(sportsData).onConflictDoNothing().run();
  console.log(`  Inserted ${sportsData.length} sports.`);

  console.log('Seeding leagues...');
  db.insert(leagues).values(leaguesData).onConflictDoNothing().run();
  console.log(`  Inserted ${leaguesData.length} leagues.`);

  console.log('Seed complete.');
  sqlite.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  sqlite.close();
  process.exit(1);
});
