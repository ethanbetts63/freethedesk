'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { PortalStep, PortalSteps } from '@/components/dashboard/PortalSteps';
import { cardClassName, cardTitleClassName } from '@/components/ui/Card';
import { pageClassName } from '@/components/ui/layout';
import { Button } from '@/components/ui/Button';
import {
  acknowledgeWarranty,
  customerWarrantyNoticeUrl,
  downloadCustomerDocument,
  getCustomerSale,
  type CustomerSale,
} from '@/lib/saleApi';
import { SaleFill } from '../_components/SaleFill';
import { SaleSummary } from '../_components/SaleSummary';
import { SaleVerify } from '../_components/SaleVerify';

/** Rendered from `next_action`, which the server derives. The screen never
 * decides for itself what comes next — that is the requirements engine's job,
 * and two answers to it disagree eventually. */
const STEPS = [
  ['details', 'Your details'],
  ['verify', 'Prove who you are'],
  ['sign', 'Read and sign'],
  ['payment', 'Pay'],
] as const;

export default function CustomerSalePage() {
  const { reference } = useParams<{ reference: string }>();
  const [sale, setSale] = useState<CustomerSale | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getCustomerSale(reference)
      .then((result) => {
        if (active) setSale(result);
      })
      .catch(() => {
        // Any failure here means the same thing to the customer: they are not
        // holding a usable cookie for this sale. Show them the way in rather
        // than an error they cannot act on.
        if (active) setNeedsPassword(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reference]);

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your sale…</p>
      </div>
    );

  // No usable cookie for this sale. The way in is the emailed link, or the
  // account — the reference+password sale login is retired.
  if (!sale || needsPassword)
    return (
      <div className={pageClassName}>
        <PageHeader
          kicker="Your vehicle paperwork"
          title="This device is not signed in to this sale"
          subtitle="Open the link from the email we sent you, or sign in to your account and open the sale from there."
        />
        <Button href="/login?next=/dashboard/user">Sign in to your account</Button>
      </div>
    );

  const step = sale.requirements.next_action;

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker={sale.dealer_name}
        title="Your vehicle paperwork"
        subtitle={`Reference ${sale.reference}. Nothing here is binding until ${sale.dealer_name} accepts your offer.`}
      />

      {error && <Notice tone="danger">{error}</Notice>}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-xl lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="grid gap-xl">
          <section className={cardClassName}>
            <h2 className={cardTitleClassName}>Where you are up to</h2>
            <PortalSteps>
              {STEPS.map(([key, label]) => (
                <PortalStep key={key} title={label}>
                  {key === step ? 'You are here.' : stepState(sale, key)}
                </PortalStep>
              ))}
            </PortalSteps>
          </section>

          {step === 'details' && (
            <section className={cardClassName}>
              <h2 className={cardTitleClassName}>Your details</h2>
              <SaleFill sale={sale} onSaved={setSale} />
            </section>
          )}

          {step === 'verify' && (
            <section className={cardClassName}>
              <h2 className={cardTitleClassName}>Prove who you are</h2>
              <SaleVerify sale={sale} onChanged={setSale} />
            </section>
          )}

          {step === 'sign' && (
            <section className={cardClassName}>
              <h2 className={cardTitleClassName}>{sale.warranty.title}</h2>
              <p className="mt-0 mb-m text-body-sm leading-relaxed text-text-muted">
                {sale.warranty.summary}
              </p>
              {sale.warranty.kind !== 'manufacturer' && (
                <div className="mb-m">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      downloadCustomerDocument(
                        customerWarrantyNoticeUrl(sale.reference),
                        `${sale.warranty.kind}.pdf`,
                      ).catch((reason) =>
                        setError(
                          reason instanceof Error ? reason.message : 'That form is not ready yet.',
                        ),
                      )
                    }
                  >
                    Read the form
                  </Button>
                </div>
              )}
              {sale.warranty.acknowledged ? (
                <Notice tone="success">
                  You have confirmed you read this. The documents to sign open next.
                </Notice>
              ) : (
                <>
                  <p className="m-0 mb-m text-label leading-relaxed">{sale.warranty.statement}</p>
                  <Button
                    onClick={() =>
                      acknowledgeWarranty(sale.reference, sale.warranty.acknowledgement_key)
                        .then(setSale)
                        .catch((reason) =>
                          setError(
                            reason instanceof Error
                              ? reason.message
                              : 'That could not be recorded.',
                          ),
                        )
                    }
                  >
                    I have read this
                  </Button>
                </>
              )}
            </section>
          )}

          {step === 'payment' && (
            <section className={cardClassName}>
              <h2 className={cardTitleClassName}>Pay</h2>
              <p className="m-0 text-body-sm leading-relaxed text-text-muted">
                {sale.dealer_name} will send you their account details. This step opens shortly.
              </p>
            </section>
          )}

          {step === 'done' && (
            <section className={cardClassName}>
              <h2 className={cardTitleClassName}>All done</h2>
              <p className="m-0 text-body-sm leading-relaxed text-text-muted">
                Nothing is waiting on you. Anything from here is a conversation with{' '}
                {sale.dealer_name}.
              </p>
            </section>
          )}
        </div>

        <SaleSummary sale={sale} />
      </div>

      <p className="mt-xl text-caption text-text-subtle">
        Using this service is subject to our{' '}
        <Link href="/legal/customer-terms">customer terms</Link> and{' '}
        <Link href="/legal/privacy">privacy policy</Link>. Everything you enter here is given to{' '}
        {sale.dealer_name}, who needs it to license the vehicle in your name.
      </p>
    </div>
  );
}

function stepState(sale: CustomerSale, key: string): string {
  const done = {
    details: sale.requirements.details_complete,
    verify: sale.requirements.identity_verified,
    sign: sale.requirements.documents_signed,
    payment: sale.requirements.payment_confirmed,
  }[key];
  return done ? 'Done.' : 'Not yet.';
}
