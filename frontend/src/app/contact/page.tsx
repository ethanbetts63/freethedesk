import type { Metadata } from 'next';

import { CallBooking } from '@/components/marketing/CallBooking';
import { Hero } from '@/components/marketing/Hero';
import { PageSchema } from '@/components/PageSchema';
import { CONTACT } from '@/lib/contact';
import { metadataFor } from '@/lib/pages';

export const metadata: Metadata = metadataFor('/contact');

/**
 * The standard hero with the number, the email and where we're based, then the free SEO
 * review booking. The project enquiry form that used to be here was removed on 2026-11-15:
 * the booked call is the way in.
 */
export default function ContactPage() {
  return (
    <main className="bg-surface-page text-text-secondary">
      <PageSchema path="/contact" />
      <Hero
        path="/contact"
        titleLines={['Contact freethedesk:']}
        accentTitle="SEO in Perth."
        lead={`Ring ${CONTACT.phone}, email ${CONTACT.email}, or book a free 30-minute SEO review below and we'll ring you.`}
        primaryHref={CONTACT.phoneHref}
        primaryLabel={`Call ${CONTACT.phone}`}
        secondaryHref={CONTACT.emailHref}
        secondaryLabel={CONTACT.email}
        trustLine="Dianella-based · By appointment only · Perth and across Australia"
      />
      <CallBooking source="/contact" />
    </main>
  );
}
