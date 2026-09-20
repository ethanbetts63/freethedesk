'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { PortalField } from '@/components/dashboard/PortalField';

import {
  identityImageUrl,
  reviewIdentityImage,
  type IdentityImage,
  type Sale,
} from '@/lib/dealerApi';
import { formatDateTime } from '@/lib/formatting';

/**
 * The three images and their verdicts, reviewed one at a time.
 *
 * A clear licence and an unusable selfie is the ordinary failure, so a
 * rejection asks for that one image again and keeps the others. The reason
 * typed here reaches the customer as a sentence in an email — it is the whole
 * point of asking for one, and "verification failed" would send them back to
 * guess which photograph was the problem.
 *
 * **This whole block is deleted when Stripe Identity lands**, replaced by a
 * verdict and a FileLink URL. It is built knowing that: everything specific to
 * reviewing by hand is here rather than spread through the page.
 */
export function SaleIdentity({
  sale,
  onReviewed,
}: {
  sale: Sale;
  onReviewed: (sale: Sale) => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [reasons, setReasons] = useState<Record<string, string>>({});

  async function review(image: IdentityImage, approved: boolean) {
    const reason = reasons[image.side]?.trim() ?? '';
    if (!approved && !reason) {
      setError(`Say why ${image.label} is not usable. The customer reads it.`);
      return;
    }
    setBusy(image.side);
    setError('');
    try {
      onReviewed(await reviewIdentityImage(sale.reference, image.side, { approved, reason }));
    } catch (reason_) {
      setError(reason_ instanceof Error ? reason_.message : 'That could not be recorded.');
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      {error && <Notice tone="danger">{error}</Notice>}

      {sale.identity.is_verified ? (
        <Notice tone="success">
          Identity verified {formatDateTime(sale.identity.verified_at)}.
        </Notice>
      ) : (
        <p className="mt-0 mb-ml text-label leading-[1.6] text-text-muted">
          A vehicle is about to be licensed in this person&rsquo;s name. Check each photo against
          the licence details on this sale before you approve it.
        </p>
      )}

      <ul className="m-0 grid list-none gap-ml p-0">
        {sale.identity.images.map((image) => (
          <li
            key={image.side}
            className="grid gap-m rounded-sm border border-border-default p-m sm:grid-cols-[220px_minmax(0,1fr)]"
          >
            <div>
              {image.uploaded ? (
                // Unoptimised on purpose: Next's image optimiser would fetch
                // this through its own proxy, which has no sale cookie and no
                // dealer session, and would cache a driver's licence on the
                // edge if it did.
                <Image
                  src={identityImageUrl(sale.reference, image.side)}
                  alt={image.label}
                  width={220}
                  height={140}
                  unoptimized
                  className="h-auto w-full rounded-xs border border-border-default"
                />
              ) : (
                <div className="flex h-[140px] items-center justify-center rounded-xs border border-dashed border-border-default text-caption text-text-subtle">
                  Not sent yet
                </div>
              )}
            </div>
            <div>
              <strong className="block text-body-sm first-letter:uppercase">{image.label}</strong>
              <p className="mt-2xs mb-m text-caption text-text-subtle first-letter:uppercase">
                {image.status}
                {image.reason && ` — ${image.reason}`}
              </p>

              {image.uploaded && image.status !== 'approved' && (
                <div className="grid gap-s">
                  <PortalField
                    label="Why not, if you are rejecting it"
                    value={reasons[image.side] ?? ''}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [image.side]: event.target.value,
                      }))
                    }
                    multiline
                    rows={2}
                    hint="This sentence is emailed to the customer as written."
                  />
                  <div className="flex gap-xs">
                    <Button disabled={busy === image.side} onClick={() => review(image, true)}>
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busy === image.side}
                      onClick={() => review(image, false)}
                    >
                      Ask for it again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
