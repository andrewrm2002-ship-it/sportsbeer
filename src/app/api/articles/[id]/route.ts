import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const article = await db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
        subtitle: schema.articles.subtitle,
        body: schema.articles.body,
        summary: schema.articles.summary,
        imageUrl: schema.articles.imageUrl,
        category: schema.articles.category,
        tags: schema.articles.tags,
        publishedAt: schema.articles.publishedAt,
        generatedAt: schema.articles.generatedAt,
        originalSourceUrl: schema.articles.originalSourceUrl,
        originalSourceName: schema.articles.originalSourceName,
        isPublished: schema.articles.isPublished,
        sportId: schema.articles.sportId,
        sportName: schema.sports.name,
        sportIcon: schema.sports.icon,
        sportSlug: schema.sports.slug,
        sportCategory: schema.sports.category,
        leagueId: schema.articles.leagueId,
        leagueName: schema.leagues.name,
        leagueSlug: schema.leagues.slug,
      })
      .from(schema.articles)
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .leftJoin(schema.leagues, eq(schema.articles.leagueId, schema.leagues.id))
      .where(eq(schema.articles.id, id))
      .get();

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
