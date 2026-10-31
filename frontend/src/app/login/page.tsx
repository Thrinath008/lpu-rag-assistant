'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import { Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { token, user, setToken, setUser, setError: setAuthError, isLoading, setLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token && user) {
      router.push('/admin');
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      setToken(response.access_token);
      setUser(response.user);
      toast.success('Signed in');
      router.push('/admin');
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      const message = detail || 'Sign-in failed. Check your email and password.';
      setError(message);
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-saffron disabled:opacity-50';

  return (
    <div className="pt-safe pb-safe flex min-h-dvh items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-base font-bold text-white">
            L
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">LPU Assistant</span>
        </div>

        <h1 className="font-display text-3xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="mt-1.5 text-[15px] text-ink-soft">Use your administrator account to continue.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p role="alert" className="rounded-xl bg-risk-soft px-4 py-3 text-sm text-risk">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink-faint hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink font-medium text-white transition-all active:scale-[0.99] disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
