'use client';

import { Suspense, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { homeFor } from '@/lib/api';
import { SignalFlow } from '@/components/visuals/SignalFlow';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName } from '@/components/ui/formControl';
import { adminLoadingClassName } from '@/components/dashboard/dashboardChrome';
import { cn } from '@/lib/utils';
import { brandClassName, kickerClassName } from '@/components/ui/layout';
import { gridPaperBeforeClassName } from '@/lib/gridSurface';
import { submitLogin, type LoginState } from './Login.actions';

const initialState: LoginState = { status: 'idle' };

function LoginContent() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [state, formAction] = useActionState(submitLogin, initialState);
  const justReset = search.get('reset') === '1';

  // The action established the session; this adopts it. Where to go next is
  // decided by the effect below, from the `Principal` -- one copy of that
  // decision, in the place that already had it.
  useEffect(() => {
    if (state.status === 'success') void refresh();
  }, [refresh, state.status]);

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
      user.role === 'staff'
        ? '/dashboard'
        : user.role === 'seo'
          ? '/seo-portal'
          : user.role === 'customer'
            ? '/account'
            : '/portal';
    router.replace(next && next.startsWith(prefix) ? next : home);
  }, [loading, router, search, user]);

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
        <Link className={brandClassName} href="/">
          free<span>the</span>desk<i>.</i>
        </Link>
        <p className={cn(kickerClassName, 'mt-xl')}>Sign in</p>
        <h1 className="m-0 text-title tracking-[-0.06em]">Welcome back</h1>
        <p className="mt-s mb-xl text-body-sm leading-[1.5] text-text-muted">
          Dealers, staff and customers sign in here — we will take you to the right place.
        </p>
        {justReset && (
          <Notice tone="success" size="field">
            Your password has been changed. Sign in with the new one.
          </Notice>
        )}
        <form className="mt-m flex flex-col gap-m" action={formAction}>
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
          {state.status === 'error' && (
            <Notice tone="danger" size="field">
              {state.error}
            </Notice>
          )}
          <SubmitButton disabled={loading} />
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

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}
