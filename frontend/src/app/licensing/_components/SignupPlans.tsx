import Link from 'next/link';

import { SectionNumber } from '@/components/SectionNumber';
import type { LicensingPrices } from '../_lib/plans';
import { SignupPlansPanel } from './SignupPlansPanel';

/* Server shell: only the plan chooser and the form need to hydrate, so the
   section, its heading and the closing note render here. */
export function SignupPlans({ settings, eyebrow }: { settings: LicensingPrices; eyebrow: string }) {
  return (
    <section className="shell scroll-mt-[24px] py-section" id="signup">
      <SignupPlansPanel
        settings={settings}
        heading={
          <>
            <SectionNumber>{eyebrow}</SectionNumber>
            <h2 className="m-0 text-display-1 leading-[1.02] tracking-[-0.058em] text-text-secondary">
              Choose what you need.
            </h2>
          </>
        }
      />

      <p className="mx-0 mt-ml mb-0 text-center text-body text-[var(--slate-600)]">
        Want this built into a custom dealership website instead?{' '}
        <Link
          className="border-b border-[var(--page-accent)] font-heavy text-[var(--page-accent)]"
          href="/dealership-website-builder"
        >
          See the website builder ↗
        </Link>
      </p>
    </section>
  );
}
