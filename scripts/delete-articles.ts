import { db } from '../db';
import { articles } from '../db/schema';
import { sql } from 'drizzle-orm';

const count = db.select({ count: sql<number>`count(*)` }).from(articles).get();
console.log(`Articles before: ${count?.count ?? 0}`);
db.delete(articles).run();
const after = db.select({ count: sql<number>`count(*)` }).from(articles).get();
console.log(`Articles after: ${after?.count ?? 0}`);
