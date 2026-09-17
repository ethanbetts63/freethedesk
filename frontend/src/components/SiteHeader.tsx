import Image from 'next/image';
import Link from 'next/link';

import { MobileNavAutoClose } from '@/components/MobileNavAutoClose';
import { focusRingClassName } from '@/lib/controlState';
import { PRIMARY_NAVIGATION } from '@/lib/siteConfig';
import { cn } from '@/lib/utils';

const navLinkClassName =
  "relative after:absolute after:bottom-[-7px] after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-text-primary after:transition-transform after:duration-200 after:content-[''] hover:after:origin-left hover:after:scale-x-100";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color-mix(in_srgb,var(--blue-950)_10%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] backdrop-blur-[14px]">
      <div className="site-shell flex min-h-[68px] items-center justify-between min-[900px]:min-h-[78px]">
        <Link
          className="flex flex-none items-center gap-xs text-[1.35rem] leading-none font-black tracking-[-0.085em]"
          href="/"
          aria-label="freethedesk home"
        >
          <Image
            className="block h-[46px] w-[46px] object-contain min-[900px]:h-[40px] min-[900px]:w-[40px]"
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
        <nav
          className="hidden items-center gap-[clamp(14px,2vw,36px)] self-stretch text-body font-strong min-[900px]:flex"
          aria-label="Primary navigation"
        >
          {PRIMARY_NAVIGATION.map((item) => (
            <Link className={navLinkClassName} key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link
            className="bg-action-primary px-m py-s text-text-on-dark transition-[background,transform] duration-200 hover:-translate-y-px hover:bg-[var(--blue-500)]"
            href="/login"
          >
            Login
          </Link>
        </nav>
        {/* Native <details>: the panel works with no JavaScript, so only the
            close-on-navigate behaviour is a client component. */}
        <details className="group relative block min-[900px]:hidden">
          <summary
            className={cn(
              'flex h-[44px] w-[48px] cursor-pointer list-none flex-col items-center justify-center gap-3xs bg-surface-dark [&::-webkit-details-marker]:hidden',
              focusRingClassName,
            )}
            aria-label="Open navigation menu"
          >
            <i className="h-[2px] w-[19px] bg-text-on-dark transition-[transform,opacity] duration-200 group-open:translate-y-[7px] group-open:rotate-45" />
            <i className="h-[2px] w-[19px] bg-text-on-dark transition-[transform,opacity] duration-200 group-open:opacity-0" />
            <i className="h-[2px] w-[19px] bg-text-on-dark transition-[transform,opacity] duration-200 group-open:-translate-y-[7px] group-open:-rotate-45" />
          </summary>
          <nav
            className="absolute top-[calc(100%+12px)] right-0 flex w-[min(330px,calc(100vw-40px))] flex-col border border-border-default bg-surface-page p-xs shadow-[0_22px_55px_color-mix(in_srgb,var(--blue-950)_18%,transparent)]"
            aria-label="Mobile navigation"
          >
            {PRIMARY_NAVIGATION.map((item) => (
              <Link
                className="flex items-center justify-between border-b border-border-default p-s text-body font-heavy [&>span]:text-text-action"
                key={item.href}
                href={item.href}
              >
                {item.label}
                <span>→</span>
              </Link>
            ))}
            <Link
              className="mt-xs flex items-center justify-between border-0 bg-action-primary px-s py-m text-body font-heavy text-text-on-dark [&>span]:text-text-on-dark"
              href="/login"
            >
              Login<span>→</span>
            </Link>
          </nav>
          <MobileNavAutoClose />
        </details>
      </div>
    </header>
  );
}
