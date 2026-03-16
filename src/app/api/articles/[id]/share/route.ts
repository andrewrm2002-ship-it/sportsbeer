import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../../../db';
import * as schema from '../../../../../../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    // Verify article exists
    const article = await db
      .select({ id: schema.articles.id })
      .from(schema.articles)
      .where(eq(schema.articles.id, articleId))
      .get();

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if user is logged in (optional)
    const session = await auth();
    const sharedByUserId = session?.user?.id || null;

    const shareToken = crypto.randomBytes(16).toString('hex');
    const id = crypto.randomUUID();

    await db.insert(schema.sharedArticles).values({
      id,
      articleId,
      sharedByUserId,
      shareToken,
    });

    const shareUrl = `${new URL(request.url).origin}/api/shared/${shareToken}`;

    return NextResponse.json({ shareUrl, token: shareToken });
  } catch (error) {
    console.error('Share article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
