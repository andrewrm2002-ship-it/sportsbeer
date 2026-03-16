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

/** Prevents concurrent generation runs. */
export let isGenerating = false;
export function setGenerating(v: boolean) {
  isGenerating = v;
}
