import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { BookmarksFeed } from '@/components/articles/BookmarksFeed';

export const metadata = {
  title: 'Bookmarks | Brews & Box Scores',
  description: 'Your saved articles',
};

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
          Your Bookmarks
        </h1>
        <p className="mt-2 text-text-secondary max-w-lg mx-auto">
          Articles you&apos;ve saved for later. Your personal reading list.
        </p>
      </div>

      <BookmarksFeed />
    </div>
  );
}
