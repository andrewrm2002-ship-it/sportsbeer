import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, sql, desc, count, countDistinct } from 'drizzle-orm';

export async function GET() {
  try {
    const [articleCount] = await db
      .select({ count: count() })
      .from(schema.articles)
      .where(eq(schema.articles.isPublished, true));

    const [sportCount] = await db
      .select({ count: countDistinct(schema.articles.sportId) })
      .from(schema.articles)
      .where(eq(schema.articles.isPublished, true));

    const [latest] = await db
      .select({ publishedAt: schema.articles.publishedAt, generatedAt: schema.articles.generatedAt })
      .from(schema.articles)
      .where(eq(schema.articles.isPublished, true))
      .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.generatedAt))
      .limit(1);

    const lastUpdated = latest
      ? (latest.publishedAt ? new Date(latest.publishedAt as unknown as number * 1000).toISOString() : new Date(latest.generatedAt as unknown as number * 1000).toISOString())
      : null;

    return NextResponse.json({
      totalArticles: articleCount?.count ?? 0,
      sportsWithArticles: sportCount?.count ?? 0,
      lastUpdated,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
