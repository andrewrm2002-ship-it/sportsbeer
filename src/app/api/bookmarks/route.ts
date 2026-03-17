import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await db
      .select({
        articleId: schema.bookmarks.articleId,
        bookmarkedAt: schema.bookmarks.createdAt,
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
      })
      .from(schema.bookmarks)
      .innerJoin(schema.articles, eq(schema.bookmarks.articleId, schema.articles.id))
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(eq(schema.bookmarks.userId, session.user.id))
      .orderBy(schema.bookmarks.createdAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if bookmark already exists
    const existing = await db
      .select()
      .from(schema.bookmarks)
      .where(
        and(
          eq(schema.bookmarks.userId, userId),
          eq(schema.bookmarks.articleId, articleId)
        )
      )
      .get();

    if (existing) {
      // Remove bookmark
      await db
        .delete(schema.bookmarks)
        .where(
          and(
            eq(schema.bookmarks.userId, userId),
            eq(schema.bookmarks.articleId, articleId)
          )
        );
      return NextResponse.json({ bookmarked: false });
    } else {
      // Verify article exists before inserting
      const article = await db
        .select({ id: schema.articles.id })
        .from(schema.articles)
        .where(eq(schema.articles.id, articleId))
        .get();

      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      await db.insert(schema.bookmarks).values({ userId, articleId });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
