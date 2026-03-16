import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import { userSportPreferences } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = await db
      .select({ sportId: userSportPreferences.sportId })
      .from(userSportPreferences)
      .where(eq(userSportPreferences.userId, session.user.id))
      .all();

    return NextResponse.json({
      sportIds: prefs.map((p) => p.sportId),
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sportIds } = body;

    if (!Array.isArray(sportIds)) {
      return NextResponse.json({ error: 'sportIds must be an array' }, { status: 400 });
    }

    const userId = session.user.id;

    // Delete existing preferences
    await db
      .delete(userSportPreferences)
      .where(eq(userSportPreferences.userId, userId));

    // Insert new preferences
    if (sportIds.length > 0) {
      await db.insert(userSportPreferences).values(
        sportIds.map((sportId: string) => ({
          userId,
          sportId,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
