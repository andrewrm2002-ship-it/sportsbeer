import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In | Brews & Box Scores',
};

export default function LoginPage() {
  return (
    <div className="bg-bg-card rounded-2xl border border-border p-8 shadow-xl shadow-black/10">
      <div className="text-center mb-8">
        <span className="text-4xl mb-3 block">&#x1F37A;</span>
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-muted mt-1">
          Sign in to get your personalized sports feed
        </p>
        <div className="flex items-center justify-center gap-3 mt-4 text-xs text-text-muted">
          <span>&#x1F3C8; 30+ sports</span>
          <span className="text-border">|</span>
          <span>&#x1F916; AI summaries</span>
          <span className="text-border">|</span>
          <span>&#x1F37A; Beer-themed</span>
        </div>
      </div>
      <LoginForm />
    </div>
  );
}
