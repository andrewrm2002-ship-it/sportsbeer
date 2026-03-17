import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account | Brews & Box Scores',
};

export default function RegisterPage() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-8 shadow-xl shadow-black/10">
      <div className="text-center mb-8">
        <span className="text-4xl mb-3 block">&#x1F37B;</span>
        <h1 className="text-2xl font-bold text-text-primary">Join the Party</h1>
        <p className="text-sm text-text-muted mt-1">
          Create an account to customize your sports feed
        </p>
        <div className="flex items-center justify-center gap-3 mt-4 text-xs text-text-muted">
          <span>&#x1F3C8; 30+ sports</span>
          <span className="text-border">|</span>
          <span>&#x1F916; AI summaries</span>
          <span className="text-border">|</span>
          <span>&#x1F37A; Beer-themed</span>
        </div>
      </div>
      <RegisterForm />
    </div>
  );
}
