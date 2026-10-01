import type { Metadata } from 'next';

import { buildBreadcrumbItems, buildMetadata, type ServiceDefinition } from './seo';

export interface StaticPage {
  title: string;
  description: string;

  /**
   * ISO date of the last material content change; emitted as `dateModified`
   * and as the sitemap's `<lastmod>`.
   *
   * Required, not optional. A freshness signal is only worth having if it is
   * maintained, so the rule is: change a page, bump its date in the same
   * commit. Required rather than optional means a new page cannot ship without
   * one — `tsc` refuses it. See the lastmod line in AGENTS.md.
   */
  updated: string;

  /**
   * Short name for the final breadcrumb crumb. Breadcrumbs are rendered by
   * Google, so they need a plain label - the SEO `title` carries a tagline and
   * a keyword tail that read as noise in a trail.
   */
  label?: string;

  absoluteTitle?: boolean;
  ogImage?: string;

  /**
   * Set on a page that sells something, to emit a `Service` node alongside the
   * `WebPage` one. `areaServed` is per page on purpose: most of what we do is
   * delivered nationally, but the website-development page targets Perth and
   * says so, and schema should agree with the copy above it rather than with a
   * sitewide default.
   */
  service?: ServiceDefinition;
}

export const STATIC_PAGES = {
  '/': {
    updated: '2026-10-01',
    label: 'Home',
    title: 'Dealer Websites & Business Automation Perth | freethedesk',
    description:
      'Dealer websites and operational systems for Australian vehicle, equipment and leisure dealerships.',
    absoluteTitle: true,
  },
  '/dealers': {
    updated: '2026-10-01',
    label: 'Dealer websites',
    title: 'Dealership Websites & Online Licensing | Australia, Perth',
    description:
      'One connected system for your dealership: a website built to be found, online licensing, and the admin automation behind it, priced against the tools it replaces.',
  },
  '/licensing': {
    updated: '2026-10-01',
    label: 'Online licensing',
    title: 'Online Vehicle Licensing for Dealers | Australia',
    description:
      'Let customers verify their identity, complete vehicle licensing and sign paperwork online without an unnecessary dealership visit.',
    service: {
      name: 'Online Vehicle Licensing',
      serviceType: 'Online vehicle licensing and contract signing',
      areaServed: { type: 'Country', name: 'Australia' },
    },
  },
  '/website-development': {
    updated: '2026-10-01',
    label: 'Website development',
    title: 'Website Development Perth | Make your website work harder',
    description:
      'Website Development for businesses that need more than a template: custom websites, ecommerce, integrations and practical web applications.',
    absoluteTitle: true,
    // Perth rather than Australia, matching the page's own "Website development
    // Perth" eyebrow and the local intent the title targets.
    service: {
      name: 'Website Development Perth',
      serviceType: 'Website development and web application development',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/dealership-website-builder': {
    updated: '2026-10-01',
    label: 'Website builder',
    title: 'Dealership Website Builder | Custom Dealer Websites',
    description:
      'Configure a dealership website around the way your business sells, books and grows.',
  },
  '/automation': {
    updated: '2026-10-01',
    label: 'Automation',
    title: 'Business Automation Australia | Stop paying for copy-paste',
    description:
      'Practical workflow automation and custom integrations for Australian small and medium businesses.',
    service: {
      name: 'Business Automation',
      serviceType: 'Workflow automation and systems integration',
      areaServed: { type: 'Country', name: 'Australia' },
    },
  },
  '/seo': {
    updated: '2026-10-01',
    label: 'SEO reports',
    title: 'Find your missing clicks | SEO Reports & Audits Australia',
    description:
      'See what is working, what is holding your website back and where the best search opportunities are.',
    service: {
      name: 'Quarterly SEO Reports',
      serviceType: 'SEO consulting and reporting',
      areaServed: { type: 'Country', name: 'Australia' },
    },
  },
  '/guides': {
    updated: '2026-09-09',
    label: 'Guides',
    title: 'Steal our playbook | Dealership Website & Automation Guides',
    description:
      'Practical guides for Australian dealerships on websites, search visibility, online sales, licensing and better operational systems.',
  },
  '/portfolio/scooter-shop': {
    updated: '2026-10-01',
    label: 'Scooter Shop',
    title: 'Dealer Website Case Study | Organic Clicks Up 300%',
    description:
      'A connected dealership website for sales, online purchasing, licensing, parts, service, hire and long-term organic growth.',
    ogImage: '/case-studies/scooter-shop/home-desktop.png',
  },
  '/portfolio/bloomprint': {
    updated: '2026-10-01',
    label: 'Bloomprint',
    title: 'Marketplace Website Case Study | Bloomprint Flowers',
    description:
      'A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for independent florists, and a landing page system built to be found.',
    ogImage: '/case-studies/bloomprint/home-desktop.png',
  },
  '/contact': {
    updated: '2026-10-01',
    label: 'Contact',
    title: 'Website & Automation Developers Perth | Contact',
    description:
      'Talk to freethedesk about a custom website, online licensing product, web application or business automation project.',
  },
  '/legal/privacy': {
    updated: '2026-09-19',
    label: 'Privacy policy',
    title: 'Privacy Policy',
    description: 'How freethedesk collects, uses, stores and discloses personal information.',
  },
  '/legal/customer-terms': {
    updated: '2026-09-19',
    label: 'Customer terms',
    title: 'Customer Terms',
    description:
      'Terms for a customer completing vehicle paperwork through a dealership on freethedesk.',
  },
  '/legal/dealer-subscription-terms': {
    updated: '2026-09-19',
    label: 'Dealer subscription terms',
    title: 'Dealer Subscription Terms',
    description: 'Terms for freethedesk dealer licensing and contract subscriptions.',
  },
  '/legal/seo-subscription-terms': {
    updated: '2026-09-19',
    label: 'SEO reporting terms',
    title: 'SEO Reporting & Audit Terms',
    description: 'Terms for freethedesk SEO reporting and audit services.',
  },
} as const satisfies Record<string, StaticPage>;

export type PagePath = keyof typeof STATIC_PAGES;

/**
 * Static routes that are crawlable but not indexable — state 3 of
 * seo-standard.md section 2, which this registry could not express at all
 * until 2026-09-20.
 *
 * Each one's `page.tsx` must `export const metadata = NOINDEX_METADATA`, and
 * `check-indexation-ledger.mjs` fails the build when one does not: listing a
 * route here is not what makes it noindexed, and a ledger that only checks the
 * decision was recorded is worse than none.
 *
 * `noindex` rather than a robots.txt disallow, because noindex needs the page
 * crawled to take effect: a disallowed page can still surface as a bare URL
 * with no title if anything external links to it.
 */
export const STATIC_NOINDEX_PAGES: string[] = [];

/**
 * What a noindex route's `page.tsx` must export for its declaration above to
 * be true. Mirrors bloomprint's `NOINDEX_METADATA`.
 */
export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Routes whose page is only a `redirect`/`permanentRedirect` call — no content
 * is ever served, so no indexation decision applies to the URL itself; the
 * destination carries its own. Listed so the indexation ledger doesn't flag a
 * stub as an undeclared route. Mirrors allbikes' `REDIRECT_STUBS`.
 */
export const REDIRECT_STUBS: string[] = [
  '/blog',
  '/blog/[slug]',
  // The customer dashboard's first home, in early sale-link emails; → /dashboard/user.
  '/account',
];

// `/dashboard` is deliberately NOT here. It bounces to /dashboard/enquiries
// AND is robots-disallowed, and seo-standard.md section 2 wants exactly one
// bucket per route. Disallowed is the real statement — the whole tree is a
// staff area — so the stub entry was the redundant one.

/**
 * Route *families* whose pages are generated from data rather than
 * hand-authored, one entry per distinct dynamic `page.tsx`. Mirrors allbikes'
 * `DYNAMIC_ROUTE_FAMILIES` — see that file for the state definitions.
 *
 * FreeTheDesk's only public one is the guides article route; everything else
 * dynamic (`/dashboard/admin/**`) is private and already covered by the robots.txt
 * disallow, not by this registry.
 */
export interface DynamicRouteFamily {
  /** The route as it appears in the app tree, dynamic segments included. */
  pattern: string;
  /** One of the four ledger states, or 'conditional' when it varies by record. */
  state: 'listed' | 'unlisted' | 'noindex' | 'conditional';
  /**
   * Where the real per-record decision is made, split into a module and a
   * symbol so the ledger can assert both still exist. As one prose string this
   * was read by nothing, and a renamed resolver rotted it silently.
   *
   * Deliberately not a function reference: the resolvers live in `lib/seo.ts`
   * and `app/sitemap.ts`, which pull in the server API client, so importing
   * them here would drag that graph into the one module every build-time check
   * loads. A path plus a symbol is verifiable without the import edge.
   */
  policyModule: string;
  /** A named export, or any distinctive line, inside `policyModule`. */
  policySymbol?: string;
  /** Why it resolves the way it does. Prose, for a human. */
  policyNote?: string;
}

export const DYNAMIC_ROUTE_FAMILIES: DynamicRouteFamily[] = [
  {
    pattern: '/[slug]',
    state: 'listed',
    policyModule: 'lib/articles.ts',
    policySymbol: 'getAllArticleMeta',
    policyNote: 'every article is published, none are noindex',
  },
];

export function metadataFor(path: PagePath): Metadata {
  const page: StaticPage = STATIC_PAGES[path];
  return buildMetadata({ ...page, path });
}

/**
 * Breadcrumb trail for a page, with the short `label` as the final crumb.
 *
 * Segments that are not real pages are dropped: `/portfolio` and `/legal` are
 * directories with no route of their own, and both 404. Linking or publishing a
 * crumb that 404s is worse than a shorter trail, and running the visible
 * breadcrumbs and the BreadcrumbList schema off this one function is what keeps
 * the two from drifting apart.
 */
export function breadcrumbItemsFor(path: PagePath): { name: string; path: string }[] {
  const { title, label } = STATIC_PAGES[path];
  return buildBreadcrumbItems(path, label ?? title).filter((item) => item.path in STATIC_PAGES);
}
