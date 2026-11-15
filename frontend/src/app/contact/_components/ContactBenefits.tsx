import { ChartColumn, MessageSquareText, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type Benefit = { title: string; body: string; icon: ReactNode; tile: string };

/** Each tile in a soft status colour with its icon in the strong one, green, yellow then blue. */
const BENEFITS: Benefit[] = [
  {
    title: 'Data-based analysis',
    body: 'Every recommendation comes from your own search data, not a generic checklist.',
    icon: <ChartColumn className="size-8" aria-hidden="true" />,
    tile: 'bg-surface-success text-fill-success',
  },
  {
    title: 'Access & support',
    body: 'Talk to the person who does the work, by phone or email, before and after.',
    icon: <MessageSquareText className="size-8" aria-hidden="true" />,
    tile: 'bg-surface-warning text-fill-warning',
  },
  {
    title: 'Grow & succeed',
    body: 'Make the changes and see the clicks they earn. Money back if they don’t grow.',
    icon: <Trophy className="size-8" aria-hidden="true" />,
    tile: 'bg-surface-info text-fill-info',
  },
];

/**
 * Three benefits under the contact form, laid out after the "Access benefits designed just for
 * you" block on Google's partner page: a centred title, then three columns of an icon tile, a
 * short title and two lines. Stacked on a phone.
 */
export function ContactBenefits() {
  return (
    <section className="site-shell pb-section" aria-labelledby="contact-benefits-title">
      <h2
        id="contact-benefits-title"
        className="m-0 text-center text-display leading-[1.02] tracking-[-0.058em] text-text-secondary"
      >
        Benefits designed just for you
      </h2>
      <ul className="m-0 mt-2xl grid list-none grid-cols-1 gap-2xl p-0 md:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="grid content-start justify-items-center text-center">
            <span
              className={cn('flex size-20 items-center justify-center rounded-md', benefit.tile)}
            >
              {benefit.icon}
            </span>
            <h3 className="m-0 mt-l text-lead font-normal text-text-secondary">{benefit.title}</h3>
            <p className="m-0 mt-s max-w-[18rem] text-body leading-relaxed text-text-muted">
              {benefit.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
