'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SignalFlow } from '@/components/visuals/SignalFlow';
import { cn } from '@/lib/utils';

import { CheckoutButton } from './CheckoutButton';
import { gridPaperAfterClassName } from '@/lib/gridSurface';

type ConfirmationState = 'checking' | 'active' | 'failed' | 'delayed';

export type ConfirmationResult =
  { status: 'active'; next: string } | { status: 'failed' } | { status: 'pending' };

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 15;
const REDIRECT_DELAY_MS = 900;

/**
 * Post-Stripe return screen. Stripe redirects here before the webhook has
 * landed, so the account is polled until it activates, fails, or times out.
 */
export function PaymentConfirmation({
  check,
  copy,
  retryHref,
  portalHref,
  portalLabel,
}: {
  check: () => Promise<ConfirmationResult>;
  copy: Record<ConfirmationState, readonly [string, string]>;
  retryHref: string;
  portalHref: string;
  portalLabel: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<ConfirmationState>('checking');
  const checkRef = useRef(check);
  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await checkRef.current();
        if (cancelled) return;
        if (result.status === 'active') {
          setState('active');
          timeout = setTimeout(() => router.replace(result.next), REDIRECT_DELAY_MS);
          return;
        }
        if (result.status === 'failed') {
          setState('failed');
          return;
        }
      } catch {
        // A transient error is indistinguishable from "not settled yet"; retry.
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) setState('delayed');
      else timeout = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
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
      <div className="absolute inset-0 opacity-[0.72] [&>canvas]:h-full [&>canvas]:w-full">
        <SignalFlow />
      </div>
      <section className="relative z-2 w-full max-w-[650px] border border-border-default bg-[color-mix(in_srgb,var(--surface-page)_91%,transparent)] p-[clamp(38px,6vw,74px)] text-center shadow-xl backdrop-blur-[14px]">
        <span className="mb-xl inline-flex h-[50px] w-[50px] items-center justify-center rounded-circle bg-action-primary text-[1.3rem] text-text-on-dark">
          {state === 'active' ? '✓' : '···'}
        </span>
        <h1 className="m-0 mb-m text-display-4 leading-[0.94] tracking-[-0.07em]">{title}</h1>
        <p className="mx-auto my-0 max-w-[480px] text-lead leading-[1.7] text-text-muted">{body}</p>
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
