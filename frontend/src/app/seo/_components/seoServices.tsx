import type { Service } from '@/components/ServiceScroll';
import { cn } from '@/lib/utils';
import { TrafficLights } from '@/components/visuals/chrome';

/**
 * Two miniature illustrations — a redirect check and an AI-readiness panel —
 * drawn at 168-190px wide. Their greys and blues are ramp steps rather than
 * semantic tokens on purpose: they are picked for the picture (a dot in a fake
 * window bar, a monospace URL chip) and not for any role the token contract
 * names. Collected here rather than spread through the JSX so the exception is
 * visible in one place.
 */
const chromeLabelClassName = 'text-[var(--slate-700)]';
const urlChipClassName = 'text-[var(--blue-800)]';
const arrowClassName = 'text-[var(--blue-600)]';
const badgeClassName = 'bg-[var(--slate-100)] text-[var(--blue-800)]';

/** The tick light: a small dot with a soft halo of its own colour. */
const successDotClassName =
  'rounded-circle bg-fill-success shadow-halo [--ring-halo-colour:var(--fill-success)]';

/** One of the four cells of the 2x2 readiness panel: hairlines only between
 * them, never around the outside, which the border already draws. */
const aiCellClassName =
  'grid grid-cols-[7px_minmax(0,1fr)] gap-3xs px-2xs py-s even:border-l even:border-border-on-dark [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-border-on-dark sm:px-xs';

const monoChipClassName =
  'overflow-hidden border border-border-default p-2xs font-mono text-caption-xs text-ellipsis whitespace-nowrap';

const iconProps = {
  viewBox: '0 0 64 64',
  width: 56,
  height: 56,
  fill: 'none' as const,
  'aria-hidden': true,
};

