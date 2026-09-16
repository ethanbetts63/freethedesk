'use client';

import '@/components/dashboard/admin.css';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { homeFor } from '@/lib/api';
import { SignalFlow } from '@/components/visuals/SignalFlow';
import { AdminButton } from '@/components/dashboard/AdminButton';

function LoginContent() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || !user) return;
    const next = search.get('next');
    const home = homeFor(user);
    const prefix =
      user.role === 'staff' ? '/dashboard' : user.role === 'seo' ? '/seo-portal' : '/portal';
    router.replace(next && next.startsWith(prefix) ? next : home);
  }, [loading, router, search, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError('');
    try {
      await login(String(data.get('identifier')), String(data.get('password')));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-tint p-xl before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-950)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-950)_5%,transparent)_1px,transparent_1px)] before:[background-size:42px_42px]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.78] [&>canvas]:h-full [&>canvas]:w-full">
        <SignalFlow />
      </div>
      <section className="relative z-1 w-full max-w-[450px] border border-[color-mix(in_srgb,var(--slate-300)_85%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] px-ml py-xl shadow-[0_25px_70px_color-mix(in_srgb,var(--blue-950)_12%,transparent)] backdrop-blur-[13px] sm:p-xl">
        <Link className="login-brand" href="/">
          free<span>the</span>desk<i>.</i>
        </Link>
        <p className="admin-kicker mt-xl">Sign in</p>
        <h1 className="m-0 text-step-3 tracking-[-0.06em]">Welcome back</h1>
        <p className="mt-s mb-xl text-small leading-[1.5] text-text-muted">
          Dealers and staff sign in here — we will take you to the right place.
        </p>
        <form className="flex flex-col gap-m" onSubmit={submit}>
          <label className="text-ui font-heavy">
            Email
            <input
              className="mt-2xs block w-full border border-border-strong bg-surface-tint p-s outline-none focus:border-border-focus focus:shadow-[0_0_0_2px_var(--focus-ring)]"
              name="identifier"
              autoComplete="username"
              required
            />
          </label>
          <label className="text-ui font-heavy">
            Password
            <input
              className="mt-2xs block w-full border border-border-strong bg-surface-tint p-s outline-none focus:border-border-focus focus:shadow-[0_0_0_2px_var(--focus-ring)]"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="admin-form-error">{error}</p>}
          <AdminButton type="submit" disabled={submitting || loading}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </AdminButton>
        </form>
        <p className="mt-ml text-ui text-text-muted">
          No dealer account yet?{' '}
          <Link
            className="font-heavy text-text-action underline underline-offset-[3px]"
            href="/licensing#signup"
          >
            Create one
          </Link>
        </p>
        <p className="mt-ml text-ui text-text-muted">
          Looking for SEO reports?{' '}
          <Link
            className="font-heavy text-text-action underline underline-offset-[3px]"
            href="/seo#signup"
          >
            Choose a plan
          </Link>
        </p>
        <Link className="mt-l inline-block text-caption font-heavy text-text-muted" href="/">
          ← Back to website
        </Link>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="admin-loading">Loading sign in…</div>}>
      <LoginContent />
    </Suspense>
  );
}
