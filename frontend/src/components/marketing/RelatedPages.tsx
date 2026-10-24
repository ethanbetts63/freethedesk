import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { SectionNumber } from '@/components/SectionNumber';
import { focusRingClassName } from '@/lib/controlState';
import { relatedPagesFor } from '@/lib/relatedPages';
import { cn } from '@/lib/utils';

/** The pages a reader goes to next, at the end of a page; nothing when the page has none listed. */
export function RelatedPages({ path }: { path: string }) {
  const related = relatedPagesFor(path);
  if (!related) return null;

  return (
    <nav className="site-shell py-section" aria-labelledby="related-pages-title">
      <SectionNumber>Related</SectionNumber>
      <h2 id="related-pages-title" className="m-0 text-title tracking-[-0.04em]">
        {related.title}
      </h2>
      <ul className="m-0 mt-xl grid list-none grid-cols-1 gap-s p-0 sm:grid-cols-2 lg:grid-cols-4">
        {related.links.map((link) => (
          <li key={link.href} className="flex">
            <Link
              href={link.href}
              className={cn(
                'group flex flex-1 flex-col gap-xs border border-border-default bg-surface-page p-l no-underline transition-colors duration-200 hover:border-action-primary',
                focusRingClassName,
              )}
            >
              <span className="flex items-start justify-between gap-s text-body font-strong text-text-primary">
                {link.label}
                <ArrowRight
                  aria-hidden="true"
                  className="mt-4xs size-[16px] shrink-0 text-text-action transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-body-sm leading-snug text-text-muted">{link.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
