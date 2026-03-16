import Link from 'next/link';
import { ArticleFeed } from '@/components/articles/ArticleFeed';
import { TrendingSidebar } from '@/components/articles/TrendingSidebar';
import { StatsBar } from '@/components/layout/StatsBar';
import { auth } from '@/lib/auth';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export const metadata = {
  title: 'Brews & Box Scores — Where Sports News Gets a Cold One',
  description: 'Your daily sports news served with a side of humor. Coverage of 30 sports, rewritten with personality.',
};

export default async function HomePage() {
  const session = await auth();

  // Fetch user preferences server-side for logged-in users
  let preferredSports: { id: string; name: string; icon: string }[] = [];
  if (session?.user?.id) {
    const prefs = await db
      .select({
        id: schema.sports.id,
        name: schema.sports.name,
        icon: schema.sports.icon,
      })
      .from(schema.userSportPreferences)
      .innerJoin(schema.sports, eq(schema.userSportPreferences.sportId, schema.sports.id))
      .where(eq(schema.userSportPreferences.userId, session.user.id));
    preferredSports = prefs;
  }

  const hasPreferences = preferredSports.length > 0;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent rounded-3xl -z-10" />
        <span className="text-6xl sm:text-7xl block mb-6">&#x1F37A;</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary">
          Brews &amp; Box Scores
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Where sports news gets a cold one. AI-powered coverage with a
          humorous twist — served fresh daily.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/sports"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-accent to-secondary text-bg-primary hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 hover:scale-105"
          >
            Browse Sports
          </Link>
          {!session && (
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-sm font-bold border-2 border-accent/30 text-accent hover:bg-accent/10 transition-all duration-300"
            >
              Sign Up for Personalized Feeds
            </Link>
          )}
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Main Content: Feed + Trending Sidebar */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {session
              ? hasPreferences
                ? 'Your Tap List'
                : 'Latest on Tap'
              : 'Latest From All Taps'}
          </h2>
          <Link
            href="/sports"
            className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            All Sports &rarr;
          </Link>
        </div>

        {/* Preferences CTA for logged-in users with no preferences */}
        {session && !hasPreferences && (
          <Link
            href="/preferences"
            className="block mb-6 p-4 rounded-xl bg-accent-muted border border-accent/20 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">&#x1F37B;</span>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Personalize Your Feed
                </p>
                <p className="text-xs text-text-secondary">
                  Pick your favorite sports to see stories tailored to your taste.
                </p>
              </div>
              <span className="ml-auto text-accent text-sm font-medium">
                Set Preferences &rarr;
              </span>
            </div>
          </Link>
        )}

        {/* Sport filter pills for users with preferences */}
        {session && hasPreferences && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {preferredSports.map((sport) => (
              <span
                key={sport.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20"
              >
                <span>{sport.icon}</span>
                {sport.name}
              </span>
            ))}
            <Link
              href="/preferences"
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-text-muted hover:text-accent hover:bg-accent-muted border border-border transition-colors"
            >
              Edit
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <ArticleFeed headerLabel={session && hasPreferences ? 'Your Feed' : undefined} />
          <TrendingSidebar />
        </div>
      </section>
    </div>
  );
}
