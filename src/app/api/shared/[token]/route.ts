import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Look up shared article by token, joining to get sport slug for redirect
    const shared = await db
      .select({
        id: schema.sharedArticles.id,
        articleId: schema.sharedArticles.articleId,
        sportSlug: schema.sports.slug,
      })
      .from(schema.sharedArticles)
      .innerJoin(
        schema.articles,
        eq(schema.sharedArticles.articleId, schema.articles.id)
      )
      .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
      .where(eq(schema.sharedArticles.shareToken, token))
      .get();

    if (!shared) {
      return NextResponse.json({ error: 'Shared link not found' }, { status: 404 });
    }

    // Increment view count
    await db
      .update(schema.sharedArticles)
      .set({ viewCount: sql`${schema.sharedArticles.viewCount} + 1` })
      .where(eq(schema.sharedArticles.id, shared.id));

    // Redirect to article page
    const origin = new URL(request.url).origin;
    const redirectUrl = `${origin}/sports/${shared.sportSlug}/${shared.articleId}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Shared article lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
