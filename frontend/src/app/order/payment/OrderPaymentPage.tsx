'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@freetheplatform/web-security';

import { CheckoutPayment, CheckoutShell, CheckoutState } from '@/components/checkout/CheckoutShell';
import { getSiteSettings } from '@/lib/api';
import {
  createPackageCheckout,
  getPackageOrderStatus,
  type PackageOrderStatus,
} from '@/lib/packageOrderApi';
import {
  automationDiscovery,
  money,
  purchasePackages,
  type PurchasePackage,
} from '@/lib/servicePricing';
import { stripeConfigured } from '@/lib/stripe';

/** Where each package is chosen, for a customer who wants a different one. */
function chooserHref(order: PackageOrderStatus | null): string {
  return order?.package === 'automation_discovery'
    ? '/automation#packages'
    : '/website-development#packages';
}

function nextSteps(order: PackageOrderStatus): string[] {
  const due = Number(order.due_now);
  const balance = Number(order.price) - due;
  if (balance > 0)
    return [
      'Pay half securely through Stripe.',
      'We get in touch to plan your site.',
      `The other half, ${money(balance)}, is invoiced before launch.`,
    ];
  return ['Pay securely through Stripe.', 'We get in touch to book your discovery session.'];
}

/**
 * Checkout for a package order, found by the reference the order form handed back. Nobody is
 * signed in: the terms were ticked on the form, so Stripe's card fields load straight away and
 * charge what is due now, which is half of a website or all of discovery.
 */
export function OrderPaymentPage({ reference }: { reference: string }) {
  const started = useRef(false);
  const [order, setOrder] = useState<PackageOrderStatus | null>(null);
  const [details, setDetails] = useState<PurchasePackage | undefined>();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [offerChanged, setOfferChanged] = useState(false);

  useEffect(() => {
    if (started.current || !reference) return;
    started.current = true;

    Promise.all([getPackageOrderStatus(reference), getSiteSettings()])
      .then(async ([status, settings]) => {
        setOrder(status);
        setDetails(
          [...purchasePackages(settings), automationDiscovery(settings)].find(
            (item) => item.code === status.package,
          ),
        );
        if (status.paid) return;
        if (!stripeConfigured)
          throw new Error('Stripe is not configured yet. Add the publishable key to continue.');
        const session = await createPackageCheckout(reference);
        setClientSecret(session.client_secret);
      })
      .catch((reason) => {
        if (reason instanceof ApiError && reason.payload?.code === 'offer_changed') {
          setOfferChanged(true);
        } else {
          setError(
            reason instanceof ApiError && reason.status === 404
              ? 'This payment link has expired or is incomplete. Start again from the packages.'
              : reason instanceof Error
                ? reason.message
                : 'Unable to prepare payment.',
          );
        }
      });
  }, [reference]);

  const deposit = order ? Number(order.due_now) < Number(order.price) : false;
  const chooser = chooserHref(order);

  return (
    <CheckoutShell
      productName={order?.package_name ?? 'Your order'}
      order={
        order
          ? {
              price: money(order.due_now),
              dueLabel: deposit ? `today, half of ${money(order.price)}` : 'paid upfront',
            }
          : undefined
      }
      features={details?.includes}
      nextSteps={order ? nextSteps(order) : undefined}
      changeHref={chooser}
      changeLabel="Change package"
    >
      {!reference ? (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Start from the packages."
          body="This link is missing your order. Choose a package and enter your details to reach payment."
          link={{ href: chooser, label: 'Choose a package' }}
        />
      ) : offerChanged ? (
        <CheckoutState
          eyebrow="Terms updated"
          title="Our price or terms have changed."
          body="They changed after you ordered, so nothing can be charged on this link. Choose your package again to see and agree to the current ones."
          link={{ href: chooser, label: 'Choose a package' }}
        />
      ) : order?.paid ? (
        <CheckoutState
          eyebrow="Already paid"
          title="This order is paid."
          body="We emailed you a receipt when the payment went through, and we'll be in touch about what happens next."
        />
      ) : error ? (
        <CheckoutState
          eyebrow="Checkout unavailable"
          title="We could not load payment."
          body={error}
          onRetry={() => window.location.reload()}
        />
      ) : order && clientSecret ? (
        <CheckoutPayment
          heading={`Pay for your ${order.package_name.charAt(0).toLowerCase()}${order.package_name.slice(1)}.`}
          submitLabel={`Pay ${money(order.due_now)}`}
          clientSecret={clientSecret}
          fineprint="The price shown is the total payable today. Your receipt is emailed as soon as Stripe confirms payment."
        />
      ) : (
        <CheckoutState
          eyebrow="Secure checkout"
          title="Preparing payment…"
          body="Connecting your order to Stripe."
        />
      )}
    </CheckoutShell>
  );
}
