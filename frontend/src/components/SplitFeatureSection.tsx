import type { ReactNode } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { SectionNumber } from './SectionNumber';

const sectionVariants = cva('text-text-secondary', {
  variants: {
    background: {
      white: 'bg-surface-page',
      tint: 'bg-surface-tint',
      transparent: 'bg-transparent',
    },
  },
  defaultVariants: { background: 'transparent' },
});

const layoutVariants = cva(
  [
    'group shell grid grid-cols-1 items-center gap-[clamp(46px,7vw,100px)]',
    'min-[900px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]',
    'min-[900px]:group-data-[text-side=right]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]',
  ],
  {
    variants: {
      spacing: {
        standard: 'py-section',
        compact: 'pt-2xl pb-xl min-[900px]:pt-3xl',
        joined: 'py-[calc(var(--space-section)/2)]',
      },
    },
    defaultVariants: { spacing: 'standard' },
  },
);

type SplitFeatureSectionProps = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: ReactNode;
  visual: ReactNode;
  id?: string;
  textSide?: 'left' | 'right';
  titleBreak?: 'always' | 'desktop' | 'none';
  background?: 'white' | 'tint' | 'transparent';
  spacing?: 'standard' | 'compact' | 'joined';
  bullets?: readonly string[];
  action?: ReactNode;
  className?: string;
};

export function SplitFeatureSection({
  eyebrow,
  title,
  accentTitle,
  description,
  visual,
  id,
  textSide = 'left',
  titleBreak = 'always',
  background = 'transparent',
  spacing = 'standard',
  bullets,
  action,
  className,
}: SplitFeatureSectionProps) {
  return (
    <section className={cn(sectionVariants({ background }), className)} id={id}>
      <div className={layoutVariants({ spacing })} data-text-side={textSide}>
        <div className="min-w-0 min-[900px]:group-data-[text-side=right]:col-start-2 min-[900px]:group-data-[text-side=right]:row-start-1">
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2 className="m-0 text-display-1 leading-[1.05] tracking-[-0.055em]">
            {title}
            {titleBreak !== 'none' && (
              <br className={titleBreak === 'desktop' ? 'hidden min-[900px]:block' : undefined} />
            )}
            {titleBreak === 'none' ? ' ' : null}
            <span className="moving-colour-text">{accentTitle}</span>
          </h2>
          <div className="mt-ml max-w-[440px] text-lead leading-[1.74] text-text-muted [&>:first-child]:mt-0 [&>:last-child]:mb-0">
            {description}
          </div>
          {bullets?.length ? (
            <ul className="m-0 mt-m list-none p-0">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="relative my-s pl-ml text-small font-strong before:absolute before:left-0 before:text-[var(--page-accent)] before:content-['↳']"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {action ? <div className="mt-l">{action}</div> : null}
        </div>
        <div className="min-w-0 min-[900px]:group-data-[text-side=right]:col-start-1 min-[900px]:group-data-[text-side=right]:row-start-1">
          {visual}
        </div>
      </div>
    </section>
  );
}
