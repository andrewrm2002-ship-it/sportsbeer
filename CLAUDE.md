# Brews & Box Scores

**"Where Sports News Gets a Cold One"**

## Overview

Sports news aggregator that fetches real scores and headlines from ESPN and TheSportsDB,
then rewrites them with beer-themed humor using a deterministic template engine (no AI/LLM).
Users register, pick their favorite sports, and get a personalized feed of irreverent recaps.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database:** SQLite via better-sqlite3, Drizzle ORM
- **Auth:** NextAuth v5 (beta 30), credentials provider, JWT sessions
- **Styling:** Tailwind CSS v4, dark/light mode, amber accents
- **State:** Zustand for client preferences + theme
- **Package manager:** npm

## Project Structure

```
sportsbeer/
  db/
    schema.ts          # 6 tables: users, sports, leagues, articles, userSportPreferences, generationLogs
    index.ts           # DB connection (better-sqlite3)
    migrate.ts         # Drizzle migration runner
    seed.ts            # Seeds 30 sports + 30+ leagues
  src/
    lib/
      auth.ts          # NextAuth config (credentials, JWT, callbacks)
      utils.ts         # Shared utilities (cn, etc.)
    pipeline/
      index.ts         # Orchestrator: fetch -> dedupe -> rewrite -> store
      deduplicator.ts  # Hash-based dedup against existing articles
      fetchers/
        types.ts       # RawArticleData, SportConfig, FetchResult interfaces
        espn.ts        # ESPN hidden API fetcher
        thesportsdb.ts # TheSportsDB API fetcher (free key "3")
      rewriter/
        index.ts       # Main rewrite engine: extracts facts, picks templates, builds articles
        templates.ts   # ~15 template categories (blowout, close game, draw, transfer, injury, etc.)
        phrases.ts     # Beer transitions, humor interjections, opening/closing lines
        sports-puns.ts # Sport-specific puns
        headlines.ts   # Headline generator with score categorization
    stores/
      preferences.ts   # Zustand store for user sport preferences
    components/
      layout/          # Navbar, Footer, ScrollToTop, StatsBar, ThemeToggle
      auth/            # LoginForm, RegisterForm, UserMenu
      sports/          # SportSelector
      articles/        # ArticleCard, ArticleFeed, ArticleSkeleton, TrendingSidebar, ShareButtons
      admin/           # GenerateButton, GenerationProgress
      search/          # SearchModal (Cmd+K)
      ui/              # Toast notification system
      providers/       # SessionWrapper, ToastProvider
    app/
      page.tsx              # Home / article feed
      (auth)/login/         # Login page
      (auth)/register/      # Registration page
      preferences/          # Sport selection page
      api/
        auth/[...nextauth]/ # NextAuth route handler
        auth/register/      # POST - user registration (bcrypt hashing)
        preferences/        # GET/POST - user sport preferences
  drizzle.config.ts    # Drizzle Kit config
```

## Database Schema (6 tables)

| Table | Purpose |
|-------|---------|
| `users` | id, username, email, passwordHash, displayName, timestamps |
| `sports` | 30 sports with ESPN/SportsDB mappings, category (team/individual/combat/motor/water) |
| `leagues` | 30+ leagues linked to sports, with ESPN slugs |
| `articles` | Generated articles with sport/league refs, category, tags, source hash |
| `user_sport_preferences` | Many-to-many: user <-> sport |
| `generation_logs` | Pipeline run tracking: status, counts, errors |

## 30 Supported Sports

**Team:** Soccer, Basketball, American Football, Baseball, Ice Hockey, Cricket, Rugby Union,
Rugby League, Volleyball, Australian Football, Field Hockey, Lacrosse, Handball, Esports

**Individual:** Tennis, Golf, Swimming, Track & Field, Cycling, Gymnastics, Skiing,
Surfing, Table Tennis, Badminton, Sailing

**Combat:** MMA/UFC, Boxing, Wrestling

**Motor:** F1 Racing

**Water:** Water Polo

