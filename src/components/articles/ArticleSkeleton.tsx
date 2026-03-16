export function ArticleSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
      {/* Image placeholder */}
      <div className="h-44 skeleton" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 skeleton rounded-md w-full" />
        <div className="h-5 skeleton rounded-md w-3/4" />

        {/* Subtitle */}
        <div className="h-4 skeleton rounded-md w-1/2" />

        {/* Summary */}
        <div className="space-y-2 mt-2">
          <div className="h-3.5 skeleton rounded-md w-full" />
          <div className="h-3.5 skeleton rounded-md w-5/6" />
        </div>

        {/* Timestamp */}
        <div className="flex justify-between mt-3">
          <div className="h-3 skeleton rounded-md w-20" />
          <div className="h-3 skeleton rounded-md w-16" />
        </div>
      </div>
    </div>
  );
}
