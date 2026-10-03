'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';

import { Wordmark } from '@/components/Wordmark';
import { stripePromise, STRIPE_ELEMENTS_OPTIONS } from '@/lib/stripe';
import { cn } from '@/lib/utils';

import { CheckoutButton } from './CheckoutButton';
import { gridPaperAfterClassName } from '@/lib/gridSurface';

/**
 * Layout and lifecycle chrome shared by the checkout flows (dealer
 * subscriptions, SEO reports) so the two cannot visually drift apart.
 */

const eyebrowClassName =
  'text-caption font-black tracking-label-wide text-action-primary uppercase';
const headingClassName = 'my-s text-display leading-[0.96] tracking-[-0.065em]';
const bodyClassName = 'm-0 text-body leading-relaxed text-text-muted';
const fineprintClassName =
  'mx-auto mt-s max-w-[430px] text-center text-label leading-normal text-text-subtle';
const paymentErrorClassName =
  'my-m border-l-[3px] border-border-danger bg-surface-danger p-s text-label leading-[1.55] text-text-danger';

export type CheckoutOrder = {
  lineLabel: string;
  price: string;
  dueLabel: string;
};

export function CheckoutShell({
  productLabel,
  productName,
  productSummary,
  order,
  children,
}: {
  productLabel: string;
  productName: string;
  productSummary: string;
  order?: CheckoutOrder;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-surface-page text-surface-inverse lg:grid-cols-[minmax(390px,0.92fr)_minmax(520px,1.08fr)]">
      <section
        className={cn(
          'relative min-h-[540px] overflow-hidden bg-surface-tint sm:min-h-[620px] lg:min-h-screen',
          gridPaperAfterClassName,
        )}
      >
        <div className="relative z-2 flex min-h-[540px] flex-col px-ml py-xl sm:min-h-[620px] sm:p-2xl lg:min-h-screen">
          <Wordmark href="/" />
          <div className="mx-0 mt-auto mb-xl max-w-[610px] sm:mb-2xl">
            <p className="m-0 mb-ml text-caption font-black tracking-label-wide text-action-primary uppercase">
              {productLabel}
            </p>
            <h1 className="m-0 mb-xl max-w-[690px] text-hero leading-[0.87] tracking-[-0.075em] sm:text-hero">
              {productName}
            </h1>
            <span className="block max-w-[430px] text-lead leading-relaxed text-text-muted">
              {productSummary}
            </span>
          </div>
          {order && (
            <div className="border border-[color-mix(in_srgb,var(--border-strong)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] p-m backdrop-blur-[12px] sm:p-l">
              <div className="flex items-center justify-between py-2xs text-label">
                <span className="text-text-muted">{order.lineLabel}</span>
                <strong className="text-body-sm">{order.price}</strong>
              </div>
              <div className="mt-xs flex items-center justify-between border-t border-border-default pt-m pb-2xs text-label">
                <span className="text-text-muted">{order.dueLabel}</span>
                <strong className="text-title-sm tracking-[-0.04em] text-action-primary">
                  {order.price}
                </strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex min-h-auto items-center justify-center overflow-y-auto px-ml py-3xl sm:p-3xl lg:min-h-screen lg:py-3xl">
        {children}
      </section>
    </main>
  );
}

export function CheckoutState({
  eyebrow,
  title,
  body,
  onRetry,
  link,
}: {
  eyebrow: string;
  title: string;
  body: string;
  onRetry?: () => void;
  /** Somewhere to go instead, such as sign-in for an email that already has an account. */
  link?: { href: string; label: string };
}) {
  return (
    <div className="w-full max-w-copy">
      <span className={eyebrowClassName}>{eyebrow}</span>
      <h2 className={headingClassName}>{title}</h2>
      <p className={bodyClassName}>{body}</p>
      {link && (
        <CheckoutButton variant="link" className="mt-xl" href={link.href}>
          {link.label}
        </CheckoutButton>
      )}
      {onRetry && (
        <CheckoutButton variant="retry" className="mt-xl" onClick={onRetry}>
          Try again
        </CheckoutButton>
      )}
    </div>
  );
}

/**
 * The whole payment step on one screen: the terms box, then Stripe's card
 * fields, then the pay button.
 *
 * Stripe's checkout is only opened once the terms are accepted, because the
 * acceptance is recorded with it. So ticking the box is what calls
 * `onAccept`; the card fields appear under it when that returns a client
 * secret. Unticking afterwards disables the pay button again.
 */
export function CheckoutForm({
  heading,
  submitLabel,
  returnPath,
  termsHref,
  termsLabel,
  authorisation,
  clientSecret,
  onAccept,
}: {
  heading: string;
  submitLabel: string;
  returnPath: string;
  termsHref: string;
  termsLabel: string;
  authorisation: string;
  clientSecret: string;
  onAccept: () => Promise<void>;
}) {
  const [accepted, setAccepted] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function toggle(checked: boolean) {
    setAccepted(checked);
    if (!checked || clientSecret || preparing) return;
    setPreparing(true);
    try {
      await onAccept();
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div className="w-full max-w-copy">
      <div className="mb-xl border-b border-border-default pb-xl">
        <span className={eyebrowClassName}>Secure payment</span>
        <h2 className={headingClassName}>{heading}</h2>
        <p className={bodyClassName}>
          Your card details are encrypted and handled directly by Stripe.
        </p>
      </div>
      <label className="mb-l flex cursor-pointer items-start gap-s text-label leading-normal text-text-muted">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => toggle(event.target.checked)}
          className="mt-4xs h-[17px] w-[17px] flex-none accent-action-primary"
        />
        <span>
          I agree to the{' '}
          <Link
            className="font-heavy text-action-primary underline underline-offset-2"
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {termsLabel}
          </Link>
          , acknowledge the{' '}
          <Link
            className="font-heavy text-action-primary underline underline-offset-2"
            href="/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          , and {authorisation}
        </span>
      </label>
      {clientSecret ? (
        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{ clientSecret, elementsOptions: STRIPE_ELEMENTS_OPTIONS }}
        >
          <PaymentFields accepted={accepted} submitLabel={submitLabel} returnPath={returnPath} />
        </CheckoutElementsProvider>
      ) : (
        <>
          <p className="my-l text-body-sm text-text-muted">
            {preparing
              ? 'Loading secure card entry…'
              : 'Tick the box above and your card details go here.'}
          </p>
          <CheckoutButton type="button" disabled>
            <span>{submitLabel}</span>
            <b aria-hidden="true">→</b>
          </CheckoutButton>
        </>
      )}
      <p className={fineprintClassName}>
        The price shown is the total payable. Your account opens immediately after Stripe confirms
        payment.
      </p>
    </div>
  );
}

/** Stripe's card fields and the pay button, once checkout is open. */
function PaymentFields({
  accepted,
  submitLabel,
  returnPath,
}: {
  accepted: boolean;
  submitLabel: string;
  returnPath: string;
}) {
  const result = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || result.type !== 'success' || !result.checkout.canConfirm) return;
    setSubmitting(true);
    setError('');
    try {
      const confirmed = await result.checkout.confirm({
        returnUrl: `${window.location.origin}${returnPath}`,
      });
      if (confirmed.type === 'error')
        setError(confirmed.error.message || 'Payment could not be confirmed.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Payment could not be confirmed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result.type === 'loading')
    return <div className="py-l text-body-sm text-text-muted">Loading secure card entry…</div>;
  if (result.type === 'error')
    return <p className={paymentErrorClassName}>{result.error.message}</p>;

  return (
    <form onSubmit={submit}>
      <PaymentElement />
      {error && (
        <p className={paymentErrorClassName} role="alert">
          {error}
        </p>
      )}
      <CheckoutButton
        type="submit"
        className="mt-l"
        busy={submitting}
        disabled={!accepted || !result.checkout.canConfirm || submitting}
      >
        <span>{submitting ? 'Confirming…' : submitLabel}</span>
        <b aria-hidden="true">→</b>
      </CheckoutButton>
    </form>
  );
}
