'use client';

import { FormEvent, ReactNode, useState } from 'react';
import Link from 'next/link';
import { PaymentElement, useCheckoutElements } from '@stripe/react-stripe-js/checkout';

import { SignalFlow } from '@/components/visuals/SignalFlow';

/**
 * Layout and lifecycle chrome shared by the checkout flows (dealer
 * subscriptions, SEO reports) so the two cannot visually drift apart.
 */

const eyebrowClassName = 'text-caption font-black tracking-[0.14em] text-action-primary uppercase';
const headingClassName = 'my-s text-display-3 leading-[0.96] tracking-[-0.065em]';
const bodyClassName = 'm-0 text-body leading-[1.6] text-[var(--slate-600)]';
const payButtonClassName =
  'flex min-h-[60px] w-full cursor-pointer items-center border-0 bg-action-primary px-ml font-[inherit] text-small font-black text-text-on-dark disabled:cursor-not-allowed disabled:opacity-45 [&>b]:text-step-0';
const fineprintClassName =
  'mx-auto mt-s max-w-[430px] text-center text-meta leading-[1.5] text-[var(--slate-500)]';
const paymentErrorClassName =
  'my-m border-l-[3px] border-border-danger bg-surface-danger p-s text-ui leading-[1.55] text-text-danger';

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
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)] bg-surface-page text-surface-inverse min-[900px]:grid-cols-[minmax(390px,0.92fr)_minmax(520px,1.08fr)]">
      <section className="relative min-h-[540px] overflow-hidden bg-surface-tint after:absolute after:inset-0 after:pointer-events-none after:content-[''] after:[background-image:linear-gradient(color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--blue-950)_5.5%,transparent)_1px,transparent_1px)] after:[background-size:42px_42px] sm:min-h-[620px] min-[900px]:min-h-screen">
        <div className="absolute inset-0 opacity-85 [&>canvas]:h-full [&>canvas]:w-full">
          <SignalFlow />
        </div>
        <div className="relative z-2 flex min-h-[540px] flex-col px-ml py-xl sm:min-h-[620px] sm:p-[clamp(30px,5vw,72px)] min-[900px]:min-h-screen">
          <Link
            className="w-fit text-step-1 font-black tracking-[-0.07em] text-surface-inverse"
            href="/"
          >
            free
            <span className="mx-4xs text-[0.73em] font-strong text-[var(--slate-500)]">the</span>
            desk
            <i className="text-action-primary not-italic">.</i>
          </Link>
          <div className="mx-0 mt-auto mb-xl max-w-[610px] sm:mb-2xl">
            <p className="m-0 mb-ml text-caption font-black tracking-[0.15em] text-action-primary uppercase">
              {productLabel}
            </p>
            <h1 className="m-0 mb-xl max-w-[690px] text-display-4 leading-[0.87] tracking-[-0.075em] sm:text-display-6">
              {productName}
            </h1>
            <span className="block max-w-[430px] text-lead leading-[1.65] text-[var(--slate-600)]">
              {productSummary}
            </span>
          </div>
          {order && (
            <div className="border border-[color-mix(in_srgb,var(--slate-300)_68%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_82%,transparent)] p-m backdrop-blur-[12px] sm:p-l">
              <div className="flex items-center justify-between py-2xs text-ui">
                <span className="text-[var(--slate-600)]">{order.lineLabel}</span>
                <strong className="text-small">{order.price}</strong>
              </div>
              <div className="flex items-center justify-between py-2xs text-ui">
                <span className="text-[var(--slate-600)]">GST</span>
                <strong className="text-small">Included</strong>
              </div>
              <div className="mt-xs flex items-center justify-between border-t border-[var(--slate-200)] pt-m pb-2xs text-ui">
                <span className="text-[var(--slate-600)]">{order.dueLabel}</span>
                <strong className="text-step-2 tracking-[-0.04em] text-action-primary">
                  {order.price}{' '}
                  <small className="text-label tracking-normal text-[var(--slate-500)]">
                    GST inc.
                  </small>
                </strong>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex min-h-auto items-center justify-center overflow-y-auto px-ml py-3xl sm:p-[clamp(44px,7vw,100px)] min-[900px]:min-h-screen min-[900px]:py-[clamp(44px,7vw,100px)]">
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
}: {
  eyebrow: string;
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full max-w-[560px]">
      <span className={eyebrowClassName}>{eyebrow}</span>
      <h2 className={headingClassName}>{title}</h2>
      <p className={bodyClassName}>{body}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-xl flex min-h-[60px] w-full max-w-[190px] cursor-pointer items-center justify-center border-0 bg-action-primary px-ml font-[inherit] text-small font-black text-text-on-dark"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** Step one: accept the terms before any card details are collected. */
export function CheckoutTermsForm({
  priceNote,
  termsHref,
  termsLabel,
  authorisation,
  onConfirm,
}: {
  priceNote: string;
  termsHref: string;
  termsLabel: string;
  authorisation: string;
  onConfirm: () => Promise<void>;
}) {
  const [accepted, setAccepted] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || preparing) return;
    setPreparing(true);
    try {
      await onConfirm();
    } finally {
      setPreparing(false);
    }
  }

  return (
    <form className="w-full max-w-[560px]" onSubmit={submit}>
      <div className="mb-xl border-b border-[var(--slate-200)] pb-xl">
        <span className={eyebrowClassName}>Before payment</span>
        <h2 className={headingClassName}>Confirm the offer.</h2>
        <p className={bodyClassName}>{priceNote}</p>
      </div>
      <label className="mt-l mr-0 mb-m ml-0 flex cursor-pointer items-start gap-s text-ui leading-[1.5] text-[var(--slate-600)]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-4xs mr-0 mb-0 ml-0 h-[17px] w-[17px] flex-none accent-action-primary"
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
      <button type="submit" className={payButtonClassName} disabled={!accepted || preparing}>
        <span>{preparing ? 'Preparing secure payment…' : 'Payment'}</span>
        <b>→</b>
      </button>
    </form>
  );
}

/** Step two: the Stripe Payment Element and its confirmation. */
export function CheckoutPaymentForm({
  heading,
  submitLabel,
  returnPath,
}: {
  heading: string;
  submitLabel: string;
  returnPath: string;
}) {
  const result = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (result.type !== 'success' || !result.checkout.canConfirm) return;
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
    return (
      <div className="py-l text-small text-[var(--slate-600)]">Loading secure card entry…</div>
    );
  if (result.type === 'error')
    return <p className={paymentErrorClassName}>{result.error.message}</p>;

  return (
    <form className="w-full max-w-[560px]" onSubmit={submit}>
      <div className="mb-xl border-b border-[var(--slate-200)] pb-xl">
        <span className={eyebrowClassName}>Secure payment</span>
        <h2 className={headingClassName}>{heading}</h2>
        <p className={bodyClassName}>
          Your card details are encrypted and handled directly by Stripe.
        </p>
      </div>
      <PaymentElement />
      <p className={fineprintClassName}>
        The selected offer and accepted terms are recorded with this checkout.
      </p>
      {error && (
        <p className={paymentErrorClassName} role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className={payButtonClassName}
        disabled={!result.checkout.canConfirm || submitting}
      >
        <span>{submitting ? 'Confirming…' : submitLabel}</span>
        <b>→</b>
      </button>
      <p className={fineprintClassName}>
        Prices include GST. Your account opens immediately after Stripe confirms payment.
      </p>
    </form>
  );
}
