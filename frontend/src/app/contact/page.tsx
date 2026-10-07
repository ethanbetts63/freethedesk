import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';

import { PageSchema } from '@/components/PageSchema';
import { metadataFor } from '@/lib/pages';

import { ProjectEnquiry } from '@/components/marketing/ProjectEnquiry';

export const metadata: Metadata = metadataFor('/contact');

export default function ContactPage() {
  return (
    <main>
      <PageSchema path="/contact" />

      <Breadcrumbs path="/contact" />
      <ProjectEnquiry
        id="contact-form"
        footer={
          <p className="mt-xl mb-0 text-lead text-text-muted">
            Prefer to talk? Call{' '}
            <a className="font-strong text-text-secondary underline" href="tel:+61423853830">
              0423 853 830
            </a>{' '}
            or email{' '}
            <a
              className="font-strong text-text-secondary underline"
              href="mailto:hello@freethedesk.com.au"
            >
              hello@freethedesk.com.au
            </a>
            . We&apos;re in Perth, WA.
          </p>
        }
      />
    </main>
  );
}
