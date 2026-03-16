import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { ArticleFeed } from '@/components/articles/ArticleFeed';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const sport = await db
    .select({ name: schema.sports.name, icon: schema.sports.icon })
    .from(schema.sports)
    .where(eq(schema.sports.slug, slug))
    .get();

  if (!sport) return { title: 'Sport Not Found' };

  return {
    title: `${sport.icon} ${sport.name} | Brews & Box Scores`,
    description: `Latest ${sport.name} articles with a humorous twist`,
  };
}

export default async function SportDetailPage({ params }: Props) {
  const { slug } = await params;

  const sport = await db
    .select({
      id: schema.sports.id,
      name: schema.sports.name,
      slug: schema.sports.slug,
      icon: schema.sports.icon,
      category: schema.sports.category,
    })
    .from(schema.sports)
    .where(eq(schema.sports.slug, slug))
    .get();

  if (!sport) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/sports"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        All Sports
      </Link>

      {/* Sport Header */}
      <div className="flex items-center gap-4">
        <span className="text-5xl">{sport.icon}</span>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
            {sport.name}
          </h1>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent capitalize">
            {sport.category}
          </span>
        </div>
      </div>

      {/* Articles */}
      <ArticleFeed sportId={sport.id} />
    </div>
  );
}
