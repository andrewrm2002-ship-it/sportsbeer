import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { timeAgo } from '@/lib/utils';
import { ShareButtons } from '@/components/articles/ShareButtons';

interface Props {
  params: Promise<{ slug: string; articleId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { articleId } = await params;

  const article = await db
    .select({ title: schema.articles.title, summary: schema.articles.summary })
    .from(schema.articles)
    .where(eq(schema.articles.id, articleId))
    .get();

  if (!article) return { title: 'Article Not Found' };

  return {
    title: `${article.title} | Brews & Box Scores`,
    description: article.summary || article.title,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug, articleId } = await params;

  // Fetch the main article with sport and league info
  const article = await db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      subtitle: schema.articles.subtitle,
      body: schema.articles.body,
      summary: schema.articles.summary,
      imageUrl: schema.articles.imageUrl,
      category: schema.articles.category,
      tags: schema.articles.tags,
      publishedAt: schema.articles.publishedAt,
      generatedAt: schema.articles.generatedAt,
      originalSourceUrl: schema.articles.originalSourceUrl,
      originalSourceName: schema.articles.originalSourceName,
      sportId: schema.articles.sportId,
      sportName: schema.sports.name,
      sportIcon: schema.sports.icon,
      sportSlug: schema.sports.slug,
      leagueName: schema.leagues.name,
    })
    .from(schema.articles)
    .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
    .leftJoin(schema.leagues, eq(schema.articles.leagueId, schema.leagues.id))
    .where(eq(schema.articles.id, articleId))
    .get();

  if (!article || article.sportSlug !== slug) {
    notFound();
  }

  const timestamp = article.publishedAt || article.generatedAt;

  // Calculate read time
  const plainText = article.body.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // Fetch related articles (same sport, different article)
  const related = await db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      subtitle: schema.articles.subtitle,
      imageUrl: schema.articles.imageUrl,
      category: schema.articles.category,
      publishedAt: schema.articles.publishedAt,
      generatedAt: schema.articles.generatedAt,
      sportIcon: schema.sports.icon,
      sportName: schema.sports.name,
      sportSlug: schema.sports.slug,
    })
    .from(schema.articles)
    .innerJoin(schema.sports, eq(schema.articles.sportId, schema.sports.id))
    .where(
      and(
        eq(schema.articles.sportId, article.sportId),
        eq(schema.articles.isPublished, true)
      )
    )
    .orderBy(desc(schema.articles.publishedAt), desc(schema.articles.generatedAt))
    .limit(5);

  const relatedArticles = related.filter((r) => r.id !== article.id).slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href={`/sports/${slug}`}
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
        {article.sportIcon} {article.sportName}
      </Link>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            {article.sportIcon} {article.sportName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/90 text-white">
            {article.category}
          </span>
          {article.leagueName && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-bg-elevated text-text-muted border border-border">
              {article.leagueName}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-text-primary">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg text-text-secondary leading-relaxed">
            {article.subtitle}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
          <time>{timeAgo(timestamp!)}</time>
              <span className="text-border">|</span>
              <span>{readTime} min read</span>
              <span className="text-border">|</span>
              <ShareButtons title={article.title} />
          {article.originalSourceName && (
            <>
              <span className="text-border">|</span>
              {article.originalSourceUrl ? (
                <a
                  href={article.originalSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  Source: {article.originalSourceName}
                </a>
              ) : (
                <span>Source: {article.originalSourceName}</span>
              )}
            </>
          )}
        </div>
      </header>

      {/* Hero Image */}
      {article.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-border">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-auto max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <article
        className="prose dark:prose-invert prose-amber max-w-none
          prose-headings:text-text-primary prose-p:text-text-secondary
          prose-a:text-accent prose-strong:text-text-primary
          prose-blockquote:border-accent/30 prose-blockquote:text-text-muted
          prose-code:text-accent prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border">
          <span className="text-xs font-medium text-text-muted">Tags:</span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-bg-elevated text-text-secondary border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="pt-8 border-t border-border space-y-4">
          <h2 className="text-xl font-bold text-text-primary">
            More {article.sportName} Stories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/sports/${related.sportSlug}/${related.id}`}
                className="group flex gap-4 p-4 rounded-xl bg-bg-card border border-border hover:border-accent/30 transition-all duration-200"
              >
                {related.imageUrl ? (
                  <img
                    src={related.imageUrl}
                    alt={related.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-bg-elevated flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl opacity-40">
                      {related.sportIcon}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
                    {related.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                    <span className="uppercase font-medium tracking-wider">
                      {related.category}
                    </span>
                    <span>
                      {timeAgo(related.publishedAt || related.generatedAt!)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
