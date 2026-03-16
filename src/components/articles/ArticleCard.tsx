import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface ArticleCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  sportName: string;
  sportIcon: string;
  sportSlug?: string;
  publishedAt?: Date | number | null;
  generatedAt: Date | number;
  category: string;
}

export function ArticleCard({
  id,
  title,
  subtitle,
  summary,
  imageUrl,
  sportName,
  sportIcon,
  sportSlug,
  publishedAt,
  generatedAt,
  category,
}: ArticleCardProps) {
  const timestamp = publishedAt || generatedAt;
  const href = `/sports/${sportSlug || 'all'}/${id}`;

  return (
    <Link
      href={href}
      className="group block bg-bg-card rounded-xl border border-border overflow-hidden hover:border-border-accent hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image or Gradient Placeholder */}
      <div className="relative h-44 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-elevated via-bg-card to-accent/10 flex items-center justify-center">
            <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
              {sportIcon}
            </span>
          </div>
        )}

        {/* Sport Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-primary/80 backdrop-blur-sm text-accent border border-accent/20">
            <span>{sportIcon}</span>
            {sportName}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/90 text-text-primary">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-1">
            {subtitle}
          </p>
        )}

        {summary && (
          <p className="text-sm text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {timeAgo(timestamp)}
          </span>
          <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity font-medium">
            Read more &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
