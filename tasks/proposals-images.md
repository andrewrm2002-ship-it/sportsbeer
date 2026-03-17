# Image Strategy Proposal for Brews & Box Scores

**Date:** 2026-03-16
**Status:** Proposal / Research

---

## Current State Analysis

### How Images Are Used Today

The codebase already supports images throughout the UI via an `imageUrl` field:

- **DB Schema** (`db/schema.ts`): `articles` table has `imageUrl: text('image_url')` — nullable text column
- **RawArticleData type** (`src/pipeline/fetchers/types.ts`): `imageUrl?: string` — optional on raw fetched data
- **Pipeline** (`src/pipeline/index.ts`): saves `raw.imageUrl ?? null` directly to the DB
- **ArticleCard** (`src/components/articles/ArticleCard.tsx`): renders `<img>` if imageUrl exists, otherwise shows a gradient placeholder with the sport emoji icon
- **ArticleFeed** (`src/components/articles/ArticleFeed.tsx`): hero card uses same pattern — image or gradient+emoji fallback
- **Article detail page** (`src/app/sports/[slug]/[articleId]/page.tsx`): full-width hero image if available; related articles show 80x80 thumbnails or emoji fallback

### Current Image Sources

1. **ESPN fetcher**: Score articles use `home.team.logo ?? away.team.logo` (team logos from ESPN CDN). News articles use `article.images?.[0]?.url` (editorial photos from ESPN).
2. **TheSportsDB fetcher**: Uses `event.strThumb` (event thumbnail images).
3. **RSS fetcher**: Extracts images from enclosures, media:content, media:thumbnail, or inline `<img>` tags in content HTML.

### Problems with Current Approach

- **ESPN images are hotlinked from ESPN CDN** — unofficial API, no guarantee of stability, potential TOS violations for commercial use
- **Many articles have no image at all** — the gradient fallback is functional but visually bland
- **No image optimization** — raw `<img>` tags instead of `next/image`, no lazy loading, no responsive sizing, no WebP
- **No caching or storage** — every page load re-fetches from the source CDN
- **Team logos (ESPN)** used for score articles are tiny badge-sized images, not proper article hero images

---

## 1. Legal Image Sources — Detailed Research

### 1.1 Unsplash API

| Field | Details |
|-------|---------|
| **URL** | https://unsplash.com/developers |
| **License** | Unsplash License — free for commercial use, no attribution required (but encouraged) |
| **API** | REST API with search, random, and curated endpoints |
| **Rate Limits** | Demo: 50 req/hr. Production (after approval): 5,000 req/hr |
| **Sports Coverage** | Good general sports photography (stadiums, athletes, action shots). Weaker on specific game/event photos |
| **Image Quality** | High — professional photographers, multiple resolutions available |
| **Pros** | High quality, legally clean, multiple sizes via URL params, no attribution required |
| **Cons** | 50 req/hr in demo mode is tight for a pipeline. Sports coverage is generic (no "Lakers vs Celtics" photos). Must trigger download endpoint per their guidelines |
| **Hotlinking** | Allowed and encouraged via `ixid` URL params for resizing |

### 1.2 Pexels API

| Field | Details |
|-------|---------|
| **URL** | https://www.pexels.com/api/ |
| **License** | Pexels License — free for commercial use, no attribution required |
| **API** | REST API with photo and video search |
| **Rate Limits** | 200 req/hr, 20,000 req/month. Limits can be increased with proper attribution |
| **Sports Coverage** | Decent general sports photos — soccer, basketball, running, fitness |
| **Image Quality** | High — curated stock photography |
| **Pros** | Higher rate limit than Unsplash demo tier. Legally clean. Multiple sizes provided in response |
| **Cons** | Still generic sports imagery. No event-specific photos |
| **Hotlinking** | Images served from Pexels CDN directly |

### 1.3 Pixabay API

| Field | Details |
|-------|---------|
| **URL** | https://pixabay.com/api/docs/ |
| **License** | Pixabay License (formerly CC0-like) — free for commercial use, no attribution required |
| **API** | REST API with search, category filters |
| **Rate Limits** | 100 req/min (very generous) |
| **Sports Coverage** | Large library including sports, but quality is more variable than Unsplash/Pexels |
| **Image Quality** | Medium-High — community-contributed, less curated |
| **Pros** | Most generous rate limit of the three stock photo APIs. Free. No attribution needed |
| **Cons** | Lower average quality. More illustrations/vectors mixed in with photos |
| **Hotlinking** | Allowed via returned CDN URLs |

### 1.4 Wikimedia Commons

