'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PortalField } from '@/components/dashboard/PortalField';
import type { IdentityImage } from '@/lib/dealerApi';
import {
  getCustomerSale,
  submitIdentity,
  uploadIdentityImage,
  type CustomerSale,
} from '@/lib/saleApi';

/**
 * The Verify step: three photographs, each with its own state.
 *
 * Three, not one, because a clear licence and an unusable selfie is the
 * ordinary failure and one verdict across three files makes the customer redo
 * all of it. A rejection comes back as the dealer's own sentence, attached to
 * the photograph it is about.
 *
 * The whole step is replaced by a Stripe Identity redirect later. It is written
 * to be deleted: it reads `sale.identity` and knows nothing about how a verdict
 * got there.
 */
export function SaleVerify({
  sale,
  onChanged,
}: {
  sale: CustomerSale;
  onChanged: (sale: CustomerSale) => void;
}) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const identity = sale.identity;

  async function send(image: IdentityImage, file: File | undefined) {
    if (!file) return;
    setBusy(image.side);
    setError('');
    try {
      await uploadIdentityImage(sale.reference, image.side, file);
      // The upload endpoint returns the identity block; the whole sale is
      // re-read so the checklist and the step bar move with it rather than
      // reporting two different answers.
      onChanged(await getCustomerSale(sale.reference));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That photo could not be sent.');
    } finally {
      setBusy('');
    }
  }

  async function submit() {
    setBusy('submit');
    setError('');
    try {
      onChanged(await submitIdentity(sale.reference));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That could not be submitted.');
    } finally {
      setBusy('');
    }
  }

  if (identity.is_verified)
    return <Notice tone="success">Your identity has been checked. Thank you.</Notice>;

  const everythingSent = identity.images.every(
    (image) => image.status === 'submitted' || image.status === 'approved',
  );

  return (
    <>
      <p className="mt-0 mb-ml text-body-sm leading-relaxed text-text-muted">
        A vehicle is about to be licensed in your name, so {sale.dealer_name} has to see photo
        identification first. <strong>A person at the dealership looks at these</strong> — it is not
        a machine, and it is not instant. We will email you if anything needs doing again.
      </p>

      {identity.rejection_reason && <Notice tone="warning">{identity.rejection_reason}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}

      <ul className="m-0 grid list-none gap-ml p-0">
        {identity.images.map((image) => (
          <li key={image.side} className="rounded-sm border border-border-default p-m">
            <strong className="block text-body-sm first-letter:uppercase">{image.label}</strong>
            <p className="mt-2xs mb-s text-caption text-text-subtle">{stateOf(image)}</p>
            {image.status !== 'approved' && (
              <PortalField
                label="Choose a photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                disabled={busy === image.side}
                onChange={(event) => send(image, event.target.files?.[0])}
                hint="JPG, PNG or WebP. Take it in good light and make sure every corner is in the frame."
              />
            )}
          </li>
        ))}
      </ul>

      {identity.status !== 'submitted' && (
        <div className="mt-l">
          <Button disabled={!everythingSent || busy === 'submit'} onClick={submit}>
            {busy === 'submit' ? 'Sending…' : 'Send these to the dealer'}
          </Button>
          {!everythingSent && (
            <p className="mt-xs mb-0 text-caption text-text-subtle">Send all three photos first.</p>
          )}
        </div>
      )}

      {identity.status === 'submitted' && (
        <Notice tone="success">
          Sent. {sale.dealer_name} will look at these — usually within a business day.
        </Notice>
      )}
    </>
  );
}

function stateOf(image: IdentityImage): string {
  if (image.status === 'approved') return 'Approved.';
  if (image.status === 'rejected') return image.reason || 'Needs sending again.';
  if (image.status === 'submitted') return 'Sent, waiting to be looked at.';
  return 'Not sent yet.';
}
