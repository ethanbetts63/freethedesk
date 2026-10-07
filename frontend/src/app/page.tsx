import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { ManualAdminCta } from '@/components/ManualAdminCta';
import { PageSchema } from '@/components/PageSchema';
import { ProcessStepsBar } from '@/components/ProcessStepsBar';
import { metadataFor } from '@/lib/pages';

import { HOME_FAQS } from './_lib/copy';

import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
import { AutomationFeature } from './_components/AutomationFeature';
import { HomeSeoFeature } from './_components/HomeSeoFeature';
import { DealerWebsiteSection } from '@/components/marketing/DealerWebsiteSection';
import { FlagshipCheckout } from '@/components/marketing/FlagshipCheckout';
import { Hero } from '@/components/marketing/Hero';
import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';
import { WebsiteDevelopmentFeature } from './_components/WebsiteDevelopmentFeature';

export const metadata: Metadata = metadataFor('/');

export default function Home() {
  return (
    <main className="bg-surface-page text-text-primary">
      <PageSchema path="/" />
      <AiReadinessBanner />
      <Hero
        eyebrow="Websites, SEO & automation Perth"
        titleLines={['Help your business']}
        accentTitle="get found."
        accentAlternates={['win customers.', 'lose the admin.', 'grow faster.']}
        lead="Connected websites, SEO and automation for Perth businesses, built to bring customers in and take the repetitive work off your team."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <ProcessStepsBar
        id="home-hero-end"
        ariaLabel="How we make your website work harder"
        steps={['Get found', 'Get customers', 'Get time back']}
      />

      <WebsiteDevelopmentFeature />
      <AutomationFeature />
      <FlagshipCheckout />
      <HomeSeoFeature />
      <DealerWebsiteSection eyebrow="For dealerships" id="dealerships" overview />
      <ProjectEnquiry />
      <FaqSection
        emitSchema
        eyebrow="Common questions"
        title="Questions about working with us."
        items={HOME_FAQS}
      />
      <ManualAdminCta buttonLabel="Get in touch" />
    </main>
  );
}
