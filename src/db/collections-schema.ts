import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users, bookmarks } from '../../db/schema';

/**
 * Collections and bookmark-collection join tables for saved collections feature.
 *
 * To integrate, add to your main db/schema.ts:
 *   export { collections, bookmarkCollections } from '../src/db/collections-schema';
 *
 * Then run a migration or push to create the tables.
 */
export const collections = sqliteTable('collections', {
  id: text('id')
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
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
