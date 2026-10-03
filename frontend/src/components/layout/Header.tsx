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

export function Header() {
  return (
    <SiteHeader
      translucent
      linkStyle="body"
      items={NAV}
      logo={<Wordmark href="/" priority />}
      cta={
        <Link href="/login" className={navCtaClassName}>
          Login
        </Link>
      }
      mobileCta={
        <Link href="/login" className={mobileNavCtaClassName}>
          Login<span aria-hidden="true">&rarr;</span>
        </Link>
      }
    />
  );
}
