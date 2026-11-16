import type { Metadata } from 'next';

import { FaqSection } from '@/components/marketing/FaqSection';
import { RelatedPages } from '@/components/marketing/RelatedPages';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

import { HOME_FAQS } from './_lib/copy';

import { AiReadinessBanner } from '@/components/marketing/AiReadinessBanner';
import { AutomationFeature } from './_components/AutomationFeature';
import { HomePricingMosaic } from './_components/HomePricingMosaic';
import { HomeSeoFeature } from './_components/HomeSeoFeature';
import { Hero } from '@/components/marketing/Hero';
import { CallRequest } from '@/components/marketing/CallRequest';
import { WebsiteDevelopmentFeature } from './_components/WebsiteDevelopmentFeature';

export const metadata: Metadata = metadataFor('/');

/* The price mosaic reads every figure from the admin, so this page renders per request. */
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="bg-surface-page text-text-primary">
      <PageSchema path="/" />
      <AiReadinessBanner />
      <Hero
        titleLines={['Websites, SEO and business automation']}
        accentTitle="in Perth"
        lead="Connected websites, SEO and automation for Perth businesses, built to bring customers in and take the repetitive work off your team."
        primaryHref="/contact"
        primaryLabel="Get in touch"
        secondaryHref="/portfolio/scooter-shop"
        secondaryLabel="See it in action"
      />

      <HomePricingMosaic />
      <HomeSeoFeature />
      <WebsiteDevelopmentFeature />
      <AutomationFeature />
      <CallRequest source="/" title="Ready to be found?" />
      <FaqSection
        emitSchema
        eyebrow="Common questions"
        title="Websites, SEO and automation: common questions"
        items={HOME_FAQS}
      />
      <RelatedPages path="/" />
    </main>
  );
}
