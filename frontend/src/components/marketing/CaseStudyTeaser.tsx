import Image from 'next/image';
import Link from 'next/link';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionNumber } from '@/components/SectionNumber';
import { PhoneFrame } from '@/components/visuals/PhoneFrame';

type CaseStudyTeaserProps = {
  eyebrow: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  points: readonly string[];
  primaryHref: string;
  primaryLabel: string;
  showPrimaryAction?: boolean;
};

export function CaseStudyTeaser({
  eyebrow,
  title = 'Scooter Shop, Perth.',
  children,
  points,
  primaryHref,
  primaryLabel,
  showPrimaryAction = true,
}: CaseStudyTeaserProps) {
  return (
    <section className="mt-section bg-surface-dark py-section text-text-on-dark sm:mt-xl">
      <div className="site-shell grid grid-cols-1 items-center gap-split lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="relative row-start-2 mx-auto w-[250px] lg:row-auto lg:mx-0">
          <div className="absolute bottom-[34px] left-[70px] z-2 px-m pt-s pb-m [backdrop-filter:blur(9px)] [background:color-mix(in_srgb,var(--text-secondary)_88%,transparent)] [border:1px_solid_color-mix(in_srgb,var(--surface-page)_15%,transparent)] [box-shadow:0_26px_60px_color-mix(in_srgb,var(--text-primary)_50%,transparent)] sm:bottom-[52px] sm:left-[112px] sm:px-l sm:pt-m sm:pb-ml">
            <small className="block whitespace-nowrap text-micro font-strong tracking-label text-[var(--accent-on-dark)] uppercase">
              Google Search Console
            </small>
            <strong className="mt-xs mb-4xs block text-display-2 leading-none font-strong tracking-[-0.06em]">
              +300%
            </strong>
            <span className="whitespace-nowrap text-body text-[var(--text-on-dark-muted)]">
              organic clicks
            </span>
          </div>
          <div className="relative z-1">
            <PhoneFrame size="standalone" menu>
              <Image
                src="/case-studies/scooter-shop/inventory-mobile.png"
                alt="Scooter Shop inventory page on mobile"
                width={390}
                height={844}
              />
            </PhoneFrame>
          </div>
        </div>
        <div className="[&>p:not(.section-number)]:mt-0 [&>p:not(.section-number)]:mb-m [&>p:not(.section-number)]:max-w-[560px] [&>p:not(.section-number)]:text-lead [&>p:not(.section-number)]:leading-[1.76] [&>p:not(.section-number)]:text-[var(--text-on-dark-muted)]">
          <SectionNumber onDark>{eyebrow}</SectionNumber>
          <h2 className="m-0 mb-ml text-display-2 tracking-[-0.05em]">{title}</h2>
          {children}
          <div className="mt-l mb-xl flex flex-wrap gap-xs">
            {points.map((point) => (
              <span
                key={point}
                className="border border-[color-mix(in_srgb,var(--surface-page)_22%,transparent)] px-s py-2xs text-ui font-strong text-[var(--border-subtle)]"
              >
                {point}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-ml">
            {showPrimaryAction && (
              <PrimaryButton href={primaryHref} direction="down" size="compact">
                {primaryLabel}
              </PrimaryButton>
            )}
            <Link
              href="/portfolio/scooter-shop"
              className="text-small font-strong tracking-[0.04em] text-text-on-dark uppercase [&>span]:ml-2xs [&>span]:inline-block [&>span]:transition-transform [&>span]:duration-200 hover:[&>span]:translate-x-1"
            >
              Read the full case study <span>↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
