import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LegalDocument } from '@/components/legal/LegalDocument';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/legal/customer-terms');

export default function CustomerTermsPage() {
  return (
    <>
      <PageSchema path="/legal/customer-terms" />

      <Breadcrumbs path="/legal/customer-terms" />
      <LegalDocument filename="customer-platform-terms.md" />
    </>
  );
}
