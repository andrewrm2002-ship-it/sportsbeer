/**
 * Fallback — wraps the existing deterministic template engine.
 * Used when a writer's Claude CLI call fails.
 */

import { rewriteArticle } from '../rewriter';
import type { RawArticleData } from '../fetchers/types';
import type { WriterVariant, WriterStyle } from './types';
import { getArticleHash } from '../deduplicator';

/**
 * Rewrite an article using the existing template engine as a fallback.
 */
export function fallbackRewrite(
  raw: RawArticleData,
  style: WriterStyle,
): WriterVariant {
  const rewritten = rewriteArticle(raw);
  return {
    style,
    output: {
      title: rewritten.title,
      subtitle: rewritten.subtitle,
      body: rewritten.body,
      summary: rewritten.summary,
    },
    sourceHash: getArticleHash(raw),
    sourceTitle: raw.title,
  };
}
