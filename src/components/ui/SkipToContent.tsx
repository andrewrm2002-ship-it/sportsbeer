'use client';

/**
 * SkipToContent - Accessibility link that appears on focus (Tab key)
 * and allows keyboard users to skip past navigation to the main content.
 *
 * Usage: Place <SkipToContent /> as the first child inside <body> or your layout.
 * Ensure your main content area has id="main-content".
 */
export function SkipToContent({
  targetId = 'main-content',
  label = 'Skip to content',
}: {
  targetId?: string;
  label?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-bg-primary focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg focus:outline-none"
    >
      {label}
    </a>
  );
}
