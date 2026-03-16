import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'ids query parameter is required' }, { status: 400 });
    }

    const articleIds = ids.split(',').filter(Boolean);

    if (articleIds.length === 0) {
      return NextResponse.json({});
    }

    const bookmarked = await db
      .select({ articleId: schema.bookmarks.articleId })
      .from(schema.bookmarks)
      .where(
        and(
          eq(schema.bookmarks.userId, session.user.id),
          inArray(schema.bookmarks.articleId, articleIds)
        )
      );

    const result: Record<string, boolean> = {};
    for (const id of articleIds) {
      result[id] = bookmarked.some((b) => b.articleId === id);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
