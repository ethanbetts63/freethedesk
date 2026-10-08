import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/legal/web-development-terms');

export default function WebDevelopmentTermsPage() {
  return (
    <>
      <PageSchema path="/legal/web-development-terms" />

      <Breadcrumbs path="/legal/web-development-terms" />
      <LegalDocument filename="web-development-terms.md" />
    </>
  );
}
