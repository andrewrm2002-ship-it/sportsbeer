import { db } from '../db';
import { sports } from '../db/schema';
const all = db.select({ id: sports.id, slug: sports.slug }).from(sports).all();
for (const s of all) console.log(s.id, '|', s.slug);
