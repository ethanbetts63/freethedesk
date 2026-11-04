'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { GuideSection } from '../_lib/guideView';
import { cn } from '@/lib/utils';

/**
 * "In this article": the guide's sections, with a dot on the one being read. Sticky beside the text on wide
 * screens; on a phone it sits above the text, folded.
 */
export function GuideContents({ sections }: { sections: readonly GuideSection[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.id))
      .filter((heading): heading is HTMLElement => heading !== null);
    // The section being read is the last heading above the upper third of the screen.
    const update = () => {
      const line = window.innerHeight / 3;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
      setCurrent((passed[passed.length - 1] ?? headings[0])?.id);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-labelledby="guide-contents-title"
      // `guide-contents` lets the list stick past main's clip (styles/base.css).
      className="guide-contents rounded-lg bg-surface-tint p-l sm:p-xl"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="guide-contents-list"
        onClick={() => setOpen((value) => !value)}
        // The rule under the title only when the list shows: folded on a phone, the box is the title alone.
        className={cn(
          'flex w-full items-center justify-between gap-s border-border-default text-left lg:pointer-events-none lg:border-b lg:pb-m',
          open && 'border-b pb-m',
        )}
      >
        <span id="guide-contents-title" className="text-body font-strong text-text-primary">
          In this article
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-[18px] text-text-muted transition-transform lg:hidden',
            open && 'rotate-180',
          )}
        />
      </button>
      <ol
        id="guide-contents-list"
        className={cn('m-0 mt-m list-none flex-col gap-m p-0', open ? 'flex' : 'hidden lg:flex')}
      >
        {sections.map((section) => {
          const active = section.id === current;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-baseline gap-xs text-body leading-snug no-underline transition-colors hover:text-text-action',
                  active ? 'font-strong text-text-primary' : 'text-text-muted',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-[7px] shrink-0 -translate-y-3xs rounded-circle bg-action-primary transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {section.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
