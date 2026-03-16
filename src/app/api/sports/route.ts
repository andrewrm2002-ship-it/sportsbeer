import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, sql, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select({
        id: schema.sports.id,
        name: schema.sports.name,
        slug: schema.sports.slug,
        icon: schema.sports.icon,
        category: schema.sports.category,
        sortOrder: schema.sports.sortOrder,
        isActive: schema.sports.isActive,
        articleCount: sql<number>`(
          SELECT COUNT(*) FROM articles
          WHERE articles.sport_id = ${schema.sports.id}
          AND articles.is_published = 1
        )`.as('article_count'),
      })
      .from(schema.sports)
      .where(eq(schema.sports.isActive, true))
      .orderBy(asc(schema.sports.sortOrder), asc(schema.sports.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch sports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports' },
      { status: 500 }
    );
  }
}
