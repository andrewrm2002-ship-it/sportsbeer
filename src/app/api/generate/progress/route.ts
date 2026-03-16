import { NextRequest } from 'next/server';
import { progressStore } from '../progress-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamId = searchParams.get('streamId');

  if (!streamId) {
    return new Response(JSON.stringify({ error: 'Missing streamId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  let eventIndex = 0;
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        const store = progressStore.get(streamId);

        if (!store) {
          // Stream not found yet or already cleaned up — send a waiting event
          if (eventIndex === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ status: 'processing', sport: 'Initializing', sportIcon: '', current: 0, total: 0, message: 'Starting generation...' })}\n\n`
              )
            );
          }
          return;
        }

        // Send any new events
        while (eventIndex < store.events.length) {
          const event = store.events[eventIndex]!;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
          eventIndex++;
        }

        // Close stream when done
        if (store.done && eventIndex >= store.events.length) {
          clearInterval(interval);
          closed = true;
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }
      }, 500);

      // Safety timeout — close after 5 minutes
      setTimeout(() => {
        if (!closed) {
          clearInterval(interval);
          closed = true;
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }
      }, 300_000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
