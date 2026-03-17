import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { scanForGuzzlers } from '@/pipeline/guzzler-scanner';

let isScanning = false;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isScanning) {
      return NextResponse.json(
        { error: 'A guzzler scan is already in progress. Patience, barkeep.' },
        { status: 409 },
      );
    }

    isScanning = true;

    try {
      const result = await scanForGuzzlers();
      return NextResponse.json(result);
    } finally {
      isScanning = false;
    }
  } catch (error) {
    isScanning = false;
    console.error('Guzzler scan failed:', error);
    return NextResponse.json(
      { error: 'Guzzler scan failed' },
      { status: 500 },
    );
  }
}
