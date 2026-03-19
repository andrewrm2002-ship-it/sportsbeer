import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateContent } from '@/pipeline';
import type { GenerationProgress } from '@/pipeline';
import { progressStore, getIsGenerating, setGenerating } from './progress-store';
import { auth } from '@/lib/auth';

export async function DELETE() {
  setGenerating(false);
  return NextResponse.json({ ok: true, message: 'Generation lock cleared.' });
}

export async function POST() {
  try {
    // Generation lock — prevent concurrent runs
    if (getIsGenerating()) {
      return NextResponse.json(
        { error: 'A generation is already in progress. Please wait for it to finish.' },
        { status: 409 }
      );
    }

    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create a generation log entry
    const streamId = crypto.randomUUID();
    await db
      .insert(schema.generationLogs)
      .values({ id: streamId, status: 'running' })
      .run();

    // Initialize progress store for this stream
    progressStore.set(streamId, {
      events: [],
      done: false,
    });

    // Count total active sports for progress tracking
    const activeSports = await db
      .select({ id: schema.sports.id, name: schema.sports.name, icon: schema.sports.icon })
      .from(schema.sports)
      .where(eq(schema.sports.isActive, true));

    const totalSports = activeSports.length;
    let processedCount = 0;

    // Lock generation
    setGenerating(true);

    // Run generation in the background (don't await)
    generateContent((progress: GenerationProgress) => {
      const store = progressStore.get(streamId);
      if (!store) return;

      if (progress.status === 'complete' || progress.status === 'error') {
        processedCount++;
      }

      const sportInfo = activeSports.find((s) => s.name === progress.sport);

      store.events.push({
        sport: progress.sport,
        sportIcon: sportInfo?.icon || '',
        current: processedCount,
        total: totalSports,
        status:
          progress.status === 'complete'
            ? processedCount === totalSports
              ? 'complete'
              : 'processing'
            : progress.status === 'error'
              ? 'error'
              : 'processing',
        message:
          progress.status === 'error'
            ? progress.error
            : progress.status === 'fetching'
              ? `Fetching ${progress.sport} data...`
              : progress.status === 'deduplicating'
                ? `Deduplicating ${progress.sport}...`
                : progress.status === 'rewriting'
                  ? `Rewriting ${progress.sport} articles...`
                  : progress.status === 'saving'
                    ? `Saving ${progress.sport} articles...`
                    : `${progress.sport} complete (${progress.articleCount} articles)`,
      });

      if (processedCount >= totalSports) {
        store.done = true;
      }
    }, streamId)
      .then(async (result) => {
        setGenerating(false);
        // Ensure final complete event is sent
        const store = progressStore.get(streamId);
        if (store && !store.done) {
          store.events.push({
            sport: 'All',
            sportIcon: '',
            current: totalSports,
            total: totalSports,
            status: 'complete',
            message: `Generation complete: ${result.totalArticles} articles`,
          });
          store.done = true;
        }

        // Update generation log
        try {
          await db
            .update(schema.generationLogs)
            .set({
              status: result.errors.length > 0 ? 'failed' : 'completed',
              completedAt: new Date(),
              sportsProcessed: result.sportsProcessed,
              articlesGenerated: result.totalArticles,
              errors: result.errors.length > 0 ? result.errors : null,
            })
            .where(eq(schema.generationLogs.id, streamId));
        } catch (e) {
          console.error('Failed to update generation log:', e);
        }

        // Clean up progress store after 60 seconds
        setTimeout(() => progressStore.delete(streamId), 60_000);
      })
      .catch(async (error) => {
        setGenerating(false);
        const store = progressStore.get(streamId);
        if (store) {
          store.events.push({
            sport: 'Error',
            sportIcon: '',
            current: 0,
            total: totalSports,
            status: 'error',
            message: error instanceof Error ? error.message : 'Generation failed',
          });
          store.done = true;
        }

        try {
          await db
            .update(schema.generationLogs)
            .set({
              status: 'failed',
              completedAt: new Date(),
              errors: [error instanceof Error ? error.message : String(error)],
            })
            .where(eq(schema.generationLogs.id, streamId));
        } catch {
          // Silent fail
        }

        setTimeout(() => progressStore.delete(streamId), 60_000);
      });

    return NextResponse.json({ streamId });
  } catch (error) {
    setGenerating(false); // always release lock on unexpected errors
    console.error('Failed to start generation:', error);
    return NextResponse.json(
      { error: 'Failed to start content generation' },
      { status: 500 }
    );
  }
}
