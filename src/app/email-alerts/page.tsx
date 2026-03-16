import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { EmailAlertsForm } from '@/components/alerts/EmailAlertsForm';

export const metadata = {
  title: 'Email Alerts | Brews & Box Scores',
};

export default async function EmailAlertsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Email Alerts
        </h1>
        <p className="text-text-secondary mt-2">
          Get the latest stories delivered to your inbox
        </p>
      </div>
      <EmailAlertsForm />
    </div>
  );
}
