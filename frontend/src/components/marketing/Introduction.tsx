import type { ReactNode } from 'react';

import { SectionHeader } from '@/components/SectionHeader';

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
  children,
}: {
  eyebrow: string;
  title: string;
  accentTitle: string;
  id?: string;
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
      <p className="m-0 max-w-[62ch] lg:mx-auto text-lead leading-relaxed text-text-muted">
        {children}
      </p>
    </section>
  );
}
