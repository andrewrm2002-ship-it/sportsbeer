import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { SportsGrid } from '@/components/sports/SportsGrid';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sports | Brews & Box Scores',
  description: 'Browse all sports covered by Brews & Box Scores',
};

export default async function SportsPage() {
  const allSports = await db
    .select({
      id: schema.sports.id,
      name: schema.sports.name,
      slug: schema.sports.slug,
      icon: schema.sports.icon,
      category: schema.sports.category,
      sortOrder: schema.sports.sortOrder,
      articleCount: sql<number>`(
        SELECT COUNT(*) FROM articles
        WHERE articles.sport_id = ${schema.sports.id}
        AND articles.is_published = 1
      )`.as('article_count'),
    })
    .from(schema.sports)
    .where(eq(schema.sports.isActive, true))
    .orderBy(asc(schema.sports.sortOrder), asc(schema.sports.name));

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          Sports on Tap
        </h1>
        <p className="mt-2 text-text-secondary max-w-lg mx-auto">
          Pick your poison. Every sport gets the same irreverent treatment.
        </p>
      </div>

      {allSports.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">&#x1F3DC;&#xFE0F;</span>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Nothing on the Menu
          </h3>
          <p className="text-text-muted">
            No sports have been configured yet. Check back soon!
          </p>
        </div>
      ) : (
        <SportsGrid sports={allSports} />
      )}
    </div>
  );
}
