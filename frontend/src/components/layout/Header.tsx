import Link from 'next/link';
import { Phone } from 'lucide-react';

import { PRIMARY_NAVIGATION } from '@/lib/siteConfig';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Wordmark } from '@/components/Wordmark';
import {
  navCtaClassName,
  mobileNavCtaClassName,
  type NavItem,
} from '@/components/layout/navigation';

const NAV: NavItem[] = [...PRIMARY_NAVIGATION];

const PHONE_HREF = 'tel:+61423853830';
const PHONE_NUMBER = '0423 853 830';

/** Beside the menu button on phones, where the forms can be ten screens down the page. Icon only: the number
    beside the wordmark needs 424px, wider than most phones, so it is spelled out in the menu instead. */
const callClassName =
  'inline-flex size-[var(--tap-min)] items-center justify-center bg-action-primary text-text-on-dark';

const callRowClassName =
  'mt-s flex min-h-[var(--tap-min)] items-center gap-xs px-s text-lead font-heavy text-text-primary';

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
        <a href={PHONE_HREF} className={callClassName} aria-label={`Call ${PHONE_NUMBER}`}>
          <Phone className="size-5" aria-hidden="true" />
        </a>
      }
      mobileExtra={
        <a href={PHONE_HREF} className={callRowClassName}>
          <Phone className="size-5 shrink-0 text-text-action" aria-hidden="true" />
          {PHONE_NUMBER}
        </a>
      }
    />
  );
}
