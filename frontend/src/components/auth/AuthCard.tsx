'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SignalFlow } from '@/components/visuals/SignalFlow';
import { adminBrandClassName, adminKickerClassName } from '@/components/dashboard/adminLayout';
import { gridPaperBeforeClassName } from '@/lib/gridSurface';

/**
 * The card every signed-out auth page sits in: sign in, forgot password, choose
 * a new one. One component because the four pages differ only in their form —
 * copying this markup is how they would drift apart.
 */
export function AuthCard({
  kicker,
  heading,
  intro,
  children,
  footer,
}: {
  kicker: string;
  heading: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-tint p-xl',
        gridPaperBeforeClassName,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.78] [&>canvas]:h-full [&>canvas]:w-full">
        <SignalFlow />
      </div>
      <section className="relative z-1 w-full max-w-[450px] border border-[color-mix(in_srgb,var(--slate-300)_85%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] px-ml py-xl shadow-l backdrop-blur-[13px] sm:p-xl">
        <Link className={adminBrandClassName} href="/">
          free<span>the</span>desk<i>.</i>
        </Link>
        <p className={cn(adminKickerClassName, 'mt-xl')}>{kicker}</p>
        <h1 className="m-0 text-title tracking-[-0.06em]">{heading}</h1>
        {intro && <p className="mt-s mb-xl text-body-sm leading-[1.5] text-text-muted">{intro}</p>}
        {children}
        {footer}
      </section>
    </main>
  );
}

export const authFieldLabelClassName = 'text-label font-heavy';
export const authLinkClassName = 'font-heavy text-text-action underline underline-offset-[3px]';
