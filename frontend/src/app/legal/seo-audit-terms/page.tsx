import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/legal/seo-audit-terms');

export default function SeoAuditTermsPage() {
  return (
    <>
      <PageSchema path="/legal/seo-audit-terms" />

      <Breadcrumbs path="/legal/seo-audit-terms" />
      <LegalDocument filename="seo-audit-terms.md" />
    </>
  );
}
