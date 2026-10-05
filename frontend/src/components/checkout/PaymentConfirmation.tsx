'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { CheckoutButton } from './CheckoutButton';
import { gridPaperAfterClassName } from '@/lib/gridSurface';

type ConfirmationState = 'checking' | 'active' | 'failed' | 'delayed';

/** `next` redirects once active; without it the screen stays and offers `activeLink`. */
export type ConfirmationResult =
  { status: 'active'; next?: string } | { status: 'failed' } | { status: 'pending' };

const POLL_INTERVAL_MS = 2000;
const SLOW_POLL_INTERVAL_MS = 10000;
const DELAYED_AFTER_ATTEMPTS = 15;
const REDIRECT_DELAY_MS = 900;

/**
 * Post-Stripe return screen. Stripe redirects here before the webhook has
 * landed, so the account is polled until it activates or fails. It never stops
 * on its own: after ~30s the copy says it is taking longer and polling slows,
 * and coming back to the tab checks again at once, so a late webhook still
 * turns the screen without a reload.
 */
export function PaymentConfirmation({
  check,
  copy,
  retryHref,
  portalHref,
  portalLabel,
  activeLink,
  activeContent,
}: {
  check: () => Promise<ConfirmationResult>;
  copy: Record<ConfirmationState, readonly [string, string]>;
  retryHref: string;
  portalHref: string;
  portalLabel: string;
  activeLink?: { href: string; label: string };
  /** Shown once active in place of `activeLink`, e.g. the first-password form. */
  activeContent?: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState>('checking');
  const checkRef = useRef(check);
  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    let inFlight = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      clearTimeout(timeout);
      try {
        const result = await checkRef.current();
        if (cancelled) return;
        if (result.status === 'active') {
          settled = true;
          setState('active');
          const next = result.next;
          if (next) timeout = setTimeout(() => router.replace(next), REDIRECT_DELAY_MS);
          return;
        }
        if (result.status === 'failed') {
          settled = true;
          setState('failed');
          return;
        }
      } catch {
        // A transient error is indistinguishable from "not settled yet"; retry.
      } finally {
        inFlight = false;
      }
      if (cancelled) return;
      attempts += 1;
      if (attempts === DELAYED_AFTER_ATTEMPTS) setState('delayed');
      timeout = setTimeout(
        poll,
        attempts < DELAYED_AFTER_ATTEMPTS ? POLL_INTERVAL_MS : SLOW_POLL_INTERVAL_MS,
      );
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !settled && !cancelled) poll();
    };

    poll();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router]);

  const [title, body] = copy[state];

  return (
    <main
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-tint p-xl',
        gridPaperAfterClassName,
      )}
    >
      <section className="relative z-2 w-full max-w-[650px] border border-border-default bg-[color-mix(in_srgb,var(--surface-page)_91%,transparent)] p-2xl text-center shadow-xl backdrop-blur-[14px]">
        {state === 'active' && (
          <span className="mb-xl inline-flex h-[50px] w-[50px] items-center justify-center rounded-circle bg-action-primary text-title-sm text-text-on-dark">
            ✓
          </span>
        )}
        <h1 className="m-0 mb-m text-hero leading-[0.94] tracking-[-0.07em]">{title}</h1>
        <p className="mx-auto my-0 max-w-[480px] text-lead leading-[1.7] text-text-muted">{body}</p>
        {state === 'active' && activeContent}
        {state === 'active' && !activeContent && activeLink && (
          <CheckoutButton variant="link" className="mt-xl" href={activeLink.href}>
            {activeLink.label}
          </CheckoutButton>
        )}
        {state === 'failed' && (
          <CheckoutButton variant="link" className="mt-xl" href={retryHref}>
            Return to payment
          </CheckoutButton>
        )}
        {state === 'delayed' && (
          <CheckoutButton variant="link" className="mt-xl" href={portalHref}>
            {portalLabel}
          </CheckoutButton>
        )}
      </section>
    </main>
  );
}
