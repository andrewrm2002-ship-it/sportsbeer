import { useEffect, useRef, useCallback, type RefObject } from 'react';

export type SwipeDirection = 'left' | 'right';

export interface SwipeCallbacks {
  onSwipeLeft?: (distance: number) => void;
  onSwipeRight?: (distance: number) => void;
  onSwipe?: (direction: SwipeDirection, distance: number) => void;
}

interface SwipeOptions {
  /** Minimum distance in px to trigger a swipe. Default: 50 */
  threshold?: number;
  /** Maximum time in ms for the gesture. Default: 300 */
  timeout?: number;
}

/**
 * Detects horizontal swipe gestures on touch devices.
 *
 * @param ref - Ref to the element to attach touch listeners to
 * @param callbacks - Handler functions for swipe events
 * @param options - Configuration for threshold and timeout
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
) {
  const { threshold = 50, timeout = 300 } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  // Keep callbacks in a ref so we don't re-attach listeners on every render
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const elapsed = Date.now() - start.time;

      touchStartRef.current = null;

      // Check timeout
      if (elapsed > timeout) return;

      // Ensure horizontal movement is dominant
      if (Math.abs(deltaX) < Math.abs(deltaY)) return;

      const distance = Math.abs(deltaX);

      // Check threshold
      if (distance < threshold) return;

      const direction: SwipeDirection = deltaX < 0 ? 'left' : 'right';

      callbacksRef.current.onSwipe?.(direction, distance);

      if (direction === 'left') {
        callbacksRef.current.onSwipeLeft?.(distance);
      } else {
        callbacksRef.current.onSwipeRight?.(distance);
      }
    },
    [threshold, timeout]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, handleTouchStart, handleTouchEnd]);
}
