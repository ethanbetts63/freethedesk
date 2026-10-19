import Link from 'next/link';

import { PRIMARY_NAVIGATION } from '@/lib/siteConfig';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Wordmark } from '@/components/Wordmark';
import {
  navCtaClassName,
  mobileNavCtaClassName,
  type NavItem,
} from '@/components/layout/navigation';

const NAV: NavItem[] = [...PRIMARY_NAVIGATION];

/** Beside the menu button on phones, where the forms can be ten screens down the page. */
const callClassName =
  'inline-flex min-h-[var(--tap-min)] items-center bg-action-primary px-s text-label font-strong tracking-label-eyebrow text-text-on-dark uppercase';

export function Header() {
  return (
    <SiteHeader
      translucent
      linkStyle="body"
      items={NAV}
      logo={<Wordmark href="/" priority />}
      cta={
        <Link href="/contact" className={navCtaClassName}>
          Contact
        </Link>
      }
      mobileCta={
        <Link href="/contact" className={mobileNavCtaClassName}>
          Contact<span aria-hidden="true">&rarr;</span>
        </Link>
      }
      mobileActions={
        <a href="tel:+61423853830" className={callClassName}>
          Call
        </a>
      }
    />
  );
}
