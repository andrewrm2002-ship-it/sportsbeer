/**
 * In-memory progress store shared between the generate POST and SSE endpoints.
 * Each streamId maps to an array of events and a done flag.
 */

export interface ProgressEvent {
  sport: string;
  sportIcon: string;
  current: number;
  total: number;
  status: 'processing' | 'complete' | 'error';
  message?: string;
}

export interface StreamState {
  events: ProgressEvent[];
  done: boolean;
}

export const progressStore = new Map<string, StreamState>();

/** Prevents concurrent generation runs. Auto-expires after 10 minutes. */
let generationStartedAt: number | null = null;
const LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function setGenerating(v: boolean) {
  generationStartedAt = v ? Date.now() : null;
}

export function getIsGenerating(): boolean {
  if (generationStartedAt === null) return false;
  if (Date.now() - generationStartedAt > LOCK_TIMEOUT_MS) {
    generationStartedAt = null; // auto-expire
    return false;
  }
  return true;
}
