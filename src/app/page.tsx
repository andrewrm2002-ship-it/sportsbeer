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
  let preferredSports: { id: string; name: string; icon: string; slug: string }[] = [];
  if (session?.user?.id) {
    const prefs = await db
      .select({
        id: schema.sports.id,
        name: schema.sports.name,
        icon: schema.sports.icon,
        slug: schema.sports.slug,
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
      <section className="relative text-center py-16 sm:py-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/8 via-accent-glow to-transparent rounded-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-glow)_0%,_transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 20% 50%, var(--color-accent-glow) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(224, 122, 56, 0.05) 0%, transparent 50%)',
              animation: 'heroGlow 8s ease-in-out infinite alternate',
            }}
          />
        </div>

        <span className="text-6xl sm:text-7xl block mb-6 drop-shadow-lg">&#x1F37A;</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary">
          Brews &amp; Box Scores
        </h1>
        <p className="mt-2 text-sm sm:text-base font-medium text-accent/80 uppercase tracking-widest">
          Where Sports News Gets a Cold One
        </p>
        <p className="mt-4 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          AI-powered coverage with a humorous twist — served fresh daily.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          {!session && (
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-accent to-secondary text-bg-primary hover:shadow-lg hover:shadow-accent/25 transition-all duration-300 hover:scale-105"
            >
              Sign Up for Personalized Feeds
            </Link>
          )}
          <Link
            href="/sports"
            className="px-6 py-3 rounded-xl text-sm font-bold border-2 border-accent/30 text-accent hover:bg-accent/10 transition-all duration-300"
          >
            Browse Sports
          </Link>
        </div>

        {/* Beer foam / wave decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
          <svg
            viewBox="0 0 1200 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20C100 10 200 30 300 20C400 10 500 30 600 20C700 10 800 30 900 20C1000 10 1100 30 1200 20V40H0V20Z"
              fill="var(--color-bg-primary)"
              fillOpacity="0.5"
            />
            <path
              d="M0 25C150 15 250 35 400 25C550 15 650 35 800 25C950 15 1050 35 1200 25V40H0V25Z"
              fill="var(--color-bg-primary)"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar />

      {/* Onboarding nudge for logged-out users */}
      {!session && (
        <Link
          href="/register"
          className="block p-4 rounded-xl bg-accent-muted border border-accent/20 hover:border-accent/40 transition-colors -mt-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">&#x1F37A;</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Pick Your Favorite Sports
              </p>
              <p className="text-xs text-text-secondary">
                Sign up to get a personalized feed tailored to your taste.
              </p>
            </div>
            <span className="ml-auto text-accent text-sm font-medium">
              Register &rarr;
            </span>
          </div>
        </Link>
      )}

      {/* Main Content: Feed + Trending Sidebar */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {session
              ? hasPreferences
                ? 'Box Scores & Brews'
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
              <Link
                key={sport.id}
                href={`/sports/${sport.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:border-accent/40 transition-colors"
              >
                <span>{sport.icon}</span>
                {sport.name}
              </Link>
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
