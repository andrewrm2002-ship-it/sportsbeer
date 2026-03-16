'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

export function RegisterForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match. Sober up and try again!");
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed, redirect to login
        router.push('/login');
      } else {
        addToast('Account created! Welcome to the bar.', 'success');
        router.push('/preferences');
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
        <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1.5">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={30}
          placeholder="BeerFanatic42"
          className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

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
          minLength={6}
          placeholder="At least 6 characters"
          className="w-full px-4 py-3 rounded-lg bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Type it again"
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
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
