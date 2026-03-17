import type { RawArticleData } from './fetchers/types';

export const MIN_FULL_CONTENT_LENGTH = 500;
export const MIN_SCORE_CONTENT_LENGTH = 200;

function isEspnSource(article: RawArticleData): boolean {
  return article.sourceName === 'ESPN';
}

export function isStructuredEspnArticle(article: RawArticleData): boolean {
  return isEspnSource(article) && article.category === 'scores';
}

export function shouldAttemptArticleScrape(article: RawArticleData): boolean {
  if (!article.sourceUrl) return false;
  if (isEspnSource(article)) return false;

  const minLength = article.category === 'scores'
    ? MIN_SCORE_CONTENT_LENGTH
    : MIN_FULL_CONTENT_LENGTH;

  return !article.fullContent || article.fullContent.length < minLength;
}

export function hasSufficientFullContent(article: RawArticleData): boolean {
  if (!article.fullContent) return false;
  if (article.category === 'scores') {
    return article.fullContent.length >= MIN_SCORE_CONTENT_LENGTH;
  }
  return article.fullContent.length >= MIN_FULL_CONTENT_LENGTH;
}

export function isEligibleForAiGeneration(article: RawArticleData): boolean {
  if (isEspnSource(article) && article.category !== 'scores') {
    return false;
  }

  return hasSufficientFullContent(article);
}
