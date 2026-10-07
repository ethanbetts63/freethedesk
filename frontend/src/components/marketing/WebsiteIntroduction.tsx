import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';
import { SectionNumber } from '@/components/SectionNumber';

import { focusRingClassName } from '@/lib/controlState';

const linkClassName = [
  'mt-auto inline-flex min-h-[var(--tap-min)] cursor-pointer items-center gap-s self-start border-0 bg-transparent p-0 font-[inherit] text-body font-strong text-text-secondary underline [text-underline-offset:5px] hover:text-action-primary [&>span]:text-action-primary',
  focusRingClassName,
  // An underlined link in running text: the outline wants clearance from
  // the underline rather than sitting on it.
  'focus-visible:outline-offset-4',
].join(' ');

export type IntroductionItem = {
  title: string;
  description: string;
  /** The section further down the page this item's link scrolls to. */
  targetId: string;
  linkLabel: string;
};

const columnClassName =
  'flex flex-col border-t border-border-default pt-l lg:border-t-0 lg:px-l lg:py-0 lg:first:pl-0 lg:last:pr-0 lg:[&+div]:border-l lg:[&+div]:border-border-default';

/**
 * "What we build": three numbered columns, each linking to its section below.
 * The website page's three jobs are the default; another service page passes
 * its own `items` and heading and keeps the layout.
 */
export function WebsiteIntroduction({
  id = 'website-overview',
  title = 'Three jobs.',
  accentTitle = 'One website.',
  seoDescription = 'Search engine optimisation (SEO) helps your website appear when people search Google for what your business offers.',
  designDescription = 'Clear layouts and simple steps guide visitors towards a purchase, booking or enquiry, on mobile and desktop.',
  automationDescription = 'We connect your website to your business tools to automate data entry, confirmations, invoices and follow-ups.',
  items = [
    { title: 'SEO', description: seoDescription, targetId: 'seo', linkLabel: 'Explore SEO' },
    {
      title: 'Website design',
      description: designDescription,
      targetId: 'customer-journeys',
      linkLabel: 'Explore website design',
    },
    {
      title: 'Admin automation',
      description: automationDescription,
      targetId: 'website-automation',
      linkLabel: 'Explore automation',
    },
  ],
}: {
  id?: string;
  title?: string;
  accentTitle?: string;
  seoDescription?: string;
  designDescription?: string;
  automationDescription?: string;
  items?: readonly IntroductionItem[];
}) {
  return (
    <section className="site-shell pt-section pb-xl" id={id} aria-labelledby={`${id}-title`}>
      <SectionNumber>What we build</SectionNumber>
      <h2 id={`${id}-title`} className="m-0 mb-xl text-display leading-[1.05] tracking-[-0.055em]">
        {title} <span className="moving-colour-text">{accentTitle}</span>
      </h2>
      <div className="grid gap-l lg:grid-cols-3 lg:gap-0">
        {items.map((item, index) => (
          <div className={columnClassName} key={item.targetId}>
            <h3 className="m-0 text-title-sm tracking-[-0.035em] text-action-primary">
              {index + 1}. {item.title}
            </h3>
            <p className="mt-s mb-m max-w-[42ch] text-lead leading-relaxed text-text-muted">
              {item.description}
            </p>
            <ScrollCtaButton classes={linkClassName} targetId={item.targetId}>
              {item.linkLabel} <span aria-hidden="true">↘</span>
            </ScrollCtaButton>
          </div>
        ))}
      </div>
    </section>
  );
}