| Field | Details |
|-------|---------|
| **URL** | https://commons.wikimedia.org/wiki/Commons:API |
| **License** | Mixed — mostly CC BY, CC BY-SA, GFDL, or public domain. Per-image license varies |
| **API** | MediaWiki API — complex query syntax, can search by category |
| **Rate Limits** | No hard limit but etiquette asks for <200 req/s with polite User-Agent |
| **Sports Coverage** | Extensive — real event photos, team logos, stadium photos. Categories like "Football photographs" |
| **Image Quality** | Variable — some excellent photojournalism, some low-quality uploads |
| **Pros** | Real sports event photos (actual games). Large catalog. Free |
| **Cons** | Attribution REQUIRED for most images. Complex API. License varies per image (must check each). Image quality inconsistent |
| **Hotlinking** | Allowed via upload.wikimedia.org URLs |

### 1.5 OpenAI Image Generation (DALL-E / GPT Image)

| Field | Details |
|-------|---------|
| **URL** | https://platform.openai.com/docs/guides/images |
| **License** | Generated images are owned by the requester — full commercial rights |
| **API** | OpenAI API — image generation endpoint |
| **Rate Limits** | Standard API rate limits (tier-dependent) |
| **Pricing** | GPT Image 1 Mini: $0.005-$0.052/image. DALL-E 3: $0.04-$0.12/image. GPT Image 1: $0.011-$0.25/image |
| **Sports Coverage** | Can generate any sport concept — stylized illustrations, abstract sports art |
| **Image Quality** | High for illustrations. Struggles with photorealism for specific athletes/teams |
| **Pros** | 100% original, zero copyright risk, can match brand aesthetic, sport-specific prompts |
| **Cons** | Per-image cost adds up. Latency (~5-15s per image). Cannot depict real players/teams accurately. Needs prompt engineering |

**Cost estimate:** At ~50 articles/day with GPT Image 1 Mini at low quality: ~$0.25/day ($7.50/month). Reasonable.

### 1.6 CSS/SVG-Generated Abstract Illustrations

| Field | Details |
|-------|---------|
| **License** | N/A — fully original, zero legal risk |
| **API** | None needed — generated at render time or build time |
| **Rate Limits** | None |
| **Sports Coverage** | Abstract only — gradients, patterns, sport iconography |
| **Image Quality** | Consistent, brand-aligned, but obviously not photography |
| **Pros** | Zero cost. Zero latency. Zero legal risk. Fully brand-customizable. Works offline |
| **Cons** | Not "real" images. Less engaging than photography. More design effort upfront |

### 1.7 TheSportsDB Logos and Badges

| Field | Details |
|-------|---------|
| **URL** | https://www.thesportsdb.com/free_sports_api |
| **License** | Free for non-commercial; Patreon tiers for commercial. Logos are fan-contributed |
| **API** | Already integrated in the codebase. Returns `strTeamBadge`, `strTeamLogo`, `strTeamBanner`, `strStadiumThumb` |
| **Rate Limits** | Free tier: limited (429 after ~30 req/min). Patreon $3/mo: higher limits |
| **Sports Coverage** | Excellent for team logos/badges across all major sports and leagues |
| **Image Quality** | Good for logos (PNG with transparency). Variable for fanart |
| **Size variants** | Append `/medium` (500px), `/small` (250px), `/tiny` (50px) to URLs |
| **Pros** | Already in the pipeline. Real team logos. Multiple sizes. Sport-specific |
| **Cons** | Logos are small/badge-style, not article hero images. Fan-contributed (potential quality issues). Commercial use requires Patreon tier |

### 1.8 ESPN API Images

| Field | Details |
|-------|---------|
| **Status** | Already being used in the codebase |
| **License** | UNCLEAR — ESPN's API is unofficial/undocumented. No explicit permission for image hotlinking in commercial contexts |
| **Image Types** | Team logos (small), editorial news photos (from articles endpoint) |
| **Risk** | Medium-High — ESPN could block hotlinking, change URLs, or send a cease-and-desist |
| **Recommendation** | **Should NOT be relied upon as primary image source.** Use as supplementary data only, with fallbacks |

### 1.9 Generated Gradient/Pattern Images with Sport Icons

| Field | Details |
|-------|---------|
| **License** | N/A — fully original |
| **Implementation** | CSS gradients with sport-specific color schemes + SVG sport icons overlaid |
| **Pros** | Already partially implemented as the current fallback. Zero cost. Zero risk |
| **Cons** | Visually monotonous at scale. Not as engaging as real photography |

---

## 2. Image Strategy Proposal

### Recommended Approach: Tiered Fallback System

The strategy uses a priority chain where each tier is attempted in order. This balances legal safety, visual quality, cost, and reliability.

