import Link from 'next/link';

import { Breadcrumbs } from '@/components/Breadcrumbs';
import Eyebrow from '@/components/common/eyebrow';
import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';
import { CtaButton } from '@/components/CtaButton';
import { HeroRotatingWord } from '@/components/marketing/HeroRotatingWord';
import { NetworkField } from '@/components/visuals/NetworkField';
import type { PagePath } from '@/lib/pages';
import { heroGridClassName } from '@/lib/gridSurface';
import { cn } from '@/lib/utils';

const secondaryLinkClassName =
  'inline-flex min-h-[var(--tap-min)] items-center justify-between gap-s border-b border-text-primary py-2xs text-body font-heavy sm:min-h-0';

type HeroProps = {
  /** Set to float the breadcrumb trail over the top-right of the hero. */
  path?: PagePath;
  eyebrow: string;

  titleLines: readonly string[];

  accentTitle: string;
  /** Further accent lines, rotated in after `accentTitle` once the page hydrates. */
  accentAlternates?: readonly string[];
  /** A closing line after the accent, for a heading the rotating word sits inside. */
  titleSuffix?: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  trustLine?: string;
};

export function Hero({
  path,
  eyebrow,
  titleLines,
  accentTitle,
  accentAlternates = [],
  titleSuffix,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  trustLine = 'Perth-based · clients across Australia',
}: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-68px)] items-center overflow-hidden bg-surface-page lg:min-h-[calc(100vh-78px)]">
      <div className="absolute inset-0 z-[-1] pointer-events-none [background:radial-gradient(circle_at_34%_48%,color-mix(in_srgb,var(--surface-page)_98%,transparent)_0_18%,color-mix(in_srgb,var(--surface-page)_78%,transparent)_36%,transparent_62%)]" />
      {/* Eager, unlike the footer backdrop: this one is above the fold, and
          deferring it only saves a phone 1.9kB gzipped while costing every
          desktop visitor a visible pop-in - the chunk cannot start downloading
          until hydration finishes. */}
      <div className="absolute inset-0 z-[-2] hidden [&>canvas]:h-full [&>canvas]:w-full lg:block">
        <NetworkField />
      </div>
      <div
        className={cn(
          heroGridClassName,
          'z-[-1] [mask-image:radial-gradient(circle_at_65%_50%,var(--text-primary),transparent_72%)]',
        )}
      />
      {path && <Breadcrumbs path={path} variant="overlay" />}
      {/* Clicks pass through to the network field except on the controls. In-page
          CTAs render as buttons (ScrollCtaButton), so buttons need it as much as links. */}
      <div className="site-shell pointer-events-none py-3xl [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        <div>
          {/* eslint-disable-next-line no-restricted-syntax -- --ring-halo plus a second
              glow: the live dot is lit, not raised, and one ring does not draw it. */}
          <div className="[--eyebrow-accent:var(--action-primary)] [&_span]:shadow-[var(--ring-halo),0_0_10px_2px_color-mix(in_srgb,var(--action-primary)_70%,transparent)]">
            <Eyebrow dot tone="accent">
              {eyebrow}
            </Eyebrow>
          </div>
          <h1 className="m-0 max-w-[1000px] text-balance text-hero leading-[0.87] font-heavy tracking-[-0.085em] text-text-primary [overflow-wrap:break-word] sm:[overflow-wrap:normal] lg:leading-[0.83]">
            {titleLines.map((line, index) => (
              /* The trailing space collapses to nothing on screen, but it keeps
                 the lines separate words for anything that flattens the heading
                 inline - without it extractors read "Digitalautomationsolutions". */
              <span key={index}>
                {line} <br />
              </span>
            ))}
            <em className="inline-block pt-s not-italic text-[var(--action-primary)]">
              <HeroRotatingWord words={[accentTitle, ...accentAlternates]} />
            </em>
            {titleSuffix ? (
              <>
                {' '}
                <br />
                {titleSuffix}
              </>
            ) : null}
          </h1>
          <p className="my-xl max-w-[420px] text-lead leading-relaxed text-text-muted lg:max-w-[570px]">
            {lead}
          </p>
          <div className="flex flex-wrap items-center gap-m [&>*]:w-full sm:gap-xl sm:[&>*]:w-auto">
            {/* Hero is at the top, so in-page links scroll down. */}
            <CtaButton
              className="transition-[background,transform] duration-200 hover:-translate-y-0.5"
              href={primaryHref}
              direction={primaryHref.startsWith('#') ? 'down' : 'page'}
              size="large"
            >
              {primaryLabel}
            </CtaButton>
            {/* Same rule as CtaButton: a bare "#fragment" scrolls without touching the
                URL, because a hash link only works on the first click. */}
            {secondaryHref.startsWith('#') ? (
              <ScrollCtaButton
                targetId={secondaryHref.slice(1)}
                classes={cn(secondaryLinkClassName, 'cursor-pointer bg-transparent')}
              >
                {secondaryLabel} <span>↓</span>
              </ScrollCtaButton>
            ) : (
              <Link className={secondaryLinkClassName} href={secondaryHref}>
                {secondaryLabel} <span>↗</span>
              </Link>
            )}
          </div>
          {trustLine ? (
            <p className="m-0 mt-xl text-caption font-strong tracking-label-tight text-text-muted uppercase">
              {trustLine}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
