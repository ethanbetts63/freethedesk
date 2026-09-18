'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { homeFor } from '@/lib/api';
import { SignalFlow } from '@/components/visuals/SignalFlow';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { formControlClassName } from '@/components/dashboard/formControl';
import { adminLoadingClassName } from '@/components/dashboard/dashboardChrome';
import { cn } from '@/lib/utils';
import { adminBrandClassName, adminKickerClassName } from '@/components/dashboard/adminLayout';
import { gridPaperBeforeClassName } from '@/lib/gridSurface';

function LoginContent() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const justReset = search.get('reset') === '1';

  useEffect(() => {
    if (loading || !user) return;
    const next = search.get('next');
    const home = homeFor(user);
    // A password somebody else chose comes before any `next`: `homeFor` returns
    // the gate, and honouring the requested page here would walk straight past it.
    if (user.must_change_password) {
      router.replace(home);
      return;
    }
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
    <main
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-tint p-xl',
        gridPaperBeforeClassName,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.78] [&>canvas]:h-full [&>canvas]:w-full">
        <SignalFlow />
      </div>
      <section className="relative z-1 w-full max-w-[450px] border border-[color-mix(in_srgb,var(--slate-300)_85%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] px-ml py-xl shadow-l backdrop-blur-[13px] sm:p-xl">
        <Link className={adminBrandClassName} href="/">
          free<span>the</span>desk<i>.</i>
        </Link>
        <p className={cn(adminKickerClassName, 'mt-xl')}>Sign in</p>
        <h1 className="m-0 text-title tracking-[-0.06em]">Welcome back</h1>
        <p className="mt-s mb-xl text-body-sm leading-[1.5] text-text-muted">
          Dealers and staff sign in here — we will take you to the right place.
        </p>
        {justReset && (
          <AdminNotice tone="success" size="field">
            Your password has been changed. Sign in with the new one.
          </AdminNotice>
        )}
        <form className="mt-m flex flex-col gap-m" onSubmit={submit}>
          <label className="text-label font-heavy">
            Email
            <input
              className={cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s')}
              name="identifier"
              autoComplete="username"
              required
            />
          </label>
          <label className="text-label font-heavy">
            Password
            <input
              className={cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s')}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <AdminNotice tone="danger" size="field">
              {error}
            </AdminNotice>
          )}
          <AdminButton type="submit" disabled={submitting || loading}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </AdminButton>
        </form>
        <p className="mt-ml text-label text-text-muted">
          <Link
            className="font-heavy text-text-action underline underline-offset-[3px]"
            href="/reset-password"
          >
            Forgot your password?
          </Link>
        </p>
        <p className="mt-ml text-label text-text-muted">
          No dealer account yet?{' '}
          <Link
            className="font-heavy text-text-action underline underline-offset-[3px]"
            href="/licensing#signup"
          >
            Create one
          </Link>
        </p>
        <p className="mt-ml text-label text-text-muted">
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
    <Suspense fallback={<div className={adminLoadingClassName}>Loading sign in…</div>}>
      <LoginContent />
    </Suspense>
  );
}
