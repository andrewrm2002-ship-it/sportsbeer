import { NextResponse, NextRequest } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = searchParams.get('sportId');
    const type = searchParams.get('type');
    const arbsOnly = searchParams.get('arbsOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

    const conditions = [eq(schema.guzzlers.status, 'active')];
    if (sportId) conditions.push(eq(schema.guzzlers.sportId, sportId));
    if (arbsOnly) conditions.push(eq(schema.guzzlers.isArb, true));
    if (type && ['arb', 'near_miss', 'value', 'mismatch'].includes(type)) {
      conditions.push(eq(schema.guzzlers.type, type as 'arb' | 'near_miss' | 'value' | 'mismatch'));
    }

    const results = await db
      .select({
        id: schema.guzzlers.id,
        sportId: schema.guzzlers.sportId,
        sportName: schema.sports.name,
        sportIcon: schema.sports.icon,
        sportSlug: schema.sports.slug,
        leagueId: schema.guzzlers.leagueId,
        eventKey: schema.guzzlers.eventKey,
        homeTeam: schema.guzzlers.homeTeam,
        awayTeam: schema.guzzlers.awayTeam,
        commenceTime: schema.guzzlers.commenceTime,
        market: schema.guzzlers.market,
        type: schema.guzzlers.type,
        profitPercent: schema.guzzlers.profitPercent,
        isArb: schema.guzzlers.isArb,
        outcomes: schema.guzzlers.outcomes,
        allBookOdds: schema.guzzlers.allBookOdds,
        detectedAt: schema.guzzlers.detectedAt,
      })
      .from(schema.guzzlers)
      .innerJoin(schema.sports, eq(schema.guzzlers.sportId, schema.sports.id))
      .where(and(...conditions))
      .orderBy(desc(schema.guzzlers.isArb), desc(schema.guzzlers.profitPercent))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch guzzlers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guzzlers' },
      { status: 500 },
    );
  }
}
