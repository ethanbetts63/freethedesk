'use client';

import { cardLinkClassName } from '@/components/ui/Card';

import { SetupChecklist } from '@/app/seo-portal/setup/_components/SetupChecklist';

/**
 * The affiliate's free Plus audit is an SEO account on the same login, so this is the SEO
 * portal's setup page with the affiliate's own words around it. The PDF carries the same
 * instructions for a host who would rather forward them to whoever runs their site.
 */
export default function AffiliatePortalAuditPage() {
  return (
    <SetupChecklist
      title="Your free audit"
      intro={
        <p className="mb-l text-body text-text-muted">
          Someone else looks after your site? Send them{' '}
          <a
            className={cardLinkClassName}
            href="/documents/seo-report-onboarding.pdf"
            target="_blank"
            rel="noreferrer"
          >
            the one-page instructions (PDF)
          </a>
          . They say the same as the steps below.
        </p>
      }
    />
  );
}
