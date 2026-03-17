# Image Strategy Proposal Review

**Reviewer:** Frontend/Infra Engineer
**Date:** 2026-03-16
**Verdict:** Mostly sound, with several issues that need resolution before implementation.

---

## 1. API Free Tier Accuracy and Gotchas

### Pexels
- Rate limits stated (200 req/hr, 20K/month) are accurate as of current documentation.
- **Gotcha:** Pexels requires attribution via an `Authorization` header and the API docs state you must show a link back to Pexels and credit the photographer when images are displayed. The proposal says "no attribution required" -- this is **wrong**. Pexels license says attribution is not required for the images themselves, but the API Terms of Service require you to display a Pexels attribution link (e.g., "Photos provided by Pexels") somewhere in the UI. This is easy to miss and could result in API key revocation.
- **Gotcha:** Pexels does not allow caching images for more than 24 hours without re-verifying the URL. If you store URLs in the DB permanently, the images could 404 over time as Pexels rotates CDN paths. This directly impacts the "store source URL in DB" strategy (Option A).

### Unsplash
- 50 req/hr demo limit is correct. Production approval requires a completed application showing your app with attribution in place.
- **Gotcha:** Unsplash API guidelines require that you trigger a "download" event via their API endpoint every time an image is shown. This is a tracking requirement, not just a best practice. Failing to do this violates the API terms. The proposal mentions this ("Must trigger download endpoint per their guidelines") but the implementation plan ignores it completely. This needs an explicit step in the pipeline.
- **Gotcha:** Unsplash production approval is not guaranteed. They review your app and can reject it. Planning the fallback chain around getting production access is optimistic.

### Pixabay
- Listed in the research section (1.3) but then excluded from the recommended tier strategy. The 100 req/min limit is generous. However, Pixabay changed their license terms in late 2019 and again in 2023. Their current license has some restrictions around AI training and redistribution that should be double-checked against the current version.

### OpenAI GPT Image 1 Mini
- The $0.005/image pricing cited is for the lowest resolution (1024x1024, low quality). This is accurate.
- **Gotcha:** The latency estimate of "~5-15s per image" is realistic for DALL-E 3 but GPT Image 1 can be slower (10-30s). At 50 articles/day this is manageable, but if the pipeline runs synchronously, this adds 8-25 minutes to a pipeline run. The proposal does not address timeout handling for the OpenAI image generation call.
- **Gotcha:** OpenAI image generation returns a URL that expires after 1 hour. You must download the image and store it (Option B) -- you cannot hotlink the returned URL. The proposal's Option A (store URL in DB, hotlink) is **incompatible** with AI-generated images. This is a significant design gap.

### TheSportsDB
- The free tier key "3" is being used. The proposal correctly notes commercial use requires a Patreon tier ($3/mo). If this site is commercial or ad-supported, the current free tier usage may already violate TheSportsDB's terms.

---

## 2. next/image Integration with Next.js 15/16

The codebase is running **Next.js 16.1.6** (per package.json), not Next.js 15 as stated in the task. The `next/image` component works the same in both versions, but worth noting.

### Correct aspects:
- The `remotePatterns` configuration approach is correct for Next.js 16.
- Using `priority={true}` only for the detail page hero image is the right call.
- The `sizes` prop recommendations are sensible.

### Issues:
- **ArticleCard is a non-`'use client'` component** (no directive at top). It is imported inside `ArticleFeed` which IS a client component. When `next/image` is used inside a client component tree, it works fine. However, the article detail page (`[articleId]/page.tsx`) is a **Server Component**. Using `next/image` there is perfectly fine and actually preferred for SSR.
- The proposal suggests fixed `width` and `height` values (e.g., `width={400} height={176}`). For the card image which uses `object-cover` inside a `h-44` container, the better approach is to use `fill` prop with a positioned parent container. This avoids layout shift while matching the existing CSS. The current `<img>` uses `w-full h-full object-cover` which maps to `<Image fill className="object-cover" />` with a `relative` parent -- not explicit width/height.
- The proposal does not mention adding `import Image from 'next/image'` or the required `alt` prop handling (already present via `alt={title}`), but these are minor.

---

## 3. remotePatterns Configuration

The proposed config includes:
```
images.pexels.com, images.unsplash.com, pixabay.com, cdn.pixabay.com,
upload.wikimedia.org, www.thesportsdb.com, a.espncdn.com
```

