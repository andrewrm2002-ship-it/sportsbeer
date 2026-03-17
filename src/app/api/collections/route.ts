import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
const { collections, bookmarkCollections } = schema;
import { eq, sql } from 'drizzle-orm';

/** GET /api/collections - List user's collections with article counts */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        createdAt: collections.createdAt,
        articleCount: sql<number>`(
          SELECT COUNT(*) FROM bookmark_collections
          WHERE bookmark_collections.collection_id = ${collections.id}
        )`.as('article_count'),
      })
      .from(collections)
      .where(eq(collections.userId, session.user.id))
      .orderBy(collections.createdAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Get collections error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** POST /api/collections - Create a new collection */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body as {
      name?: string;
      description?: string;
    };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const result = await db
      .insert(collections)
      .values({
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/collections - Remove a collection */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('id');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection id is required' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
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

    // Delete association rows first (cascade should handle this, but be explicit)
    await db
      .delete(bookmarkCollections)
      .where(eq(bookmarkCollections.collectionId, collectionId));

    await db.delete(collections).where(eq(collections.id, collectionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
