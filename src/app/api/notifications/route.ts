import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
const { notifications } = schema;
import { eq, and, desc } from 'drizzle-orm';

/** GET /api/notifications - Fetch unread notifications for the current user */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** POST /api/notifications - Mark notifications as read */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body as {
      notificationIds?: string[];
      markAllRead?: boolean;
    };

    if (markAllRead) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.userId, session.user.id),
            eq(notifications.isRead, false)
          )
        );
      return NextResponse.json({ success: true });
    }

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'notificationIds array or markAllRead flag required' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read (only the user's own)
    for (const id of notificationIds) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, id),
            eq(notifications.userId, session.user.id)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/notifications - Clear all notifications for the current user */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .delete(notifications)
      .where(eq(notifications.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
