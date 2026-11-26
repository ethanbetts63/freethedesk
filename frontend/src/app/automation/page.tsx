import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { CallRequest } from '@/components/marketing/CallRequest';
import { AdminAutomationSection } from '@/components/marketing/AdminAutomationSection';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { ServicePackages } from '@/components/marketing/ServicePackages';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { buildOneOffOffer } from '@/lib/seo';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { automationDiscovery, offerName } from '@/lib/servicePricing';

import { AutomationBudgetSplit } from './_components/AutomationBudgetSplit';
import { AutomationIdentify } from './_components/AutomationIdentify';
import { AutomationIntroduction } from './_components/AutomationIntroduction';
import { AutomationWorkflowList } from './_components/AutomationWorkflowList';
import { AUTOMATION_FAQS } from './_lib/copy';

const sections = numberSections([
  'What to automate',
  'Automation budget',
  'Business automation',
  'Automation examples',
  'Automation questions',
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
        titleLines={['Business and AI automation']}
        accentTitle="for Perth businesses"
        lead="We connect the systems your Perth business already uses and build the missing pieces, so information moves while your team stays focused on customers."
        primaryHref="#packages"
        primaryLabel="Automate your admin"
        secondaryHref="#workflows"
        secondaryLabel="Explore workflows"
      />

      <ServicePackages
        title="Automation package"
        lead="Automation starts with discovery: we map your repetitive work and write a scope, then price the build to your budget."
        packages={[discovery]}
      />

      <AutomationIntroduction />

      <AutomationIdentify eyebrow={sections['What to automate']} />
      <AutomationBudgetSplit eyebrow={sections['Automation budget']} />
      <AdminAutomationSection
        id="automate"
        eyebrow={sections['Business automation']}
        spacing="joined"
      />
      <AutomationWorkflowList eyebrow={sections['Automation examples']} />

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
        eyebrow={sections['Automation questions']}
        title="Business automation questions."
        items={AUTOMATION_FAQS}
      />
      <CallRequest id="page-cta" source="/automation" title="Ready to automate the busywork?" />
      <RelatedPages path="/automation" />
    </main>
  );
}
