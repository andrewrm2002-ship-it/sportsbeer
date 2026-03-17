import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and, notInArray, desc, sql } from 'drizzle-orm';

/**
 * GET /api/recommendations - Returns popular articles from sports the user doesn't follow.
 * Requires authentication.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's followed sport IDs
    const userPrefs = await db
      .select({ sportId: schema.userSportPreferences.sportId })
      .from(schema.userSportPreferences)
      .where(eq(schema.userSportPreferences.userId, session.user.id))
      .all();

    const followedSportIds = userPrefs.map((p) => p.sportId);

    // If user follows no sports, recommend popular articles from any sport
    // If user follows all sports, return empty
    const allSports = await db
      .select({ id: schema.sports.id })
      .from(schema.sports)
      .where(eq(schema.sports.isActive, true))
      .all();

    const allSportIds = allSports.map((s) => s.id);
    const unfollowedSportIds = allSportIds.filter(
      (id) => !followedSportIds.includes(id)
    );

    if (unfollowedSportIds.length === 0 && followedSportIds.length > 0) {
      return NextResponse.json([]);
    }

    const targetSportIds =
      unfollowedSportIds.length > 0 ? unfollowedSportIds : allSportIds;

    // Get popular recent articles from unfollowed sports
    // "Popular" = most recently published, from active sports
    const articles = await db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
        subtitle: schema.articles.subtitle,
        summary: schema.articles.summary,
        imageUrl: schema.articles.imageUrl,
        category: schema.articles.category,
        publishedAt: schema.articles.publishedAt,
        generatedAt: schema.articles.generatedAt,
        sportId: schema.articles.sportId,
        sportName: schema.sports.name,
        sportIcon: schema.sports.icon,
        sportSlug: schema.sports.slug,
        bookmarkCount: sql<number>`(
          SELECT COUNT(*) FROM bookmarks
          WHERE bookmarks.article_id = ${schema.articles.id}
        )`.as('bookmark_count'),
      })
      .from(schema.articles)
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(
        and(
          eq(schema.articles.isPublished, true),
          notInArray(schema.articles.sportId, followedSportIds.length > 0 ? followedSportIds : ['__none__'])
        )
      )
      .orderBy(desc(schema.articles.publishedAt))
      .limit(6);

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
