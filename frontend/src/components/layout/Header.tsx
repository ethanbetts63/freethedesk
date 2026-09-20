import Image from 'next/image';
import Link from 'next/link';

import { PRIMARY_NAVIGATION } from '@/lib/siteConfig';
import { SiteHeader } from '@/components/layout/SiteHeader';
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
      logo={
        <Link
          className="text-wordmark flex flex-none items-center gap-xs leading-none font-black tracking-[-0.085em]"
          href="/"
          aria-label="freethedesk home"
        >
          <Image
            className="block h-[46px] w-[46px] object-contain lg:h-[40px] lg:w-[40px]"
            src="/logo-192x192.png"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span className="text-text-primary">
            free<span className="text-text-action">the</span>desk
            <span className="text-action-primary">.</span>
          </span>
        </Link>
      }
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
