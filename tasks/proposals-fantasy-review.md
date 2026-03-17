# Technical Feasibility Review: Fantasy Picks Section

**Reviewer:** Backend Engineer
**Date:** 2026-03-16
**Proposal Source:** Subagent output `aa8e15d7739f36f78`

---

## 1. Data Source Feasibility

### ESPN Hidden API (Already Integrated)
**Verdict: PARTIALLY VIABLE for fantasy**

The proposal claims ESPN's API has "player stats, injury reports, rankings." This overstates what the current integration actually fetches. Looking at `src/pipeline/fetchers/espn.ts`, the codebase only consumes two endpoints:
- `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard` -- game scores
- `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/news` -- headlines

These endpoints return team-level scores and news headlines. They do NOT return individual player stats, fantasy projections, or injury reports in structured form. ESPN does have additional undocumented endpoints (e.g., `/athletes/{id}/stats`, `/fantasy/...`) but:
- These are undocumented and could break or be rate-limited without notice
- The fantasy-specific endpoints (`fantasy.espn.com/apis/v3/...`) require authentication for most useful data
- Player-level stat projections are not available on the free public API

**Risk: HIGH.** The proposal hand-waves "already integrated" but the current integration covers none of the data needed for fantasy picks.

### TheSportsDB (Already Integrated)
**Verdict: MINIMALLY VIABLE**

Current integration (`src/pipeline/fetchers/thesportsdb.ts`) uses the free tier key "3" and fetches season events and past events. TheSportsDB does have player data endpoints (`/searchplayers.php`, `/lookupplayer.php`) on the free tier, but:
- Player stats are limited on the free tier (basic bio, no per-game stats)
- No fantasy-relevant projections, odds, or advanced metrics
- Rate limits on free tier are restrictive (30 calls/minute documented, often lower in practice)

**Risk: MEDIUM.** Can supplement with player names and basic info, but not a fantasy data source.

### Other Proposed Sources
The proposal mentions:
- **"Rapid API - Sports API"** -- This is a paid API. The free tier gives ~100 requests/month, which is unusable for a production fantasy system. Misleading to call this "free."
- **"MLB.com StatsAPI"** -- This one IS genuinely free and auth-free (`statsapi.mlb.com`). Good for MLB fantasy. However, it only covers baseball.
- **"NBA Stats API"** -- The `stats.nba.com` endpoints are heavily rate-limited, require specific headers to avoid 403s, and have been known to block automated access. Not reliably free.
- **"ESPN Cricinfo Data Feed"** -- Irrelevant to the proposed fantasy sports list (NFL, NBA, MLB, NHL, PL).

**Overall Data Source Assessment:** The proposal lists 6 data sources but only 1 (MLB StatsAPI) is genuinely free, reliable, and provides fantasy-grade player statistics. For the other 4-5 major sports (NFL, NBA, NHL, PL, Golf), there is no identified free data source that provides the player-level stat projections needed for fantasy picks.

---

## 2. Schema Compatibility

### Proposed Tables

**`fantasyPicks` table -- COMPATIBLE WITH CAVEATS**

The proposed schema is structurally compatible with the existing Drizzle ORM + SQLite setup. The codebase uses `sqliteTable` from `drizzle-orm/sqlite-core` with text PKs, JSON columns via `text('col', { mode: 'json' })`, and integer timestamps. The proposed table follows these patterns.

Issues:
- `performanceScore: float` -- SQLite has no native float type. Drizzle maps this to `real()` which works, but the proposal uses "float" terminology suggesting unfamiliarity with the SQLite/Drizzle type system. Should be `real('performance_score')`.
- `confidence enum ('high', 'medium', 'low')` -- The existing codebase uses `text('col', { enum: [...] })` for enums. This is fine but the proposal doesn't show the Drizzle syntax, just pseudocode.
- `players: JSON array` -- Compatible. The existing `tags` column on `articles` uses the same `text('col', { mode: 'json' }).$type<T>()` pattern.
- Missing: No `id` generation strategy shown, but the existing UUID pattern via `randomblob` can be reused.

