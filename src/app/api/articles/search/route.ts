import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, desc, and, or, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    if (!q || q.length === 0) {
      return NextResponse.json([]);
    }

    const pattern = `%${q}%`;

    const results = await db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
        summary: schema.articles.summary,
        category: schema.articles.category,
        publishedAt: schema.articles.publishedAt,
        generatedAt: schema.articles.generatedAt,
        sportId: schema.articles.sportId,
        sportName: schema.sports.name,
        sportIcon: schema.sports.icon,
        sportSlug: schema.sports.slug,
      })
      .from(schema.articles)
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(
        and(
          eq(schema.articles.isPublished, true),
          or(
            like(schema.articles.title, pattern),
            like(schema.articles.summary, pattern),
          ),
        ),
      )
      .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.generatedAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Article search failed:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 },
    );
  }
}
