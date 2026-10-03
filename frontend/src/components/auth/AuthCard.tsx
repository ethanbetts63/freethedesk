'use client';

import { cn } from '@/lib/utils';
import { SignalFlow } from '@/components/visuals/SignalFlow';
import { kickerClassName } from '@/components/ui/layout';
import { Wordmark } from '@/components/Wordmark';
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
      <section className="relative z-1 w-full max-w-[450px] border border-[color-mix(in_srgb,var(--border-strong)_85%,transparent)] bg-[color-mix(in_srgb,var(--surface-page)_92%,transparent)] px-ml py-xl shadow-l backdrop-blur-[13px] sm:p-xl">
        <Wordmark size="card" href="/" />
        <p className={cn(kickerClassName, 'mt-xl')}>{kicker}</p>
        <h1 className="m-0 text-title tracking-[-0.06em]">{heading}</h1>
        {intro && <p className="mt-s mb-xl text-body-sm leading-normal text-text-muted">{intro}</p>}
        {children}
        {footer}
      </section>
    </main>
  );
}

export const authFieldLabelClassName = 'text-label font-heavy';
export const authLinkClassName = 'font-heavy text-text-action underline underline-offset-[3px]';
