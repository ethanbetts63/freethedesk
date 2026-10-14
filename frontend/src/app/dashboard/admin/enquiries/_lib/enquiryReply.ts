import type { Enquiry } from '@/lib/adminApi';

/** The compose page, prefilled to reply to an enquiry and linked back to it. */
export function enquiryReplyHref(enquiry: Pick<Enquiry, 'id' | 'name' | 'email'>): string {
  const firstName = enquiry.name.trim().split(/\s+/)[0] || enquiry.name;
  const params = new URLSearchParams({
    to: enquiry.email,
    subject: `Re: Your freethedesk enquiry`,
    body: `Hi ${firstName},\n\nThanks for getting in touch with freethedesk.\n\n`,
    enquiry: String(enquiry.id),
  });
  return `/dashboard/admin/messages/compose?${params}`;
}