**`userFantasyFollows` table -- COMPATIBLE**

Simple junction table with FKs. Matches existing patterns (`userSportPreferences`, `bookmarks`). The `result` enum field is fine.

**Missing schema considerations:**
- No index definitions proposed. Fantasy picks will be queried by sport, date, and pick type. Without indexes on `(sportId, publishedAt)` and `(pickType, publishedAt)`, queries will table-scan.
- No `leagueId` foreign key is defined in the pseudo-schema despite being referenced. The existing `articles` table properly references `leagues.id` -- this table should too.
- No consideration for soft deletes or pick expiration. Fantasy picks are time-sensitive; stale picks should be hidden.

---

## 3. Content Pipeline Without an LLM

### Current Pipeline Architecture
The existing pipeline is entirely template-based with no LLM dependency:
1. **Fetch** raw data (ESPN, TheSportsDB, RSS)
2. **Deduplicate** via content hashing (`src/pipeline/deduplicator.ts`)
3. **Rewrite** using deterministic template selection + randomized phrase injection (`src/pipeline/rewriter/`)
4. **Save** to SQLite

The rewriter uses `extractFacts()` to pull structured data from raw articles, then selects from categorized template pools (blowout, close game, upset, etc.) and injects humor via `phrases.ts` and `sports-puns.ts`.

### Can This Work for Fantasy?
**Verdict: YES, with significant template work**

The proposal describes a "Fantasy Analyzer" and "Projection Engine" which implies statistical modeling. This is a much harder problem than the current template-based rewriting. However, for a v1, you could:

- **Viable approach:** Use simple heuristic rules (player averaging X points, facing team ranked Y in defense, injury to starter Z creates opportunity) and template them like the existing score recaps. The rewriter already has `TemplateData` with player/team/score slots that could be extended.
- **What's needed:** A new `fantasyRewriter` module parallel to `src/pipeline/rewriter/index.ts` with fantasy-specific templates. The existing `pickTemplate` and `pickTemplates` functions in `templates.ts` already exist (imported in the rewriter) -- this suggests some groundwork was already laid.
- **What's NOT viable without an LLM:** Generating nuanced pick "reasoning" paragraphs that sound convincing. Template-based reasoning will feel repetitive fast. The current article rewriter gets away with it because score recaps have natural variety (different teams, scores, venues). Fantasy reasoning has less structural variety.

**Risk: MEDIUM.** Feasible for v1 with templates, but content quality will plateau quickly. Budget for either an LLM integration or a very large template library (200+ reasoning templates).

---

## 4. API Route Consistency

### Existing API Patterns
The codebase uses Next.js App Router API routes:
- `src/app/api/articles/route.ts` -- GET with query params
- `src/app/api/bookmarks/route.ts` -- GET/POST with auth checks
- `src/app/api/generate/route.ts` -- POST with auth + progress streaming via polling
- Auth via `next-auth` (`src/lib/auth`)

### Proposed Routes
The proposal suggests:
- `/fantasy` page route
- `/fantasy/[sport]` page route
- `/fantasy/leaderboard` page route

These are page routes, not API routes. The proposal doesn't explicitly define API routes for fantasy data, which is a gap. Based on existing patterns, you'd need:
- `src/app/api/fantasy-picks/route.ts` -- GET (list picks with filters), POST (generate picks)
- `src/app/api/fantasy-picks/[id]/follow/route.ts` -- POST/DELETE (follow/unfollow a pick)
- `src/app/api/fantasy-picks/accuracy/route.ts` -- GET (leaderboard/accuracy stats)

The proposal's suggestion to add "Fantasy" as a category tab in `ArticleFeed` is problematic. The `articles.category` enum is currently `['scores', 'news', 'stats', 'highlights']`. Adding 'fantasy' would require a schema migration AND would conflate two different data models (articles vs picks) into one feed. Better to keep fantasy picks as a separate entity with its own feed component.

---

## 5. Biggest Technical Risks

### Risk 1: No Reliable Free Fantasy Data (CRITICAL)
The entire feature depends on player-level statistics and projections. The proposal identifies no free API that reliably provides this across NFL, NBA, NHL, and Premier League. Without data, there are no picks. This is a showstopper that must be resolved before any implementation begins.

