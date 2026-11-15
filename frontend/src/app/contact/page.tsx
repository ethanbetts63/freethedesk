import type { Metadata } from 'next';

import { CallRequest } from '@/components/marketing/CallRequest';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { CONTACT } from '@/lib/contact';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/contact');

/**
 * The standard hero with the number, the email and where we're based, then the call-back form.
 * The project enquiry form that used to be here went on 2026-11-15.
 */
export default function ContactPage() {
  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/contact" />
      <Hero
        path="/contact"
        titleLines={['Contact freethedesk:']}
        accentTitle="SEO in Perth."
        lead={`Ring ${CONTACT.phone}, email ${CONTACT.email}, or leave your number below and we'll ring you back.`}
        primaryHref={CONTACT.phoneHref}
        primaryLabel={`Call ${CONTACT.phone}`}
        secondaryHref={CONTACT.emailHref}
        secondaryLabel={CONTACT.email}
        trustLine="Dianella-based · By appointment only · Perth and across Australia"
      />
      <CallRequest source="/contact" />
    </main>
  );
}
