import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  if (!pages.includes(total)) {
    pages.push(total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  const buttonBase =
    'inline-flex items-center justify-center h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-colors duration-200';

  return (
    <div
      className={cn('flex flex-col sm:flex-row items-center justify-between gap-3', className)}
    >
      <span className="text-xs text-text-muted">
        {startItem}&ndash;{endItem} of {totalItems}
      </span>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            buttonBase,
            'text-text-secondary hover:text-accent hover:bg-accent-muted',
            currentPage <= 1 && 'opacity-40 cursor-not-allowed pointer-events-none',
          )}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-text-muted select-none">
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                buttonBase,
                page === currentPage
                  ? 'bg-accent text-bg-primary'
                  : 'text-text-secondary hover:text-accent hover:bg-accent-muted',
              )}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            buttonBase,
            'text-text-secondary hover:text-accent hover:bg-accent-muted',
            currentPage >= totalPages && 'opacity-40 cursor-not-allowed pointer-events-none',
          )}
          aria-label="Next page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