```
Tier 1 (Primary):   Pexels API — search by sport + keywords from article
Tier 2 (Secondary): Unsplash API — search by sport name
Tier 3 (Tertiary):  AI-generated sport illustration (GPT Image 1 Mini)
Tier 4 (Fallback):  CSS gradient with sport-specific colors + emoji icon (already exists)
```

### Why This Order

1. **Pexels first** — best rate limit/quality ratio among free stock APIs (200 req/hr, 20K/month). Legally clean with no attribution requirement. Multiple sizes in response.
2. **Unsplash second** — excellent quality but tight 50 req/hr demo limit. Apply for production access (5K/hr) once traffic justifies it.
3. **AI-generated third** — original images with zero copyright risk. Cost-effective fallback (~$0.005/image at Mini tier). Adds visual variety that stock photos cannot provide.
4. **CSS gradient last** — always-available, zero-cost fallback that the site already has.

### Sport-Specific Search Strategy

Build a keyword map for each sport to improve stock photo search relevance:

```typescript
const SPORT_IMAGE_KEYWORDS: Record<string, string[]> = {
  'soccer':            ['soccer ball stadium', 'football pitch', 'soccer match'],
  'basketball':        ['basketball court', 'basketball hoop', 'NBA game'],
  'american-football': ['football field', 'american football stadium', 'NFL'],
  'baseball':          ['baseball diamond', 'baseball stadium', 'MLB'],
  'ice-hockey':        ['ice hockey rink', 'hockey puck', 'NHL arena'],
  'tennis':            ['tennis court', 'tennis racket match'],
  'golf':              ['golf course', 'golf green fairway'],
  'cricket':           ['cricket pitch', 'cricket bat ball'],
  'f1':                ['formula one racing', 'F1 race car circuit'],
  'boxing':            ['boxing ring', 'boxing match gloves'],
  'mma':               ['MMA octagon', 'mixed martial arts cage'],
  // ... etc.
};
```

For AI-generated images, use prompts like:
`"Abstract editorial illustration of [sport], dynamic energy, dark moody color palette with amber accents, no text, no faces, wide format 16:9"`

This matches the site's dark theme with amber accent colors.

### Sport-Specific Gradient Colors (Tier 4 Enhancement)

Upgrade the current generic gradient fallback with sport-specific color palettes:

```typescript
const SPORT_GRADIENTS: Record<string, { from: string; via: string; to: string }> = {
  'soccer':            { from: '#1a472a', via: '#2d5a3f', to: '#d4a017' },
  'basketball':        { from: '#c74b16', via: '#8b3a0f', to: '#2a1a0a' },
  'american-football': { from: '#013220', via: '#1a3a2a', to: '#8b6914' },
  'baseball':          { from: '#1a2744', via: '#2a3a5a', to: '#c41e3a' },
  'ice-hockey':        { from: '#0a1628', via: '#1a2a44', to: '#4a90d9' },
  // ... etc.
};
```

### Image Caching and Storage Strategy

**Option A (Recommended): Local File Cache with next/image**

1. During the pipeline run, fetch the image URL from Pexels/Unsplash
2. Store the **source URL** in the `imageUrl` DB column (as today)
3. Use `next/image` with `remotePatterns` configured for Pexels/Unsplash domains
4. Next.js handles optimization, caching, and responsive sizing automatically

**Option B (More Robust): Download and Store Locally**

1. During pipeline run, download the image to `/public/images/articles/{articleId}.webp`
2. Store the **local path** in the `imageUrl` DB column
3. Eliminates dependency on external CDNs at read time
4. Requires disk space management (cleanup old images)

**Recommendation:** Start with Option A for simplicity. Migrate to Option B if external CDN reliability becomes an issue.

### Schema Changes

**No schema changes needed.** The existing `imageUrl` text column is sufficient. The column stores a URL string regardless of whether it points to Pexels, Unsplash, a local path, or an AI-generated image.

**Optional future additions** (not required for initial implementation):

```sql
-- Could add to articles table later if needed:
image_source TEXT      -- 'pexels' | 'unsplash' | 'ai' | 'espn' | 'thesportsdb' | 'css'
image_attribution TEXT -- attribution string for CC-licensed images
```

### Performance Considerations

1. **Replace `<img>` with `next/image`** across all components:
   - `ArticleCard.tsx` — card thumbnails (set `width={400} height={176}`)
   - `ArticleFeed.tsx` — hero image (set `width={800} height={320}`)
   - Article detail page — hero (set `width={1200} height={480}`, `priority`)
   - Related articles — thumbnails (set `width={80} height={80}`)

