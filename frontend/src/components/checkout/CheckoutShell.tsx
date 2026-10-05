'use client';

import { type FormEvent, type ReactNode, useState } from 'react';
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout';
import Link from 'next/link';

import { stripePromise, STRIPE_ELEMENTS_OPTIONS } from '@/lib/stripe';
import { cn } from '@/lib/utils';

import { CheckoutButton } from './CheckoutButton';
import { TermsAgreement } from './TermsAgreement';
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
  price: string;
  /** What the price buys, e.g. "per report, every month". */
  dueLabel: string;
};

const summaryListItemClassName =
  'relative my-xs pl-ml text-body-sm font-strong text-text-control before:absolute before:left-0 before:font-black before:text-action-primary';

/**
 * The order on the left, held in view while the card fields on the right are
 * filled in: what is being bought, its price once, what it includes, and what
 * happens after paying.
 */
export function CheckoutShell({
  productName,
  order,
  features,
  nextSteps,
  changeHref,
  children,
}: {
  productName: string;
  order?: CheckoutOrder;
  features?: readonly string[];
  nextSteps?: readonly string[];
  /** Back to the plan chooser, for a customer who picked the wrong one. */
  changeHref?: string;
  children: ReactNode;
}) {
  return (
    <main className="grid grid-cols-[minmax(0,1fr)] overflow-clip bg-surface-page text-surface-inverse lg:grid-cols-[minmax(360px,0.8fr)_minmax(520px,1.2fr)]">
      <aside
        className={cn(
          'relative border-b border-border-default bg-surface-tint lg:border-r lg:border-b-0',
          gridPaperAfterClassName,
        )}
      >
        <div className="relative z-2 mx-auto max-w-[460px] px-ml py-xl sm:p-2xl lg:sticky lg:top-[var(--header-height-lg)]">
          <p className={cn(eyebrowClassName, 'm-0')}>Your order</p>
          <h1 className="m-0 mt-s text-title leading-tight tracking-[-0.045em]">{productName}</h1>
          {order && (
            <div className="mt-l flex flex-wrap items-baseline gap-x-s gap-y-2xs border-y border-border-default py-m">
              <strong className="text-display leading-none tracking-[-0.06em] text-action-primary">
                {order.price}
              </strong>
              <span className="text-label text-text-muted">{order.dueLabel}</span>
            </div>
          )}
          {changeHref && (
            <Link
              className="mt-s inline-block text-label font-heavy text-action-primary underline underline-offset-2"
              href={changeHref}
            >
              Change plan
            </Link>
          )}
          {features && features.length > 0 && (
            <section className="mt-xl">
              <h2 className={cn(eyebrowClassName, 'm-0 mb-s')}>Included</h2>
              <ul className="m-0 list-none p-0">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(summaryListItemClassName, "before:content-['↳']")}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {nextSteps && nextSteps.length > 0 && (
            <section className="mt-xl">
              <h2 className={cn(eyebrowClassName, 'm-0 mb-s')}>What happens next</h2>
              <ol className="m-0 list-none p-0 [counter-reset:step]">
                {nextSteps.map((step) => (
                  <li
                    key={step}
                    className={cn(
                      summaryListItemClassName,
                      '[counter-increment:step] before:content-[counter(step)]',
                    )}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </aside>

      <section className="flex justify-center px-ml py-2xl sm:p-2xl lg:px-3xl">{children}</section>
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
  termsHref,
  termsLabel,
  authorisation,
  clientSecret,
  onAccept,
}: {
  heading: string;
  submitLabel: string;
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
      <PaymentHeading heading={heading} />
      <TermsAgreement
        className="mb-l"
        termsHref={termsHref}
        termsLabel={termsLabel}
        authorisation={authorisation}
        checked={accepted}
        onChange={(event) => toggle(event.target.checked)}
      />
      {clientSecret ? (
        <CheckoutElementsProvider
          stripe={stripePromise}
          options={{ clientSecret, elementsOptions: STRIPE_ELEMENTS_OPTIONS }}
        >
          <PaymentFields accepted={accepted} submitLabel={submitLabel} />
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
      <PaymentFineprint />
    </div>
  );
}

/**
 * The payment step when the terms were already agreed to on an earlier form:
 * the card fields show as soon as there is a client secret, with no box to
 * tick first.
 */
export function CheckoutPayment({
  heading,
  submitLabel,
  clientSecret,
}: {
  heading: string;
  submitLabel: string;
  clientSecret: string;
}) {
  return (
    <div className="w-full max-w-copy">
      <PaymentHeading heading={heading} />
      <CheckoutElementsProvider
        stripe={stripePromise}
        options={{ clientSecret, elementsOptions: STRIPE_ELEMENTS_OPTIONS }}
      >
        <PaymentFields accepted submitLabel={submitLabel} />
      </CheckoutElementsProvider>
      <PaymentFineprint />
    </div>
  );
}

function PaymentHeading({ heading }: { heading: string }) {
  return (
    <div className="mb-l">
      <span className={eyebrowClassName}>Secure payment</span>
      <h2 className="my-xs text-title leading-tight tracking-[-0.045em]">{heading}</h2>
      <p className="m-0 text-body-sm leading-relaxed text-text-muted">
        Your card details are encrypted and handled directly by Stripe.
      </p>
    </div>
  );
}

function PaymentFineprint() {
  return (
    <p className={fineprintClassName}>
      The price shown is the total payable. Your account opens immediately after Stripe confirms
      payment.
    </p>
  );
}

/** Stripe's card fields and the pay button, once checkout is open. */
function PaymentFields({ accepted, submitLabel }: { accepted: boolean; submitLabel: string }) {
  const result = useCheckoutElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accepted || result.type !== 'success' || !result.checkout.canConfirm) return;
    setSubmitting(true);
    setError('');
    try {
      // No returnUrl: Django sets it when it creates the session, and Stripe
      // refuses a second one.
      const confirmed = await result.checkout.confirm();
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
