import Link from 'next/link';
import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, asc, sql } from 'drizzle-orm';

const categoryLabels: Record<string, string> = {
  team: 'Team Sports',
  individual: 'Individual Sports',
  combat: 'Combat Sports',
  motor: 'Motor Sports',
  water: 'Water Sports',
};

const categoryOrder = ['team', 'individual', 'combat', 'motor', 'water'];

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

  // Group by category
  const grouped = new Map<string, typeof allSports>();
  for (const sport of allSports) {
    const cat = sport.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(sport);
  }

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
        categoryOrder
          .filter((cat) => grouped.has(cat))
          .map((cat) => (
            <section key={cat}>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="px-3 whitespace-nowrap">
                  {categoryLabels[cat] || cat}
                </span>
                <span className="h-px flex-1 bg-border" />
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {grouped.get(cat)!.map((sport) => (
                  <Link
                    key={sport.id}
                    href={`/sports/${sport.slug}`}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl bg-bg-card border border-border hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {sport.icon}
                    </span>
                    <span className="text-sm font-semibold text-text-primary text-center">
                      {sport.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {sport.articleCount}{' '}
                      {sport.articleCount === 1 ? 'article' : 'articles'}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