export const seoServices: Service[] = [
  {
    title: 'Can search engines find the right pages?',
    body: 'Search engines only spend so much attention on a site. What gets crawled, what gets indexed, and what old links point to all decide how much of that attention goes to waste.',
    examples: [
      "Old URLs redirected to their nearest modern equivalent, not just the homepage—so a page already ranking doesn't lose that position for good",
      'Duplicate pages consolidated onto one canonical URL instead of competing with themselves',
      'Crawl access opened deliberately to AI answer engines, not just Google, and closed off from admin, checkout and account pages that have nothing to rank for',
      "A sitemap that reflects what's actually live, not what used to be",
    ],
    color: 'var(--blue-500)',
    icon: (
      <div
        className="w-[168px] flex-none border border-border-strong bg-surface-page text-text-primary shadow-s sm:w-[190px]"
        aria-hidden="true"
      >
        <div className="flex min-h-[24px] items-center gap-3xs border-b border-border-default bg-surface-tint px-xs">
          <TrafficLights size={4} tone="[&>i]:bg-[var(--slate-300)]" />
          <span
            className={cn(
              'ml-auto text-caption-xs font-heavy tracking-label-tight uppercase',
              chromeLabelClassName,
            )}
          >
            Redirect check
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] items-center gap-3xs px-xs pt-m pb-s sm:gap-2xs sm:px-s">
          <span className={cn(monoChipClassName, 'text-text-muted line-through')}>/old-stock</span>
          <b className={cn('p-3xs text-caption-xs', badgeClassName)}>301</b>
          <span className={cn('text-label font-black', arrowClassName)}>&rarr;</span>
          <span className={cn(monoChipClassName, 'bg-surface-tint font-heavy', urlChipClassName)}>
            /inventory
          </span>
        </div>
        <div className="flex items-center gap-2xs border-t border-border-default px-s py-xs text-caption-xs font-strong text-text-muted">
          <i className={cn('h-[5px] w-[5px]', successDotClassName)} /> Crawl path preserved
        </div>
      </div>
    ),
  },
  {
    title: 'Does the content deserve to rank?',
    body: 'One of the strongest signals a search engine weighs is whether other pages—and people—link to yours. That has to be earned with something worth linking to, not requested.',
    examples: [
      'Long-form guides with a named author and a real publish date, not anonymous filler',
      'Interactive tools people bookmark and share, not just another paragraph of text',
      'Genuine reviews shown on the page itself, not just buried in schema',
      'Guides and location pages cross-linked to each other so authority moves between them',
    ],
    color: 'var(--blue-600)',
    icon: (
      <svg {...iconProps}>
        <rect
          x="6"
          y="24"
          width="24"
          height="16"
          rx="8"
          transform="rotate(-40 18 32)"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <rect
          x="34"
          y="24"
          width="24"
          height="16"
          rx="8"
          transform="rotate(-40 46 32)"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      </svg>
    ),
  },
  {
    title: 'Are high-intent pages missing?',
    body: 'The highest-leverage move is also the easiest to get wrong: splitting a page off to chase a specific search intent, without it reading as a duplicate of the page it came from.',
    examples: [
      'Built from a real gap in the data—a search term or local variant already earning clicks elsewhere with nothing built for it',
      'Different enough in substance—distinct detail, its own FAQs, a genuine reason to exist—that it earns its own ranking instead of getting folded into the original',
      'Launched as a test, not a bet: watched in Search Console to see whether it actually gets indexed and ranks',
      "Kept if it earns its place, folded back in or removed if it doesn't—nothing left cluttering the site just because it was built",
    ],
    color: 'var(--blue-700)',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="32" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="16" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="48" r="5" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M17 32C28 32 28 16 45 16M17 32C28 32 28 48 45 48"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Can AI search understand your public website?',
    body: 'AI answer engines need to understand the page, move through it reliably, and be allowed to read it. We check the practical foundations before anyone promises visibility in AI answers.',
    examples: [
      'A clean accessibility tree that exposes headings, controls, links and page meaning without relying on the visual design',
      'A stable layout that does not move key content or controls around while the page loads',
      "A useful llms.txt file that points AI systems towards the site's important public content",
      'robots.txt rules checked so the crawlers you want can reach public pages while admin, checkout and account areas stay protected',
    ],
    color: 'var(--blue-800)',
    icon: (
      <div
        className="grid w-[168px] grid-cols-2 border border-border-on-dark bg-surface-dark sm:w-[190px]"
        aria-hidden="true"
      >
        <div className={aiCellClassName}>
          <i className={cn('mt-4xs h-[6px] w-[6px]', successDotClassName)} />
          <span className="text-caption-xs font-heavy whitespace-nowrap text-text-on-dark">
            Accessibility
          </span>
          <b className="col-start-2 text-caption-xs font-heavy tracking-label-tight text-accent uppercase">
            Ready
          </b>
        </div>
        <div className={aiCellClassName}>
          <i className={cn('mt-4xs h-[6px] w-[6px]', successDotClassName)} />
          <span className="text-caption-xs font-heavy whitespace-nowrap text-text-on-dark">
            Stable layout
          </span>
          <b className="col-start-2 text-caption-xs font-heavy tracking-label-tight text-accent uppercase">
            Ready
          </b>
        </div>
        <div className={aiCellClassName}>
          <i className={cn('mt-4xs h-[6px] w-[6px]', successDotClassName)} />
          <span className="text-caption-xs font-heavy whitespace-nowrap text-text-on-dark">
            llms.txt
          </span>
          <b className="col-start-2 text-caption-xs font-heavy tracking-label-tight text-accent uppercase">
            Found
          </b>
        </div>
        <div className={aiCellClassName}>
          <i className={cn('mt-4xs h-[6px] w-[6px]', successDotClassName)} />
          <span className="text-caption-xs font-heavy whitespace-nowrap text-text-on-dark">
            robots.txt
          </span>
          <b className="col-start-2 text-caption-xs font-heavy tracking-label-tight text-accent uppercase">
            Open
          </b>
        </div>
      </div>
    ),
  },
];
