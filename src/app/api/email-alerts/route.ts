import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const VALID_FREQUENCIES = ['daily', 'weekly', 'breaking'] as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await db
      .select()
      .from(schema.emailAlerts)
      .where(
        and(
          eq(schema.emailAlerts.userId, session.user.id),
          eq(schema.emailAlerts.isActive, true)
        )
      );

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Get email alerts error:', error);
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
    const { email, frequency, sportIds } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    if (!frequency || !VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json(
        { error: 'frequency must be one of: daily, weekly, breaking' },
        { status: 400 }
      );
    }

    if (sportIds && !Array.isArray(sportIds)) {
      return NextResponse.json({ error: 'sportIds must be an array' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if user already has an active alert
    const existing = await db
      .select()
      .from(schema.emailAlerts)
      .where(
        and(
          eq(schema.emailAlerts.userId, userId),
          eq(schema.emailAlerts.isActive, true)
        )
      )
      .get();

    if (existing) {
      // Update existing alert
      await db
        .update(schema.emailAlerts)
        .set({
          email,
          frequency,
          sportIds: sportIds || null,
        })
        .where(eq(schema.emailAlerts.id, existing.id));

      return NextResponse.json({ success: true, updated: true });
    } else {
      // Create new alert
      const id = crypto.randomUUID();
      await db.insert(schema.emailAlerts).values({
        id,
        userId,
        email,
        frequency,
        sportIds: sportIds || null,
      });

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error) {
    console.error('Create/update email alert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .update(schema.emailAlerts)
      .set({ isActive: false })
      .where(
        and(
          eq(schema.emailAlerts.userId, session.user.id),
          eq(schema.emailAlerts.isActive, true)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deactivate email alerts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
