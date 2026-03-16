import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get 5 most recent articles, each from a different sport
    // Using a subquery approach: for each sport, get the latest article,
    // then take the top 5 overall
    const results = await db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
        sportIcon: schema.sports.icon,
        sportSlug: schema.sports.slug,
        sportName: schema.sports.name,
        category: schema.articles.category,
        publishedAt: schema.articles.publishedAt,
        generatedAt: schema.articles.generatedAt,
      })
      .from(schema.articles)
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(eq(schema.articles.isPublished, true))
      .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.generatedAt))
      .limit(50);

    // Deduplicate by sport: keep only the first (most recent) per sport
    const seen = new Set<string>();
    const trending: typeof results = [];
    for (const row of results) {
      const sportKey = row.sportSlug;
      if (!seen.has(sportKey)) {
        seen.add(sportKey);
        trending.push(row);
      }
      if (trending.length >= 5) break;
    }

    return NextResponse.json(trending);
  } catch (error) {
    console.error('Failed to fetch trending articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending articles' },
      { status: 500 }
    );
  }
}
