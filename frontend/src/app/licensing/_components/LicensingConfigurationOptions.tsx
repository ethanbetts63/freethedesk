import Link from 'next/link';

import { SectionNumber } from '@/components/SectionNumber';

import { FlowCompare } from './FlowCompare';
import { LicensingNextStepPhone } from './LicensingNextStepPhone';
import { LoginPreviewPhone } from './LoginPreviewPhone';

export function LicensingConfigurationOptions({ eyebrow }: { eyebrow: string }) {
  return (
    <section className="bg-surface-dark py-section text-text-on-dark" id="configuration-options">
      <div className="shell grid grid-cols-[minmax(0,1fr)] items-start gap-[clamp(55px,8vw,110px)] min-[900px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2 className="m-0 text-display-3 leading-[0.94] tracking-[-0.07em] sm:text-display-5">
            Our portal or <span className="moving-colour-text">your website.</span>
          </h2>
          <p className="mt-ml max-w-[440px] text-lead leading-[1.7] text-[var(--slate-300)]">
            Use the hosted product with the website you already have, or make it a seamless part of
            a dealership site we build.
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-center gap-xl sm:flex-nowrap sm:gap-2xl">
          <div className="flex flex-col items-center">
            <LoginPreviewPhone />
            <p className="mx-0 mt-m mb-0 text-small font-control text-text-on-dark">
              Hosted portal
            </p>
          </div>
          <div className="flex flex-col items-center">
            <LicensingNextStepPhone />
            <p className="mx-0 mt-m mb-0 text-small font-control text-text-on-dark">
              Built into your website
            </p>
            <Link
              className="mt-xs inline-flex cursor-pointer items-center gap-xs border-0 border-b border-[color-mix(in_srgb,var(--surface-page)_50%,transparent)] bg-none pb-3xs font-[inherit] text-caption font-heavy text-[var(--slate-200)]"
              href="/portfolio/scooter-shop"
            >
              See the Scooter Shop approach <b>↗</b>
            </Link>
          </div>
        </div>
      </div>
      <div className="shell">
        <FlowCompare />
      </div>
    </section>
  );
}
