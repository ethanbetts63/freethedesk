import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { FaqSection } from '@/components/marketing/FaqSection';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

import { BUILDER_FAQS } from './_lib/copy';
import { WebsiteConfigurator } from './_components/WebsiteConfigurator';

export const metadata: Metadata = metadataFor('/dealership-website-builder');

export default function WebsiteBuilderPage() {
  return (
    <>
      <PageSchema path="/dealership-website-builder" />

      <Breadcrumbs path="/dealership-website-builder" />
      <WebsiteConfigurator />
      <FaqSection
        emitSchema
        eyebrow="Common questions"
        title="Dealership website questions."
        items={BUILDER_FAQS}
      />
    </>
  );
}