2. **Configure `next.config.ts` remotePatterns:**
   ```typescript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'images.pexels.com' },
       { protocol: 'https', hostname: 'images.unsplash.com' },
       { protocol: 'https', hostname: 'pixabay.com' },
       { protocol: 'https', hostname: 'cdn.pixabay.com' },
       { protocol: 'https', hostname: 'upload.wikimedia.org' },
       { protocol: 'https', hostname: 'www.thesportsdb.com' },
       { protocol: 'https', hostname: 'a.espncdn.com' }, // existing ESPN images
     ],
   }
   ```

3. **Lazy loading** — `next/image` does this by default. Only the hero image on the detail page should use `priority={true}`.

4. **Responsive sizes** — use the `sizes` prop:
   - Card: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
   - Hero: `sizes="(max-width: 768px) 100vw, 50vw"`

5. **WebP/AVIF** — `next/image` serves optimized formats automatically.

---

## 3. Implementation Plan

### Phase 1: Image Utility Module (New File)

Create `src/pipeline/images/index.ts` with:

1. **`fetchArticleImage(sport: string, keywords: string[]): Promise<string | null>`**
   - Tries Pexels search first
   - Falls back to Unsplash
   - Returns image URL or null

2. **`generateArticleImage(sport: string, title: string): Promise<string | null>`**
   - Calls OpenAI GPT Image 1 Mini API
   - Uses sport-specific prompt template
   - Returns generated image URL or null

3. **`getImageForArticle(raw: RawArticleData): Promise<string | null>`**
   - Orchestrates the full fallback chain
   - If raw.imageUrl exists and is from a trusted source, keep it
   - Otherwise, try fetchArticleImage -> generateArticleImage -> null (CSS fallback)

4. **`buildSearchKeywords(raw: RawArticleData): string[]`**
   - Extracts meaningful search terms from article title, teams, sport
   - Used by stock photo search functions

### Phase 2: Pipeline Integration

Modify `src/pipeline/index.ts` — `saveArticlesToDb()`:

- Before saving, if `raw.imageUrl` is null or from an untrusted source (ESPN CDN), call `getImageForArticle(raw)` to fetch a legal image
- Add the image fetch to the pipeline flow between "rewriting" and "saving" stages
- Process image fetches in batches with rate limit awareness

### Phase 3: Frontend Optimization

1. Replace all `<img>` tags with `next/image` in:
   - `src/components/articles/ArticleCard.tsx`
   - `src/components/articles/ArticleFeed.tsx`
   - `src/app/sports/[slug]/[articleId]/page.tsx`

2. Upgrade the CSS gradient fallback:
   - Create `src/lib/sport-gradients.ts` with sport-specific color maps
   - Add subtle SVG sport icon overlays for visual interest

3. Add `next.config.ts` remote patterns for all image domains

### Phase 4: Backfill Existing Articles

- One-time script to fetch images for articles that currently have null imageUrl
- Run in batches respecting API rate limits
- Log results for monitoring

### Fetcher Changes Summary

| File | Change |
|------|--------|
| `src/pipeline/fetchers/types.ts` | No changes needed |
| `src/pipeline/fetchers/espn.ts` | No changes needed (keep ESPN images as-is, they serve as a data signal) |
| `src/pipeline/fetchers/thesportsdb.ts` | No changes needed |
| `src/pipeline/fetchers/rss.ts` | No changes needed |
| `src/pipeline/index.ts` | Add image resolution step between rewrite and save |
| `src/pipeline/images/index.ts` | **NEW** — image fetching utility module |
| `src/lib/sport-gradients.ts` | **NEW** — sport-specific gradient/color config |

### Environment Variables Needed

```env
PEXELS_API_KEY=         # Free, get from https://www.pexels.com/api/
UNSPLASH_ACCESS_KEY=    # Free, get from https://unsplash.com/developers
OPENAI_API_KEY=         # Already likely exists for any AI features (optional, for Tier 3)
```

### Estimated Costs

| Source | Monthly Cost | Notes |
|--------|-------------|-------|
| Pexels | Free | 20K requests/month covers ~660 articles/day |
| Unsplash | Free | 50 req/hr demo; apply for production if needed |
| OpenAI GPT Image 1 Mini | ~$7.50/mo | At 50 articles/day, $0.005/image, only for Tier 3 fallback |
| **Total** | **~$0-$8/mo** | Pexels alone likely covers most needs |

---

## Summary

The recommended approach is a **Pexels-first, multi-tier fallback system** that provides:

- **Legal safety**: All sources are explicitly free for commercial use
- **Visual quality**: Professional stock photography as the primary source
- **Reliability**: Four fallback tiers ensure every article has an image
- **Low cost**: Primary and secondary tiers are free; AI tier is ~$8/mo worst case
- **Minimal schema changes**: None required; existing `imageUrl` column works as-is
- **Performance**: `next/image` integration provides automatic optimization, lazy loading, and modern formats
