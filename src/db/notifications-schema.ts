import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users, articles } from '../../db/schema';

/**
 * Notifications table for in-app notification center.
 *
 * To integrate, add to your main db/schema.ts:
 *   export { notifications } from '../src/db/notifications-schema';
 *
 * Then run a migration or push to create the table.
 */
export const notifications = sqliteTable('notifications', {
  id: text('id')
    .primaryKey()
    .default(
      sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`
    ),
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
