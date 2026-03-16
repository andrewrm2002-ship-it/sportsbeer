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
