import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SportSelector } from '@/components/sports/SportSelector';

export const metadata = {
  title: 'Sport Preferences | Brews & Box Scores',
};

export default async function PreferencesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Pick Your Poisons &#x1F37B;
        </h1>
        <p className="text-text-secondary mt-2">
          Select the sports you want in your feed. We&apos;ll serve up fresh articles
          for each one.
        </p>
      </div>
      <SportSelector />
    </div>
  );
}
