import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Sports ──────────────────────────────────────────────────────────────────

export const sports = sqliteTable('sports', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  category: text('category', {
    enum: ['team', 'individual', 'combat', 'motor', 'water'],
  }).notNull(),
  espnSlug: text('espn_slug'),
  sportsDbId: text('sportsdb_id'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
});

// ─── Leagues ─────────────────────────────────────────────────────────────────

export const leagues = sqliteTable('leagues', {
  id: text('id').primaryKey(),
  sportId: text('sport_id')
    .notNull()
    .references(() => sports.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  espnSlug: text('espn_slug'),
  country: text('country'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

// ─── Articles ────────────────────────────────────────────────────────────────

export const articles = sqliteTable('articles', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  sportId: text('sport_id')
    .notNull()
    .references(() => sports.id, { onDelete: 'cascade' }),
  leagueId: text('league_id').references(() => leagues.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  body: text('body').notNull(),
  summary: text('summary'),
  originalSourceUrl: text('original_source_url'),
  originalSourceName: text('original_source_name'),
  sourceDataHash: text('source_data_hash'),
  imageUrl: text('image_url'),
  category: text('category', {
    enum: ['scores', 'news', 'stats', 'highlights'],
  }).notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  generatedAt: integer('generated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  isPublished: integer('is_published', { mode: 'boolean' })
    .notNull()
    .default(true),
});

// ─── User Sport Preferences ─────────────────────────────────────────────────

export const userSportPreferences = sqliteTable(
  'user_sport_preferences',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sportId: text('sport_id')
      .notNull()
      .references(() => sports.id, { onDelete: 'cascade' }),
    addedAt: integer('added_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.sportId] })]
);

// ─── Generation Logs ─────────────────────────────────────────────────────────

export const generationLogs = sqliteTable('generation_logs', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  status: text('status', {
    enum: ['running', 'completed', 'failed'],
  })
    .notNull()
    .default('running'),
  sportsProcessed: integer('sports_processed').notNull().default(0),
  articlesGenerated: integer('articles_generated').notNull().default(0),
  errors: text('errors', { mode: 'json' }).$type<string[]>(),
});

// ─── Bookmarks / Favorites ──────────────────────────────────────────────────

export const bookmarks = sqliteTable(
  'bookmarks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.articleId] })]
);

// ─── Email Alert Subscriptions ──────────────────────────────────────────────

export const emailAlerts = sqliteTable('email_alerts', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  frequency: text('frequency', {
    enum: ['daily', 'weekly', 'breaking'],
  }).notNull().default('daily'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sportIds: text('sport_ids', { mode: 'json' }).$type<string[]>(),
  lastSentAt: integer('last_sent_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Notifications ─────────────────────────────────────────────────────────

export const notifications = sqliteTable('notifications', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['new_article', 'breaking', 'system'],
  }).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  articleId: text('article_id').references(() => articles.id, {
    onDelete: 'set null',
  }),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Collections ────────────────────────────────────────────────────────────

export const collections = sqliteTable('collections', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const bookmarkCollections = sqliteTable(
  'bookmark_collections',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    bookmarkArticleId: text('bookmark_article_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.bookmarkArticleId] }),
  ]
);

// ─── Guzzlers (Arbitrage Opportunities) ────────────────────────────────────

export const guzzlers = sqliteTable('guzzlers', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  sportId: text('sport_id')
    .notNull()
    .references(() => sports.id, { onDelete: 'cascade' }),
  leagueId: text('league_id').references(() => leagues.id, {
    onDelete: 'set null',
  }),
  eventKey: text('event_key').notNull(),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  commenceTime: integer('commence_time', { mode: 'timestamp' }).notNull(),
  market: text('market').notNull().default('h2h'),
  type: text('type', {
    enum: ['arb', 'near_miss', 'value', 'mismatch'],
  })
    .notNull()
    .default('arb'),
  profitPercent: text('profit_percent').notNull(),
  isArb: integer('is_arb', { mode: 'boolean' }).notNull().default(false),
  outcomes: text('outcomes', { mode: 'json' }).$type<
    { name: string; odds: number; book: string; stakePct: number }[]
  >(),
  allBookOdds: text('all_book_odds', { mode: 'json' }).$type<
    { book: string; outcomes: { name: string; odds: number }[] }[]
  >(),
  status: text('status', {
    enum: ['active', 'expired', 'started'],
  })
    .notNull()
    .default('active'),
  detectedAt: integer('detected_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Shared Articles ────────────────────────────────────────────────────────

// ─── AI Generation Rounds ──────────────────────────────────────────────────

export const aiGenerationRounds = sqliteTable('ai_generation_rounds', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  roundNumber: integer('round_number').notNull(),
  status: text('status', {
    enum: ['running', 'completed', 'failed'],
  }).notNull().default('running'),
  storiesProcessed: integer('stories_processed').notNull().default(0),
  avgScore: integer('avg_score'),
  bestScore: integer('best_score'),
  instructionVersionId: text('instruction_version_id'),
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  errors: text('errors', { mode: 'json' }).$type<string[]>(),
});

// ─── AI Article Variants ───────────────────────────────────────────────────

export const aiArticleVariants = sqliteTable('ai_article_variants', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  roundId: text('round_id')
    .notNull()
    .references(() => aiGenerationRounds.id, { onDelete: 'cascade' }),
  sourceArticleHash: text('source_article_hash').notNull(),
  sourceTitle: text('source_title').notNull(),
  writerStyle: text('writer_style', {
    enum: ['punchy', 'storyteller', 'analyst'],
  }).notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  body: text('body').notNull(),
  summary: text('summary'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── AI Variant Scores ─────────────────────────────────────────────────────

export const aiVariantScores = sqliteTable('ai_variant_scores', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  variantId: text('variant_id')
    .notNull()
    .references(() => aiArticleVariants.id, { onDelete: 'cascade' }),
  judgeId: text('judge_id', {
    enum: ['editor', 'reader'],
  }).notNull(),
  humorQuality: integer('humor_quality').notNull(),
  factualAccuracy: integer('factual_accuracy').notNull(),
  beerIntegration: integer('beer_integration').notNull(),
  readabilityFlow: integer('readability_flow').notNull(),
  headlineQuality: integer('headline_quality').notNull(),
  overallEngagement: integer('overall_engagement').notNull(),
  totalScore: integer('total_score').notNull(),
  feedback: text('feedback'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── AI Instruction Versions ───────────────────────────────────────────────

export const aiInstructionVersions = sqliteTable('ai_instruction_versions', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  roundId: text('round_id')
    .references(() => aiGenerationRounds.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  avgScoreBefore: integer('avg_score_before'),
  avgScoreAfter: integer('avg_score_after'),
  changesSummary: text('changes_summary'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── Shared Articles ────────────────────────────────────────────────────────

export const sharedArticles = sqliteTable('shared_articles', {
  id: text('id')
    .primaryKey()
    .default(sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
  articleId: text('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  sharedByUserId: text('shared_by_user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  shareToken: text('share_token').notNull().unique(),
  viewCount: integer('view_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
