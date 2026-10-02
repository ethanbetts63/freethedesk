import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
import { buildRecurringOffer } from '@/lib/seo';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer } from '@/lib/serverApi';

import { LicensingAdditionalFeatures } from './_components/LicensingAdditionalFeatures';
import { LicensingConfigurationOptions } from './_components/LicensingConfigurationOptions';
import { LicensingFill } from './_components/LicensingFill';
import { LicensingIntroduction } from './_components/LicensingIntroduction';
import { LicensingSign } from './_components/LicensingSign';
import { LicensingStepsBar } from './_components/LicensingStepsBar';
import { LicensingVerify } from './_components/LicensingVerify';
import { SignupPlans } from './_components/SignupPlans';
import { LICENSING_FAQS } from './_lib/copy';
import { buildDealerPlans, PRICE_FIELD } from './_lib/plans';

const sections = numberSections([
  'Fill',
  'Verify',
  'Sign',
  'Additional features',
  'Two ways to use it',
  'Choose your plan',
  'Common questions',
  'Remove the barrier',
] as const);

export const metadata: Metadata = metadataFor('/licensing');

/* Pricing comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default async function LicensingPage() {
  const settings = await getSiteSettingsServer();

  // One offer per plan, priced from the same admin settings the plan cards show.
  const serviceOffers = buildDealerPlans(settings).flatMap((plan) => {
    const price = settings[PRICE_FIELD[plan.code]];
    const offer = buildRecurringOffer({ price, unitText: 'MONTH', name: plan.name });
    return offer ? [offer] : [];
  });

  return (
    <main className="bg-surface-page text-text-primary">
      <PageSchema
        path="/licensing"
        serviceOffers={serviceOffers.length ? serviceOffers : undefined}
      />
      <Hero
        path="/licensing"
        eyebrow="Online vehicle licensing Perth"
        titleLines={['License online.']}
        accentTitle="Lose the visit."
        accentAlternates={['Lose the paperwork.', 'Lose the scanner.', 'Lose the wait.']}
        lead="Use our portal or build it into your website. Perth customers fill in their details, verify their identity and sign online, with no trip across town to the dealership."
        primaryHref="#signup"
        primaryLabel="Choose your plan"
        secondaryHref="/contact"
        secondaryLabel="Talk to us"
      />

      <LicensingStepsBar />

      <LicensingIntroduction />

      <LicensingFill eyebrow={sections['Fill']} />
      <LicensingVerify eyebrow={sections['Verify']} />
      <LicensingSign eyebrow={sections['Sign']} />
      <LicensingAdditionalFeatures eyebrow={sections['Additional features']} />

      <LicensingConfigurationOptions eyebrow={sections['Two ways to use it']} />
      <SignupPlans settings={settings} eyebrow={sections['Choose your plan']} />

      <FloatingPageCta
        label="Choose your plan"
        href="#signup"
        showAfterId="licensing-hero-end"
        hideAtId="signup"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Online licensing questions."
        items={LICENSING_FAQS}
      />

      <ManualAdminCta
        eyebrow={sections['Remove the barrier']}
        title="A signature shouldn't require an appointment."
        href="#signup"
        buttonLabel="Choose your plan"
      >
        Let customers fill, verify and sign from anywhere in Perth or regional WA. The paperwork
        travels—not the customer.
      </ManualAdminCta>
    </main>
  );
}
