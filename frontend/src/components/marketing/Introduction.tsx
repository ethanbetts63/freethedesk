import type { ReactNode } from 'react';

import { SectionHeader } from '@/components/SectionHeader';
import { cn } from '@/lib/utils';

/**
 * The centred preface under a page's hero: an eyebrow, a heading with its
 * accent, and one paragraph. The SEO page's "How it works" and the Scooter
 * Shop case study's are this with different words.
 */
export function Introduction({
  eyebrow,
  title,
  accentTitle,
  id,
  measure = 'narrow',
  children,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  id?: string;
  /** `wide` lets the paragraph run to about 90 characters, for a case study's shell (owner, 2026-11-06). */
  measure?: 'narrow' | 'wide';
  children: ReactNode;
}) {
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section
      className="site-shell pb-xl pt-section lg:text-center"
      id={id}
      aria-labelledby={titleId}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        accentTitle={accentTitle}
        titleId={titleId}
        titleClassName="mb-m"
      />
      <p
        className={cn(
          'm-0 text-lead leading-relaxed text-text-muted lg:mx-auto',
          measure === 'wide' ? 'max-w-[90ch]' : 'max-w-[62ch]',
        )}
      >
        {children}
      </p>
    </section>
  );
}
