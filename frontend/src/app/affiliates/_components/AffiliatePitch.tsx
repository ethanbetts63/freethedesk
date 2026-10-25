import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';

import { PRICE_FIELD, type SeoPlanCode } from '@/app/seo/_lib/plans';
import { AFFILIATE_SHARE, affiliateEarnings, FREE_AUDIT_CODE } from '../_lib/copy';

/**
 * The left half of the affiliate sign-up panel, where the service pages put their packages.
 * Three candidates to compare; the one that stays becomes the only export.
 */
export type PitchVariant = 'figure' | 'ladder' | 'code';

const figureClassName = 'm-0 text-hero leading-[0.9] tracking-[-0.06em] text-text-secondary';
const labelClassName = 'text-label font-strong tracking-label text-action-primary uppercase';

/** One giant number: the most an audit pays, and the range under it. */
function Figure({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className={labelClassName}>What one mention can pay</p>
      <p className={`${figureClassName} mt-m`}>
        <span className="moving-colour-text">{highest.share}</span>
      </p>
      <p className="m-0 mt-m text-lead leading-snug tracking-[-0.03em] text-text-secondary">
        for one audit, from one listener.
      </p>
      <p className="m-0 mt-s text-body text-text-muted">
        Half of every audit sold with your code: {lowest.share} to {highest.share} each.
      </p>
    </div>
  );
}

/** What a show earns at a few audits a month, on the audit most people buy. */
function Ladder({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const typical = earnings.find((earning) => earning.code === FREE_AUDIT_CODE) ?? earnings[0];
  const perAudit = Number(settings[PRICE_FIELD[typical.code as SeoPlanCode]]) * AFFILIATE_SHARE;
  const rungs = [2, 5, 10].map((count) => ({
    count,
    total: formatMoney(perAudit * count, { cents: 'auto' }),
  }));
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className={labelClassName}>What one mention a month is worth</p>
      <dl className="m-0 mt-m">
        {rungs.map((rung) => (
          <div
            key={rung.count}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-m border-t border-border-subtle py-m"
          >
            <dt className="text-lead tracking-[-0.03em] text-text-secondary">
              {rung.count} audits a month
            </dt>
            <dd className="m-0 text-title leading-none tracking-[-0.05em] text-text-secondary">
              <span className="moving-colour-text">{rung.total}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="m-0 mt-m text-body text-text-muted">
        To you, every month. {typical.share} for each {typical.name} audit, half its price.
      </p>
    </div>
  );
}

/** A mock of the thing the host gets: their code, and what it does for each side. */
function Code({ settings }: { settings: PublicSiteSettings }) {
  const earnings = affiliateEarnings(settings);
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <p className={labelClassName}>Your code</p>
      <div className="mt-m border border-border-strong bg-surface-page">
        <div className="border-b border-dashed border-border-strong px-l py-ml">
          <span className="block text-label font-strong tracking-label text-text-muted uppercase">
            Listeners enter
          </span>
          <span className="mt-2xs block text-title leading-none font-black tracking-[0.08em] text-text-secondary">
            TRADIE20
          </span>
          <span className="mt-xs block text-body text-text-muted">20% off any audit</span>
        </div>
        <div className="px-l py-ml">
          <span className="block text-label font-strong tracking-label text-text-muted uppercase">
            You get
          </span>
          <span className="mt-2xs block text-title leading-none tracking-[-0.05em] text-text-secondary">
            <span className="moving-colour-text">
              {lowest.share} to {highest.share}
            </span>
          </span>
          <span className="mt-xs block text-body text-text-muted">
            per audit, half the price, paid through Stripe
          </span>
        </div>
      </div>
      <p className="m-0 mt-m text-body text-text-muted">
        One code, to say on air or put in the show notes. Every audit bought with it is yours.
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
  if (variant === 'ladder') return <Ladder settings={settings} />;
  if (variant === 'code') return <Code settings={settings} />;
  return <Figure settings={settings} />;
}
