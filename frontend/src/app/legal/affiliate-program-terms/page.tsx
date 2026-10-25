import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/legal/affiliate-program-terms');

export default function AffiliateProgramTermsPage() {
  return (
    <>
      <PageSchema path="/legal/affiliate-program-terms" />

      <Breadcrumbs path="/legal/affiliate-program-terms" />
      <LegalDocument filename="affiliate-program-terms.md" />
    </>
  );
}
