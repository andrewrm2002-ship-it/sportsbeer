# Brews & Box Scores 🍺

**Where Sports News Gets a Cold One**

A locally-running sports news aggregator that covers 30 sports, rewrites content in a humorous beer-themed style, and lets you personalize your feed.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and set a random secret for `NEXTAUTH_SECRET` and `AUTH_SECRET`.

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## First Use

1. Click **Register** to create an account
2. Go to **Preferences** and select your favorite sports
3. Go to **Admin** and click **"Pour a Fresh Round"** to generate content
4. Watch as articles are fetched from ESPN and TheSportsDB, rewritten with humor, and published to your feed

## Features

- 30 sports covered (Soccer, NBA, NFL, NHL, MLB, Tennis, Golf, Cricket, MMA, F1, and 20 more)
- Humorous, beer-themed content rewriting engine
- User accounts with personalized sport preferences
- One-click content generation with real-time progress
- Article search (Cmd+K / Ctrl+K)
- Dark/Light mode toggle
- Article sharing (copy link, Twitter/X)
- Trending sidebar, stats bar, responsive design
- Fully local — no hosting required

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- SQLite (better-sqlite3) + Drizzle ORM
- NextAuth.js v5 (local credentials)
- Tailwind CSS + shadcn/ui patterns

## Data Sources

- **ESPN Hidden API** (free, no key) — scores, news, standings for 17+ sports
- **TheSportsDB** (free) — team metadata, images, event data

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed 30 sports + leagues |
| `npm run db:generate` | Generate new migrations from schema |
