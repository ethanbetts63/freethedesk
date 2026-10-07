import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { AdminAutomationSection } from '@/components/marketing/AdminAutomationSection';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { PackagesSection } from '@/components/marketing/PackagesSection';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { automationDiscovery, offerName } from '@/lib/servicePricing';

import { AutomationBudgetSplit } from './_components/AutomationBudgetSplit';
import { AutomationIdentify } from './_components/AutomationIdentify';
import { AutomationIntroduction } from './_components/AutomationIntroduction';
import { AutomationStepsBar } from './_components/AutomationStepsBar';
import { AutomationWorkflowList } from './_components/AutomationWorkflowList';
import { AUTOMATION_FAQS } from './_lib/copy';

const sections = numberSections([
  'Identify',
  'Budget',
  'Automate',
  'Examples',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/automation');

/* Discovery is priced from the admin's hourly rate, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default async function AutomationPage() {
  const discovery = automationDiscovery(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));

  return (
    <main>
      <PageSchema
        path="/automation"
        serviceOffers={buildOneOffOffer({ price: discovery.price, name: offerName(discovery) })}
      />
      <Hero
        path="/automation"
        eyebrow="Business automation Perth"
        titleLines={['Less repetition.']}
        accentTitle="More progress."
        accentAlternates={['More selling.', 'Fewer errors.', 'More weekends.']}
        lead="We connect the systems your Perth business already uses and build the missing pieces, so information moves while your team stays focused on customers."
        primaryHref="#packages"
        primaryLabel="Automate your admin"
        secondaryHref="#workflows"
        secondaryLabel="Explore workflows"
      />

      <AutomationStepsBar />

      <PackagesSection
        packages={[discovery]}
        budget={{
          projectType: 'automation',
          includes: [
            'Give us a number and the work that eats your week',
            'We reply with what it automates',
            'Free to ask',
          ],
        }}
      />

      <AutomationIntroduction />

      <AutomationIdentify eyebrow={sections['Identify']} />
      <AutomationBudgetSplit eyebrow={sections['Budget']} />
      <AdminAutomationSection id="automate" eyebrow={sections['Automate']} spacing="joined" />
      <AutomationWorkflowList eyebrow={sections['Examples']} />

      <FloatingPageCta
        label="Automate your admin"
        href="#packages"
        direction="up"
        // After the pricing, so it never sits over the Buy now button.
        showAfterId="packages-end"
        hideAtId="page-cta"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Business automation questions."
        items={AUTOMATION_FAQS}
      />
      <ManualAdminCta id="page-cta" href="#packages" buttonLabel="Automate your admin" />
    </main>
  );
}