### Issues:
- **Missing hostname variants.** Pexels serves images from multiple subdomains including `images.pexels.com` but also sometimes `www.pexels.com`. Unsplash similarly uses `plus.unsplash.com` for premium content. Using a wildcard pattern like `hostname: '**.pexels.com'` would be safer.
- **ESPN CDN** uses multiple hostnames: `a.espncdn.com`, `a1.espncdn.com`, `a2.espncdn.com`, `a3.espncdn.com`, `a4.espncdn.com`, and `s.espncdn.com`. The proposal only lists `a.espncdn.com`. Use `hostname: '**.espncdn.com'` to cover them all.
- **TheSportsDB** serves images from `www.thesportsdb.com` but also `crests.football-data.org` for some badges. This would cause broken images for some teams.
- **Pixabay and Wikimedia** are listed in remotePatterns but excluded from the tier strategy. Remove them to avoid confusion, or include them if you plan to use them.
- The current `next.config.ts` is completely empty (no `images` key at all). This means currently, if any component were switched to `next/image`, all remote images would fail. The config change is a prerequisite for Phase 3 and should be done in Phase 1.

---

## 4. Fallback Hierarchy Realism and Edge Cases

The proposed chain: Pexels -> Unsplash -> AI Generation -> CSS Gradient.

### Edge cases not addressed:

1. **Rate limit exhaustion mid-pipeline.** If Pexels returns 429 after 200 requests in an hour, the pipeline needs to either (a) queue remaining articles for next run, or (b) immediately fall through to Unsplash. The proposal does not describe rate limit tracking or backoff behavior.

2. **Search relevance mismatch.** Searching Pexels for "basketball court" will return the same handful of popular stock photos repeatedly. After a few days, many articles will share identical hero images. This will look worse than the gradient fallback because users will notice the repetition. The proposal should include a strategy for de-duplicating recently used images (e.g., store the Pexels photo ID and exclude it from future searches for N days).

3. **Score articles with team logos.** The ESPN fetcher currently sets `imageUrl` to the team logo for score articles. The proposal says to replace "untrusted" ESPN images but does not define what "untrusted" means programmatically. Is `a.espncdn.com` untrusted? If so, ALL ESPN images get replaced. If not, the tiny 50x50 team logos continue to be used as hero images, which looks bad.

4. **RSS fetcher images.** The RSS fetcher extracts images from feed content. Some of these are legitimate editorial photos from CBS Sports, NBC Sports, etc. The proposal does not address whether these should be kept or replaced. RSS images from reputable sources may be higher quality and more relevant than generic stock photos.

5. **OpenAI API failure.** If the OpenAI API is down or the key is invalid, Tier 3 silently fails. This is fine. But the proposal should explicitly note that `OPENAI_API_KEY` is optional and the system works without it (Tiers 1-2 + Tier 4 fallback).

6. **Concurrent pipeline runs.** If two pipeline runs happen simultaneously (e.g., manual trigger during a cron run), they could both hit API rate limits. No mutex or rate limiter is proposed.

---

## 5. Image Caching and Storage

### Option A (hotlink + next/image) problems:
- As noted above, **incompatible with AI-generated images** (OpenAI URLs expire in 1 hour).
- Pexels URLs may rotate. next/image caches optimized versions on disk (in `.next/cache/images/`), but if the source URL changes, the cache becomes stale and the new URL generates a fresh optimization pass.
- If the site is deployed to Vercel, the image optimization cache is ephemeral and resets on each deployment. Self-hosted or other platforms persist the cache longer.
- External CDN dependency means if Pexels goes down, all article images break simultaneously.

### Option B (local download) problems:
- The `/public/images/articles/` approach works but `public/` is bundled at build time in Next.js. For dynamically added images, you need to serve from a separate static directory or use a custom image loader. Actually, in Next.js, files added to `public/` after build ARE served correctly in both dev and production (they are served statically by the Node server), so this works for self-hosted deployments. On Vercel or similar platforms, you would need to use a blob store or CDN instead.
- Disk space: at 50 articles/day with ~200KB average per WebP image, that is ~10MB/day or ~3.6GB/year. Manageable but needs a cleanup strategy.

### Recommendation:
The proposal should recommend a **hybrid approach**: download and store locally for AI-generated images (mandatory), keep hotlinking for Pexels/Unsplash (acceptable per their terms). This avoids the "Option A or B" false dichotomy.

---

## 6. Performance Impact on the Content Pipeline

### Current pipeline flow:
```
fetch -> deduplicate -> rewrite (sync, template-based) -> save
```

### Proposed pipeline flow:
```
fetch -> deduplicate -> rewrite (sync) -> image resolution (async, network I/O) -> save
```

### Concerns:

