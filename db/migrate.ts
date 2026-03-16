import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, sqlite } from './index';
import path from 'path';

console.log('Running migrations...');

migrate(db, { migrationsFolder: path.join(process.cwd(), 'db', 'migrations') });

console.log('Migrations complete.');

sqlite.close();
