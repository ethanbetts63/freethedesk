import Image from 'next/image';
import { Banknote, Coins, Radio, Repeat } from 'lucide-react';

import { type PublicSiteSettings } from '@/lib/api';
import { selectionHeadingClassName } from '@/components/forms/selectionFormClassNames';

import { affiliateEarnings, FREE_AUDIT_CODE } from '../_lib/copy';

/**
 * The left half of the affiliate sign-up panel, where the service pages put their packages.
 * Three candidates to compare; the one that stays becomes the only export.
 */
export type PitchVariant = 'payouts' | 'versus' | 'studio';

const labelClassName = 'text-label font-strong tracking-label text-action-primary uppercase';

/** A stack of payouts as they'd land: the money, made concrete. */
function Payouts({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const byCode = Object.fromEntries(earnings.map((earning) => [earning.code, earning]));
  const payouts = [
    { ...byCode[FREE_AUDIT_CODE], when: 'Today' },
    { ...byCode.complete, when: 'Tuesday' },
    { ...byCode.essentials, when: 'Last week' },
  ].filter((payout) => payout.code);
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className={labelClassName}>What lands in your account</p>
      <ul className="m-0 mt-m grid list-none gap-xs p-0">
        {payouts.map((payout) => (
          <li
            key={payout.code}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-m border border-border-default bg-surface-page px-m py-s"
          >
            <span
              aria-hidden="true"
              className="flex size-[40px] items-center justify-center rounded-full bg-surface-tint-strong text-text-action"
            >
              <Banknote className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-body font-strong text-text-secondary">
                Payout from freethedesk
              </span>
              <span className="block text-body-sm text-text-muted">
                {payout.name} audit · code TRADIE20 · {payout.when}
              </span>
            </span>
            <span className="text-title leading-none tracking-[-0.05em] text-text-secondary">
              <span className="moving-colour-text">{payout.share}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 mt-m text-body text-text-muted">
        Half of every audit bought with your code, paid through Stripe.
      </p>
    </div>
  );
}

/** A sponsor read against your code: paid once against paid every time. */
function Versus({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="grid grid-cols-1 gap-4xs bg-border-default sm:grid-cols-2">
        <div className="bg-surface-page py-l pr-l">
          <Radio className="size-6 text-text-subtle" aria-hidden="true" />
          <p className="m-0 mt-m text-lead tracking-[-0.03em] text-text-muted">A sponsor read</p>
          <p className="m-0 mt-2xs text-body text-text-subtle">Paid once, per episode.</p>
          <div className="mt-l flex gap-2xs" aria-hidden="true">
            <Coins className="size-7 text-text-subtle" />
          </div>
        </div>
        <div className="bg-surface-page py-l sm:pl-l">
          <Repeat className="size-6 text-text-action" aria-hidden="true" />
          <p className="m-0 mt-m text-lead tracking-[-0.03em] text-text-secondary">Your code</p>
          <p className="m-0 mt-2xs text-body text-text-muted">
            Paid on every sale, for as long as people listen.
          </p>
          <div className="mt-l flex gap-2xs" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <Coins key={index} className="size-7 text-text-action" />
            ))}
          </div>
        </div>
      </div>
      <p className="m-0 mt-l text-lead tracking-[-0.03em] text-text-secondary">
        <span className="moving-colour-text">
          {lowest.share} to {highest.share}
        </span>{' '}
        every time. Old episodes keep selling.
      </p>
    </div>
  );
}

/** The studio, and one line about what a mention there is worth. */
function Studio({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <Image
        src="/images/affiliates/studio.webp"
        alt="A podcast studio: three microphones around a table, under an On Air sign"
        width={1200}
        height={800}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="block h-auto w-full"
      />
      <h3 className={`${selectionHeadingClassName} mt-l`}>
        One mention. <span className="moving-colour-text">{highest.share}.</span>
      </h3>
      <p className="m-0 mt-s text-body text-text-muted">
        Half of every audit a listener buys with your code: {lowest.share} to {highest.share} each,
        paid through Stripe.
      </p>
    </div>
  );
}

export function AffiliatePitch({
  variant,
  settings,
}: {
  variant: PitchVariant;
  settings: PublicSiteSettings;
}) {
  if (variant === 'versus') return <Versus settings={settings} />;
  if (variant === 'studio') return <Studio settings={settings} />;
  return <Payouts settings={settings} />;
}
