/**
 * Article scraper — fetches full article text from a URL.
 * Strips HTML, extracts readable body text, respects timeouts.
 */

const SCRAPE_TIMEOUT_MS = 8000;
const MAX_CONTENT_LENGTH = 15000; // Cap content — enough for rich source material

async function fetchHtml(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SportsBeer/1.0 (news aggregator)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(SCRAPE_TIMEOUT_MS),
      redirect: 'follow',
    });
    if (!response.ok) return undefined;
    return await response.text();
  } catch {
    return undefined;
  }
}

/**
 * Fetch a URL and extract the article body text.
 * Returns undefined if the fetch fails or content is too short to be useful.
 */
export async function scrapeArticleText(url: string): Promise<string | undefined> {
  const html = await fetchHtml(url);
  if (!html) return undefined;
  return extractArticleText(html);
}

/**
 * Scrape article links from a news index page.
 * Returns absolute URLs found in the page, filtered by a path pattern.
 */
export async function scrapeArticleLinks(
  indexUrl: string,
  pathPattern: RegExp,
  limit: number = 5,
): Promise<string[]> {
  const html = await fetchHtml(indexUrl);
  if (!html) return [];

  const links: string[] = [];
  const seen = new Set<string>();
  const baseUrl = new URL(indexUrl);

  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null && links.length < limit) {
    let href = match[1]!;

    // Skip anchors, javascript, mailto, etc.
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue;

    // Make absolute
    if (href.startsWith('/')) {
      href = `${baseUrl.protocol}//${baseUrl.host}${href}`;
    } else if (!href.startsWith('http')) {
      continue;
    }

    // Filter by path pattern
    if (!pathPattern.test(href)) continue;

    // Deduplicate
    if (seen.has(href)) continue;
    seen.add(href);

    links.push(href);
  }

  return links;
}

/**
 * Extract readable article text from HTML.
 * Targets common article body selectors, then falls back to <p> tags.
 */
function extractArticleText(html: string): string | undefined {
  // Strip <style>, <script>, <noscript>, <svg>, <nav>, <footer>, <header> blocks before parsing
  html = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

  // Try to find article body content using common patterns
  // Priority: <article> tags, common article class names, then all <p> tags
  let bodyHtml = '';

  // Strategy 1: Extract from <article> tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    bodyHtml = articleMatch[1]!;
  }

  // Strategy 2: Common article body selectors via regex
  if (!bodyHtml) {
    const bodyPatterns = [
      /<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*story-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*article__body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*data-testid="article-body"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    for (const pattern of bodyPatterns) {
      const match = html.match(pattern);
      if (match) {
        bodyHtml = match[1]!;
        break;
      }
    }
  }

  // Strategy 3: Collect all <p> tags from the page
  if (!bodyHtml) {
    bodyHtml = html;
  }

  // Extract text from <p> tags
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(bodyHtml)) !== null) {
    const text = match[1]!
      .replace(/<[^>]+>/g, '') // Strip nested HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\.css-[a-z0-9]+\{[^}]*\}/g, '') // Strip leaked CSS class definitions
      .replace(/\{[^}]*(?:z-index|padding|margin|outline|background|color|border|font-|display|position|overflow)[^}]*\}/g, '') // Strip any remaining CSS blocks
      .replace(/\s+/g, ' ')
      .trim();

    // Skip very short paragraphs, CSS artifacts, and non-content
    if (text.length > 40 && !text.includes('{') && !text.startsWith('.css-')) {
      paragraphs.push(text);
    }
  }

  if (paragraphs.length < 2) return undefined;

  const fullText = paragraphs.join('\n\n').slice(0, MAX_CONTENT_LENGTH);
  return fullText.length > 150 ? fullText : undefined;
}
