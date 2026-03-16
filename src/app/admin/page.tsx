import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import { GenerateButton } from '@/components/admin/GenerateButton';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Total published articles
  const [totalResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.articles)
    .where(eq(schema.articles.isPublished, true));
  const totalArticles = totalResult?.count ?? 0;

  // Articles per sport
  const perSport = await db
    .select({
      sportName: schema.sports.name,
      sportIcon: schema.sports.icon,
      count: sql<number>`COUNT(${schema.articles.id})`,
    })
    .from(schema.sports)
    .leftJoin(
      schema.articles,
      sql`${schema.articles.sportId} = ${schema.sports.id} AND ${schema.articles.isPublished} = 1`
    )
    .where(eq(schema.sports.isActive, true))
    .groupBy(schema.sports.id)
    .orderBy(desc(sql`COUNT(${schema.articles.id})`));

  // Recent generation logs
  const recentLogs = await db
    .select()
    .from(schema.generationLogs)
    .orderBy(desc(schema.generationLogs.startedAt))
    .limit(10);

  const lastGeneration = recentLogs.length > 0 ? recentLogs[0] : null;

  return (
    <div className="space-y-8">
      {/* Generate Section */}
      <section className="max-w-lg">
        <h2 className="text-lg font-bold text-text-primary mb-3">
          Content Generation
        </h2>
        <GenerateButton />
      </section>

      {/* Stats Grid */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Content Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Articles */}
          <div className="p-5 rounded-xl bg-bg-card border border-border">
            <p className="text-sm font-medium text-text-muted">
              Total Articles
            </p>
            <p className="mt-1 text-3xl font-extrabold text-accent">
              {totalArticles}
            </p>
          </div>

          {/* Sports Covered */}
          <div className="p-5 rounded-xl bg-bg-card border border-border">
            <p className="text-sm font-medium text-text-muted">
              Sports Covered
            </p>
            <p className="mt-1 text-3xl font-extrabold text-accent">
              {perSport.filter((s) => s.count > 0).length}
            </p>
          </div>

          {/* Last Generation */}
          <div className="p-5 rounded-xl bg-bg-card border border-border">
            <p className="text-sm font-medium text-text-muted">
              Last Generation
            </p>
            <p className="mt-1 text-lg font-bold text-text-primary">
              {lastGeneration
                ? timeAgo(lastGeneration.startedAt)
                : 'Never'}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Per Sport */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Articles Per Sport
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {perSport.map((sport) => (
            <div
              key={sport.sportName}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg-card border border-border"
            >
              <span className="text-xl">{sport.sportIcon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {sport.sportName}
                </p>
                <p className="text-xs text-text-muted">
                  {sport.count} article{sport.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Generation Logs */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Recent Generation Logs
        </h2>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-bg-card border border-border">
            <p className="text-text-muted">
              No generation runs yet. Hit the button above to pour the first
              round!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-elevated text-text-muted text-left">
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Completed</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Sports
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Articles
                  </th>
                  <th className="px-4 py-3 font-medium">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-elevated/50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === 'completed'
                            ? 'bg-success/10 text-success'
                            : log.status === 'running'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-error/10 text-error'
                        }`}
                      >
                        {log.status === 'running' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {timeAgo(log.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {log.completedAt
                        ? timeAgo(log.completedAt)
                        : '...'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {log.sportsProcessed}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {log.articlesGenerated}
                    </td>
                    <td className="px-4 py-3 text-text-muted max-w-[200px] truncate">
                      {log.errors && log.errors.length > 0
                        ? log.errors.join(', ')
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