## Data Sources

- **ESPN Hidden API** (free, no key): Scores, news, standings via `site.api.espn.com`
- **TheSportsDB** (free key `"3"`): Events, results, league data via `thesportsdb.com/api/v1`
- **RSS Feeds** (free): Real news articles from ESPN and BBC Sport RSS feeds for 17+ sports

## Content Pipeline

1. **Fetch** - Pull real articles from ESPN API, RSS feeds (ESPN/BBC), and TheSportsDB for each active sport (batches of 5, 500ms delays)
2. **Deduplicate** - Hash-based comparison against existing `source_data_hash` in articles table
3. **Rewrite** - Humor engine preserving real content (no LLM):
   - Split real descriptions into sentences, rewrite each with humorous framing
   - Headlines use actual source titles with beer-themed tags appended
   - Extract facts (winner/loser, scores, blowout/close/draw/upset detection)
   - Layer beer transitions, interjections, and sport-specific puns between fact paragraphs
   - Score articles get template-based recaps + real game details
4. **Store** - Insert rewritten articles into SQLite

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out/session |
| POST | `/api/auth/register` | User registration (bcrypt hashed passwords) |
| GET | `/api/preferences` | Fetch user's selected sports |
| POST | `/api/preferences` | Update user's selected sports |
| GET | `/api/articles` | List articles (filterable by sportId, limit, offset) |
| GET | `/api/articles/[id]` | Single article detail |
| GET | `/api/articles/search` | Search articles by keyword (?q=) |
| GET | `/api/articles/trending` | Top 5 trending articles (diverse sports) |
| GET | `/api/sports` | List all active sports with article counts |
| GET | `/api/stats` | Site stats (total articles, sports count, last updated) |
| POST | `/api/generate` | Trigger content generation (auth required) |
| GET | `/api/generate/progress` | SSE stream for generation progress |

## Auth Flow

- NextAuth v5 with credentials provider (email + password)
- Passwords hashed with bcrypt
- JWT session strategy (no database sessions)
- Custom sign-in page at `/login`
- JWT callback stores `userId`, session callback exposes it

## Running Locally

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Then visit `http://localhost:3000`:
1. Register a new account
2. Select your favorite sports on the preferences page
3. Content generation is triggered from the admin UI ("Pour a Fresh Round")

## NPM Scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |
| `db:generate` | `drizzle-kit generate` |
| `db:migrate` | `npx tsx db/migrate.ts` |
| `db:seed` | `npx tsx db/seed.ts` |

## Features Added via 5 Review Cycles

- Search modal (Cmd+K / Ctrl+K) with debounced search
- Dark/Light mode toggle with flash-prevention
- Generation lock (prevents double runs, 409 on concurrent)
- Trending sidebar (5 articles from diverse sports)
- Stats bar (article count, sports count, last updated)
- Personalized homepage (sport filter pills for logged-in users)
- Article sharing (copy link, Twitter/X, native share)
- Toast notification system (success/error/info)
- Error boundary, custom 404, loading skeleton pages
- Hero article card on homepage
- Load more pagination in article feed
- Active nav link highlighting
- Scroll-to-top floating button
- Read time estimates on articles
- ESPN fetcher retry with exponential backoff
- Upset detection + content diversity in rewriter
- Venue/player data extraction for richer templates

## Design

- Dark/Light mode with CSS custom properties
- Dark: navy #1a1a2e bg, amber #d4a017 accent
- Light: warm off-white #f5f3ef bg, same amber accent
- Beer-themed humor throughout (transitions, puns, interjections)
- Article categories: scores, news, stats, highlights
- Responsive layout with skeleton loading states
- Mobile hamburger nav with search access

## Key Conventions

- All IDs are UUID v4 generated in SQLite via `randomblob`
- Timestamps stored as unix epochs (integer mode)
- Sports have categories: team, individual, combat, motor, water
- Articles deduplicated by source data hash before insertion
- Pipeline processes 5 sports concurrently with rate limiting
