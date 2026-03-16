'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

export function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Maybe lay off the brews?');
      } else {
        addToast('Welcome back! Grab a cold one.', 'success');
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Your password"
          className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-semibold text-bg-primary transition-all duration-200',
          loading
            ? 'bg-accent/50 cursor-not-allowed'
            : 'bg-accent hover:bg-accent-hover active:scale-[0.98]'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Register here
        </Link>
      </p>
    </form>
  );
}
