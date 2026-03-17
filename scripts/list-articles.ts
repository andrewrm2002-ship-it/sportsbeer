import { db } from '../db';
import { articles } from '../db/schema';
const all = db.select({ title: articles.title, sportId: articles.sportId, body: articles.body }).from(articles).all();
for (const a of all) {
  console.log(`\n[${a.sportId}] ${a.title}`);
  // Strip HTML tags and show first 300 chars of body
  const text = (a.body ?? '').replace(/<[^>]+>/g, '').slice(0, 400);
  console.log(text);
  console.log('---');
}
console.log('\nTotal:', all.length, 'articles');
