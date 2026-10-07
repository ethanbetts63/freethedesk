import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { Hero } from '@/components/marketing/Hero';
import { IndexedFeatureSection } from '@/components/marketing/IndexedFeatureSection';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import { WebsiteJobsBar } from '@/components/marketing/WebsiteJobsBar';
import { FloatingPageCta } from '@/components/FloatingPageCta';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';
import { numberSections } from '@/lib/sectionNumbers';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';

import { RateCard } from './_components/RateCard';
import { ServicePriceList } from './_components/ServicePriceList';
import { priceRows, pricingFaqs, pricingPrinciples } from './_lib/copy';

const sections = numberSections([
  'Hourly rate',
  'How we price',
  'Every service',
  'Common questions',
] as const);

export const metadata: Metadata = metadataFor('/pricing');

/* Every figure comes from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

/*
 * Checkout prices as well as service prices: the list quotes the SEO audit and
 * licensing "from" figures too.
 */
const REQUIRED = [
  ...SERVICE_PRICE_FIELDS,
  'seo_monthly_price',
  'seo_quarterly_price',
  'seo_yearly_price',
  'seo_oneoff_price',
  'licensing_price',
  'contracts_price',
  'complete_price',
] as const;

export default async function PricingPage() {
  const prices = servicePrices(await getSiteSettingsServer(REQUIRED));

  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/pricing" />
      <Hero
        path="/pricing"
        eyebrow="Pricing Perth"
        titleLines={['Our prices,']}
        accentTitle="published."
        lead={`Most developers make you book a call before they mention a number. Ours are on this page: ${prices.hourlyRate} an hour, website packages from ${prices.websiteFrom}, and a budget-first option if you would rather start there.`}
        primaryHref="#services"
        primaryLabel="See every price"
        secondaryHref="/website-development#packages"
        secondaryLabel="Compare website packages"
      />

      <WebsiteJobsBar
        id="pricing-hero-end"
        steps={['Published rates', 'Paid discovery', 'Your budget, your call']}
        ariaLabel="How freethedesk prices its work"
      />

      <RateCard eyebrow={sections['Hourly rate']} prices={prices} />

      <IndexedFeatureSection
        id="how-we-price"
        eyebrow={sections['How we price']}
        title="Three ways"
        accentTitle="to a price."
        lead="Fixed packages where the work is predictable, the hourly rate where it is not, and your budget as the starting point if you would rather we work backwards."
        items={pricingPrinciples(prices)}
      />

      <ServicePriceList eyebrow={sections['Every service']} rows={priceRows(prices)} />

      <ProjectEnquiry
        id="enquiry"
        eyebrow={null}
        lead="Give us your budget and what you need, and we'll tell you the most valuable thing we can build within it."
      />

      <FloatingPageCta
        label="Tell us your budget"
        href="#enquiry"
        showAfterId="pricing-hero-end"
        hideAtId="enquiry"
      />

      <FaqSection
        emitSchema
        eyebrow={sections['Common questions']}
        title="Pricing questions."
        items={pricingFaqs(prices)}
      />

      <ManualAdminCta
        eyebrow="Want a number for your project?"
        title="Tell us what you need."
        href="#enquiry"
        buttonLabel="Tell us your budget"
      >
        Describe the job in a sentence and we&apos;ll tell you whether it is a package, an hourly
        job or a project that starts with discovery.
      </ManualAdminCta>
    </main>
  );
}
