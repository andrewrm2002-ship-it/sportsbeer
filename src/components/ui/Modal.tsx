'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  size = 'md',
  children,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate open/close
  useEffect(() => {
    if (open) {
      // Force a tick so the transition class applies
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
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
    };

    window.addEventListener('keydown', trap);

    // Auto-focus first focusable or the container
    const timer = setTimeout(() => {
      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        contentRef.current?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', trap);
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'w-full bg-bg-card border border-border rounded-2xl shadow-2xl transition-all duration-200',
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          sizeStyles[size],
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-border flex items-center justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border flex items-center justify-end gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
