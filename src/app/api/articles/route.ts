import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, desc, inArray, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let sportId = searchParams.get('sportId');
    const sportSlug = searchParams.get('sport');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Resolve sport slug to sportId if needed
    if (!sportId && sportSlug) {
      const sport = await db
        .select({ id: schema.sports.id })
        .from(schema.sports)
        .where(eq(schema.sports.slug, sportSlug))
        .get();
      if (sport) {
        sportId = sport.id;
      }
    }

    // If user is logged in and no sportId filter, try to use their preferences
    let preferredSportIds: string[] | null = null;

    if (!sportId) {
      const session = await auth();
      if (session?.user?.id) {
        const prefs = await db
          .select({ sportId: schema.userSportPreferences.sportId })
          .from(schema.userSportPreferences)
          .where(eq(schema.userSportPreferences.userId, session.user.id));

        if (prefs.length > 0) {
          preferredSportIds = prefs.map((p) => p.sportId);
        }
      }
    }

    // Build where conditions
    const conditions = [eq(schema.articles.isPublished, true)];

    if (sportId) {
      conditions.push(eq(schema.articles.sportId, sportId));
    } else if (preferredSportIds && preferredSportIds.length > 0) {
      conditions.push(inArray(schema.articles.sportId, preferredSportIds));
    }

    if (category) {
      const validCategories = ['scores', 'news', 'stats', 'highlights'] as const;
      type ArticleCategory = (typeof validCategories)[number];
      if (validCategories.includes(category as ArticleCategory)) {
        conditions.push(eq(schema.articles.category, category as ArticleCategory));
      }
    }

    const results = await db
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
        tags: schema.articles.tags,
      })
      .from(schema.articles)
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(and(...conditions))
      .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.generatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