**Mitigation options:**
- Scope v1 to MLB only (StatsAPI is genuinely free)
- Use web scraping (fragile, legally gray)
- Accept a paid API cost (~$30-50/month for SportRadar basic tier)
- Derive "picks" from news analysis rather than stat projections (e.g., "Player X is trending up based on recent headlines")

### Risk 2: Pick Accuracy Tracking Has No Ground Truth (HIGH)
The proposal includes `performanceScore` and `result` tracking, but doesn't explain how outcomes are determined. Who/what decides if a pick was a "win" or "loss"? This requires:
- Defining what constitutes a "pick" (player over/under? team win? specific stat?)
- A post-game data ingestion pipeline to compare projections vs actuals
- A scoring algorithm

None of this is addressed.

### Risk 3: Template Fatigue (MEDIUM)
The existing rewriter already shows signs of repetition with ~50 template variations. Fantasy reasoning needs to feel fresh daily for returning users. With pure template-based generation, expect content quality complaints within 2-3 weeks of launch.

### Risk 4: ESPN API Stability (MEDIUM)
The codebase already depends heavily on ESPN's undocumented API. Adding more endpoint usage (player stats, injuries) increases exposure to unannounced API changes. The existing `fetchJson` has retry logic, but no circuit breaker or fallback caching.

### Risk 5: Generation Pipeline Coupling (LOW-MEDIUM)
The proposal suggests adding fantasy generation to the existing `generateContent()` pipeline. This function already processes all active sports sequentially in batches of 5. Adding fantasy analysis per sport will significantly increase generation time. The current architecture has no timeout protection at the pipeline level -- a slow fantasy data fetch could block the entire generation run.

---

## 6. What's Missing From the Proposal

1. **Data source validation.** No evidence that the listed APIs were actually tested. Several are mischaracterized as "free."

2. **Pick definition and scoring rules.** What IS a fantasy pick in this system? Player prop? Team pick? DFS lineup? The proposal is vague. Without a clear pick ontology, the schema and templates can't be properly designed.

3. **Outcome resolution pipeline.** How and when are picks marked as won/lost? Needs a separate scheduled job that runs after games complete.

4. **Caching strategy.** Fantasy data is time-sensitive but shouldn't be re-fetched on every page load. No mention of caching player stats, game schedules, or pick results.

5. **Rate limit budgeting.** The existing pipeline already makes ~50-100 API calls per generation run across ESPN + TheSportsDB + RSS. Adding player-level stat fetches could 5-10x this. No rate limit analysis is provided.

6. **Error handling for stale picks.** What happens when a game is postponed? When a player is a late scratch? The proposal assumes clean data flows.

7. **Migration strategy.** Adding a category to the articles enum or adding new tables requires a Drizzle migration. The proposal doesn't mention `db:generate` or `db:migrate` steps.

8. **Testing plan.** No mention of how to test fantasy pick generation, accuracy tracking, or template quality.

9. **Legal/compliance.** Fantasy sports advice has regulatory implications in some US states. Even if this is "for entertainment," the framing matters.

10. **Mobile/responsive design.** The proposal describes desktop layouts but the existing app is mobile-first with responsive Tailwind components. No mobile wireframes for fantasy cards.

---

## Recommendation

**Do not proceed with the proposal as written.** The core dependency -- free fantasy-grade player data -- is unresolved, and several proposed data sources are inaccurately described as free.

**Recommended next steps:**
1. Spike on data sources: spend 1-2 days actually calling the proposed APIs and documenting what data is returned, rate limits, and auth requirements.
2. Define the pick model: decide what a "pick" means (player prop, game pick, DFS suggestion) before designing schema.
3. Scope to one sport first (MLB via StatsAPI) as a proof of concept.
4. Design the outcome resolution pipeline before the pick generation pipeline.
5. Consider whether an LLM budget ($5-10/month for a small model) is acceptable for reasoning generation, since pure templates will produce mediocre content for this use case.
