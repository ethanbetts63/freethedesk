import type { ReactNode } from 'react';

import { cardLinkClassName } from '@/components/ui/Card';
import type { SeoSetupKey } from '@/lib/seoApi';

/** The service account Search Console and Analytics are shared with. */
export const SERVICE_ACCOUNT = 'analytics@freethedesk.iam.gserviceaccount.com';
/** The address the tools without service-account support invite. */
export const TEAM_ADDRESS = 'hello@freethedesk.com.au';

export interface SetupGuide {
  /** What this access gives the report, in one line. */
  why: string;
  /** The address to add, shown with a copy button; absent for the enquiries step. */
  address?: string;
  steps: ReactNode;
  notSetUp?: ReactNode;
}

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={cardLinkClassName} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/**
 * Mirrors freetheplatform/_search/onboarding.md, the instructions the reporting
 * pipeline was built against. Change both together.
 */
export const SETUP_GUIDE: Record<SeoSetupKey, SetupGuide> = {
  search_console: {
    why: 'Which Google searches bring people to your site. Reporting starts once this is connected.',
    address: SERVICE_ACCOUNT,
    steps: (
      <>
        In <Link href="https://search.google.com/search-console">Search Console</Link>, pick your
        site, go to <strong>Settings → Users and permissions → Add user</strong>, and add the
        address below as <strong>Restricted</strong>. Then press <strong>Check connection</strong>.
      </>
    ),
    notSetUp: (
      <>
        Not set up?{' '}
        <Link href="https://search.google.com/search-console/welcome">Add your site</Link> first. It
        only collects from that day.
      </>
    ),
  },
  google_analytics: {
    why: "What visitors do once they're on your site.",
    address: SERVICE_ACCOUNT,
    steps: (
      <>
        In <Link href="https://analytics.google.com">Google Analytics</Link>, pick your property, go
        to <strong>Admin → Property access management → + → Add users</strong>, untick{' '}
        <strong>Notify new users by email</strong>, and add the address below as{' '}
        <strong>Viewer</strong>. Then press <strong>Check connection</strong>.
      </>
    ),
    notSetUp: (
      <>
        Not set up?{' '}
        <Link href="https://support.google.com/analytics/answer/9304153">Set up Analytics</Link>. It
        only records from the day it&apos;s installed.
      </>
    ),
  },
  business_profile: {
    why: 'The calls, direction requests and website clicks your Google listing brings.',
    address: TEAM_ADDRESS,
    steps: (
      <>
        In <Link href="https://business.google.com">Business Profile</Link>, pick your business, go
        to <strong>Business Profile settings → People and access → Add</strong>, and add the address
        below as <strong>Manager</strong>. We don&apos;t change your listing.
      </>
    ),
  },
  google_ads: {
    why: 'What you spend on ads and what it brings in.',
    address: TEAM_ADDRESS,
    steps: (
      <>
        In <Link href="https://ads.google.com">Google Ads</Link>, pick your account, go to{' '}
        <strong>Admin → Access and security → +</strong>, and invite the address below as{' '}
        <strong>Read only</strong>.
      </>
    ),
  },
  clarity: {
    why: 'How people use each page: where they click, scroll and give up.',
    address: TEAM_ADDRESS,
    steps: (
      <>
        In <Link href="https://clarity.microsoft.com">Clarity</Link>, pick your project, go to{' '}
        <strong>Settings → Team → Add team member</strong>, and add the address below as{' '}
        <strong>Member</strong>. If the project records more than one site, tell us which is this
        one in the notes below.
      </>
    ),
    notSetUp: (
      <>
        Not set up?{' '}
        <Link href="https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup">
          Set up Clarity
        </Link>
        . It&apos;s free, and only records from the day it&apos;s installed.
      </>
    ),
  },
  enquiries: {
    why: 'Which visits became work.',
    steps: (
      <>
        Email <strong>{TEAM_ADDRESS}</strong> the number of enquiries and bookings each week for the
        last three months, from wherever they arrive: form, email, phone or booking tool. Counts
        only, no names or contact details.
      </>
    ),
  },
};
