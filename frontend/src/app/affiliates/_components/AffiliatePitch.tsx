import Image from 'next/image';

import { type PublicSiteSettings } from '@/lib/api';

import { affiliateEarnings } from '../_lib/copy';

/**
 * The left half of the affiliate sign-up panel, where the service pages put their packages.
 * The studio photo fills the column, with the words set over its darkened foot.
 */

function range(settings: PublicSiteSettings) {
  const earnings = affiliateEarnings(settings);
  return { lowest: earnings[0], highest: earnings[earnings.length - 1] };
}

export function AffiliatePitch({ settings }: { settings: PublicSiteSettings }) {
  const { lowest, highest } = range(settings);
  return (
    // Bleeds to the panel's edges; the foot stays clear below lg, where the open button follows.
    <div className="relative -mx-ml -mt-ml flex flex-1 flex-col justify-end sm:-mx-2xl sm:-mt-2xl lg:-mb-2xl">
      <Image
        src="/images/affiliates/studio.webp"
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--surface-inverse)_88%,transparent)_0%,color-mix(in_srgb,var(--surface-inverse)_45%,transparent)_45%,transparent_75%)]"
      />
      <div className="relative min-h-[420px] px-ml pt-3xl pb-xl sm:px-2xl sm:pb-2xl">
        <div className="flex h-full flex-col justify-end">
          <p className="text-label font-strong tracking-label text-accent-on-dark uppercase">
            Affiliate program
          </p>
          <h3 className="m-0 mt-s text-display leading-[1.02] tracking-[-0.058em] text-text-on-dark">
            Your word. Our work. <span className="block text-accent-on-dark">Half each.</span>
          </h3>
          <p className="m-0 mt-s text-body text-text-on-dark-muted">
            Receive a complimentary audit and {lowest.share} to {highest.share} for every one sold.
          </p>
        </div>
      </div>
    </div>
  );
}
