import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { SectionNumber } from './SectionNumber';

/**
 * Size of the section's `h2`. Each entry is the display step plus the leading
 * and tracking that go with it.
 *
 * Two headings in the app sit a hair off these values (`ServiceScroll` at
 * -0.058em/1.02, `CaseStudyTeaser` at -0.05em). Both pass `titleClassName` to
 * hold their current rendering; the difference is almost certainly drift rather
 * than intent, and deleting those two overrides collapses the scale to four.
 */
const titleSizes = {
  'display-sm': 'text-display leading-[1.05] tracking-[-0.055em]',
  display: 'text-display leading-[1.05] tracking-[-0.055em]',
  'display-md': 'text-display leading-[0.98] tracking-[-0.055em]',
  'display-lg': 'text-hero leading-[0.98] tracking-[-0.06em]',
} as const;

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  /** Rendered in the moving-colour treatment after `title`. */
  accentTitle?: string;
  size?: keyof typeof titleSizes;
  /** Where the line breaks before `accentTitle`; ignored without one. */
  titleBreak?: 'always' | 'desktop' | 'none';
  /** Set when the section labels itself with `aria-labelledby`. */
  titleId?: string;
  onDark?: boolean;
  eyebrowClassName?: string;
  /** Margin, max-width and grid placement — the caller's layout, not ours. */
  titleClassName?: string;
};

/**
 * The eyebrow and heading that open a marketing section.
 *
 * Emitted as a fragment rather than wrapped in an element, because the sections
 * place these two in their own grids — `ExpandableServiceList` puts them in
 * separate columns from the lead paragraph, and `CaseStudyTeaser` follows them
 * with arbitrary children.
 *
 * The lead paragraph is deliberately not here: the three sections that have one
 * disagree on element, width and type size, so there is nothing yet to share.
 */
export function SectionHeader({
  eyebrow,
  title,
  accentTitle,
  size = 'display',
  titleBreak = 'none',
  titleId,
  onDark = false,
  eyebrowClassName,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <>
      <SectionNumber onDark={onDark} className={eyebrowClassName}>
        {eyebrow}
      </SectionNumber>
      <h2 id={titleId} className={cn('m-0', titleSizes[size], titleClassName)}>
        {title}
        {accentTitle ? (
          <>
            {titleBreak === 'none' ? (
              ' '
            ) : (
              <br className={titleBreak === 'desktop' ? 'hidden lg:block' : undefined} />
            )}
            <span className="moving-colour-text">{accentTitle}</span>
          </>
        ) : null}
      </h2>
    </>
  );
}
