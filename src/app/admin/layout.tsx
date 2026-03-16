import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Admin | Brews & Box Scores',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <span className="text-2xl">&#x2699;&#xFE0F;</span>
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">
            Taproom Control Panel
          </h1>
          <p className="text-sm text-text-muted">
            Manage content generation and view stats
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