1. **Pipeline duration increase.** The rewriter is currently synchronous (template-based, no API calls). Adding image fetching introduces async network I/O into the pipeline. For 50 articles:
   - Pexels search: ~50 API calls at ~200ms each = ~10 seconds (sequential) or ~2 seconds (batched 10 at a time)
   - Unsplash fallback: additional calls for failed Pexels searches
   - AI generation fallback: 10-30 seconds per image
   - Total potential addition: 15 seconds (best case, Pexels covers everything) to 25+ minutes (worst case, many AI fallbacks)

2. **The pipeline currently processes 5 sports in parallel** (see `processBatch` in `pipeline/index.ts` with batchSize 5). Each sport's image fetching shares the same Pexels API key and rate limit. 5 concurrent sports all hitting Pexels simultaneously will blow through the 200 req/hr limit in minutes.

3. **Proposal places image resolution between rewrite and save.** This is the right place architecturally, but the `saveArticlesToDb` function receives `rawArticles` and `rewrittenArticles` as separate arrays. The image URL lives on `raw.imageUrl`. If image resolution mutates `raw.imageUrl` before save, this works. But this mutation pattern is fragile -- better to pass the resolved image URL explicitly.

4. **Error isolation.** If image fetching throws for one article, it should not prevent that article from being saved (with the CSS fallback). The proposal's `getImageForArticle` returns `null` on failure, which maps to the existing null-handling in the DB save. This is correct.

### Recommendation:
Add a global rate limiter (token bucket) shared across all sport pipeline runs. Process image fetches with a concurrency limit of 3-5 regardless of how many sports are being processed in parallel. Consider making image resolution a post-save background job that updates the `imageUrl` column after the fact, so the core pipeline is not blocked.

---

## 7. Legal Concerns Missed

1. **ESPN image usage is already a risk.** The proposal acknowledges this but does not propose removing ESPN image hotlinks from existing articles. Old articles in the DB with `a.espncdn.com` URLs will continue to hotlink ESPN images indefinitely. A migration to replace or null-out these URLs should be part of Phase 4 (backfill).

2. **TheSportsDB commercial license.** If this project generates any revenue (ads, subscriptions, sponsorships), the free tier of TheSportsDB is not licensed for commercial use. This is a pre-existing issue but the proposal should flag it since it involves image rights.

3. **AI-generated images of real athletes.** The proposal correctly notes GPT Image 1 "cannot depict real players/teams accurately." But the prompt template (`"Abstract editorial illustration of [sport]..."`) could still produce images that vaguely resemble real people or trademarked logos. The prompt should explicitly include "no real people, no team logos, no trademarked elements" as a negative prompt.

4. **Right of publicity.** If stock photos from Pexels/Unsplash contain identifiable athletes, using those images in a commercial context alongside fabricated/rewritten article content could create false endorsement or misattribution issues. The search keywords (e.g., "NBA game") could return photos of identifiable players. Adding `orientation=landscape` and favoring stadium/equipment shots over people shots would reduce this risk.

5. **The site uses `dangerouslySetInnerHTML`** for article bodies. If image URLs are ever sourced from user-controllable or attacker-controllable inputs, this could be an XSS vector. Not directly related to the image proposal, but worth hardening URL validation (allow-list of domains) before storing in the DB.

---

## Summary

| Area | Rating | Key Issue |
|------|--------|-----------|
| API free tiers | Mostly accurate | Pexels attribution requirement understated; Unsplash download tracking missing |
| next/image plan | Good with fixes needed | Use `fill` prop not fixed dimensions; add remotePatterns in Phase 1 |
| remotePatterns | Incomplete | Missing hostname variants for ESPN, Pexels; includes unused domains |
| Fallback hierarchy | Reasonable but fragile | Image deduplication missing; rate limit strategy absent; Option A incompatible with Tier 3 |
| Caching/storage | Needs redesign | Hybrid approach required; Option A cannot work for AI-generated images |
| Pipeline performance | Significant concern | Could add 15s-25min to pipeline; needs rate limiter and concurrency control |
| Legal | Gaps exist | Right of publicity risk with stock photos; ESPN backfill migration needed; AI prompt needs hardening |

### Top 3 Changes Before Implementation

1. **Fix the storage strategy.** Option A does not work for AI-generated images. Design a hybrid: hotlink for stock photos, local storage for AI images. Handle this in the `getImageForArticle` return type (return `{ url, source, isLocal }` instead of bare string).

2. **Add a shared rate limiter.** The pipeline runs 5 sports concurrently. Without a rate limiter, Pexels's 200 req/hr limit will be hit within the first pipeline run. Use a simple token bucket that all image fetch calls share.

3. **Address image repetition.** Track which Pexels/Unsplash photo IDs have been used recently and exclude them. Otherwise, the top 3 results for "basketball court" will appear on every basketball article.
