import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../../../db';
import * as schema from '../../../../../../db/schema';
const { collections, bookmarkCollections } = schema;
import { eq, and } from 'drizzle-orm';

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/collections/[id]/articles - Add an article to a collection */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await context.params;

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .get();

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { articleId } = body as { articleId?: string };

    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json(
        { error: 'articleId is required' },
        { status: 400 }
      );
    }

    // Check if already in collection
    const existing = await db
      .select()
      .from(bookmarkCollections)
      .where(
        and(
          eq(bookmarkCollections.collectionId, collectionId),
          eq(bookmarkCollections.bookmarkArticleId, articleId)
        )
      )
      .get();

    if (existing) {
      return NextResponse.json(
        { error: 'Article already in collection' },
        { status: 409 }
      );
    }

    await db.insert(bookmarkCollections).values({
      collectionId,
      bookmarkArticleId: articleId,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Add to collection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/collections/[id]/articles - Remove an article from a collection */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await context.params;

    // Verify collection ownership
    const collection = await db
      .select()
      .from(collections)
      .where(eq(collections.id, collectionId))
      .get();

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId query param is required' },
        { status: 400 }
      );
    }

    await db
      .delete(bookmarkCollections)
      .where(
        and(
          eq(bookmarkCollections.collectionId, collectionId),
          eq(bookmarkCollections.bookmarkArticleId, articleId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from collection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
