import { useEffect, useCallback, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus within a container element while active.
 * Useful for modals and dialogs to keep keyboard navigation contained.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusable = el!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element on mount
    const firstFocusable = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (firstFocusable) {
      firstFocusable.focus();
    }

    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
}

/**
 * Enables arrow key navigation within a container of focusable elements.
 * Supports Up/Down for vertical lists and Left/Right for horizontal menus.
 * Home/End jump to first/last item.
 */
export function useArrowNavigation(
  ref: RefObject<HTMLElement | null>,
  options: {
    /** Selector for navigable items within the container. Defaults to focusable elements. */
    selector?: string;
    /** Enable horizontal (Left/Right) navigation. Default: false */
    horizontal?: boolean;
    /** Enable vertical (Up/Down) navigation. Default: true */
    vertical?: boolean;
    /** Wrap around when reaching the end. Default: true */
    wrap?: boolean;
  } = {}
) {
  const {
    selector = FOCUSABLE_SELECTOR,
    horizontal = false,
    vertical = true,
    wrap = true,
  } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = ref.current;
      if (!el) return;

      const items = Array.from(el.querySelectorAll<HTMLElement>(selector));
      if (items.length === 0) return;

      const currentIndex = items.indexOf(document.activeElement as HTMLElement);
      let nextIndex = -1;

      const isNext =
        (vertical && e.key === 'ArrowDown') ||
        (horizontal && e.key === 'ArrowRight');
      const isPrev =
        (vertical && e.key === 'ArrowUp') ||
        (horizontal && e.key === 'ArrowLeft');

      if (isNext) {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (wrap) {
          nextIndex = 0;
        }
      } else if (isPrev) {
        e.preventDefault();
        if (currentIndex > 0) {
          nextIndex = currentIndex - 1;
        } else if (wrap) {
          nextIndex = items.length - 1;
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = items.length - 1;
      }

      if (nextIndex >= 0 && nextIndex < items.length) {
        items[nextIndex].focus();
      }
    },
    [ref, selector, horizontal, vertical, wrap]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('keydown', handleKeyDown);
    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, handleKeyDown]);
}
