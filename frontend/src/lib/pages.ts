import type { Metadata } from 'next';

import { SCOOTER_SHOP_GROWTH } from './caseStudies';
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
    updated: '2026-10-24',
    label: 'Home',
    title: 'Websites, SEO & Business Automation Perth - freethedesk',
    description:
      'Perth websites and SEO audits for WA businesses, with every price on the page, plus web applications and business automation.',
    absoluteTitle: true,
  },
  '/dealers': {
    updated: '2026-10-24',
    label: 'Dealer websites',
    title: 'Dealership Websites & Online Licensing, WA',
    description:
      'One connected system for Perth and WA dealerships: a website built to be found, online licensing, and the admin automation behind it.',
  },
  '/licensing': {
    updated: '2026-10-24',
    label: 'Online licensing',
    title: 'Online Vehicle Licensing for WA Dealers',
    description:
      'Let Perth customers verify their identity, complete vehicle licensing and sign paperwork online, without another trip across town to the dealership.',
    service: {
      name: 'Online Vehicle Licensing Perth',
      serviceType: 'Online vehicle licensing and contract signing',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/website-development': {
    updated: '2026-10-24',
    label: 'Website development',
    title: 'Web Design & Development Perth',
    description:
      'Fixed-price web design and development for Perth businesses that need more than a template: custom websites, ecommerce, integrations and web applications.',
    // Perth rather than Australia, matching the page's own "Web design &
    // development Perth" eyebrow and the local intent the title targets.
    service: {
      name: 'Web Design & Development Perth',
      serviceType: 'Web design, website development and web application development',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/web-design-subiaco': {
    updated: '2026-10-24',
    label: 'Web design Subiaco',
    title: 'Web Design Subiaco',
    description:
      'Web design and development for Subiaco businesses: custom websites priced per page, built to show up in local search and automate the admin behind them.',
    service: {
      name: 'Web Design Subiaco',
      serviceType: 'Web design, website development and web application development',
      areaServed: { type: 'Place', name: 'Subiaco, Western Australia' },
    },
  },
  '/website-redesign-perth': {
    updated: '2026-10-24',
    label: 'Website redesign',
    title: 'Website Redesign Perth: Moving Off WordPress',
    description:
      'Website redesign for Perth businesses moving off WordPress: a custom-coded site with no plugins to update, moved across so your Google rankings come too.',
    service: {
      name: 'Website Redesign Perth',
      serviceType: 'Website redesign and WordPress migration',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/automation': {
    updated: '2026-10-24',
    label: 'Automation',
    title: 'Business & AI Automation Perth',
    description:
      'Practical workflow automation and custom integrations for Perth small and medium businesses.',
    service: {
      name: 'Business Automation Perth',
      serviceType: 'Workflow automation and systems integration',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo': {
    updated: '2026-10-26',
    label: 'SEO',
    title: 'SEO Audit & Reporting Perth',
    description: `Organic clicks up ${SCOOTER_SHOP_GROWTH.percent}% for a Perth dealer. Each audit is a written SEO report of your site: the searches you're losing and what to fix.`,
    service: {
      name: 'SEO Audit Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/sample-report': {
    updated: '2026-10-24',
    label: 'Sample report',
    title: 'Sample SEO Report: What an Audit Includes',
    description:
      'A sample SEO report for an invented Perth plumber: ranked fixes with cost and impact, what each change did, and the questions its data answers.',
  },
  '/guides': {
    updated: '2026-10-24',
    label: 'Guides',
    title: 'Website, SEO & Automation Guides',
    description:
      'Practical guides for Perth businesses on websites, web applications, search visibility, automation and the systems behind them.',
  },
  '/portfolio/scooter-shop': {
    updated: '2026-10-24',
    label: 'Scooter Shop',
    title: 'Perth Dealer Website Case Study: Scooter Shop',
    description:
      'A connected website for a Perth scooter dealership: sales, online purchasing, licensing, parts, service, hire and long-term organic growth.',
    ogImage: '/case-studies/scooter-shop/home-desktop.png',
  },
  '/portfolio/bloomprint': {
    updated: '2026-10-24',
    label: 'Bloomprint',
    title: 'Marketplace Website Case Study: Bloomprint',
    description:
      'A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for florists, and landing pages built to be found.',
    ogImage: '/case-studies/bloomprint/home-desktop.png',
  },
  '/affiliates': {
    updated: '2026-10-26',
    label: 'Podcast affiliates',
    title: 'Podcast Affiliate Program: Earn Half of Every SEO Audit',
    description:
      'Recommend freethedesk SEO audits to your listeners and earn 50% of every audit sold with your code. Your own audit is free. Sign up in a minute.',
  },
  '/contact': {
    updated: '2026-10-24',
    label: 'Contact',
    title: 'Contact Us: Perth Websites, SEO & Automation',
    description:
      'Talk to freethedesk, a Perth team, about a custom website, SEO audit, online licensing, web application or business automation project.',
  },
  '/legal/privacy': {
    updated: '2026-10-24',
    label: 'Privacy policy',
    title: 'Privacy Policy',
    description: 'How freethedesk collects, uses, stores and discloses personal information.',
  },
  '/legal/customer-terms': {
    updated: '2026-10-24',
    label: 'Customer terms',
    title: 'Customer Terms',
    description:
      'Terms for a customer completing vehicle paperwork through a dealership on freethedesk.',
  },
  '/legal/dealer-subscription-terms': {
    updated: '2026-10-24',
    label: 'Dealer subscription terms',
    title: 'Dealer Subscription Terms',
    description: 'Terms for freethedesk dealer licensing and contract subscriptions.',
  },
  '/legal/seo-audit-terms': {
    updated: '2026-10-24',
    label: 'SEO audit terms',
    title: 'SEO Audit Terms',
    description: 'Terms for freethedesk SEO audits: Essentials, Plus and Complete, each paid once.',
  },
  '/legal/affiliate-program-terms': {
    updated: '2026-10-25',
    label: 'Affiliate program terms',
    title: 'Affiliate Program Terms',
    description:
      'Terms for the freethedesk podcast affiliate program: your code, the listener discount, and how half of every audit is paid to you.',
  },
  '/legal/web-development-terms': {
    updated: '2026-10-24',
    label: 'Web development terms',
    title: 'Web Development Terms',
    description:
      'Terms for freethedesk website packages, web application and automation discovery, and builds.',
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
  return buildBreadcrumbItems(path, label ?? title)
    .filter((item) => item.path in STATIC_PAGES)
    .map((item) =>
      // A parent crumb takes its page's label, so /seo reads "SEO", not "Seo".
      item.path === '/' || item.path === path
        ? item
        : { ...item, name: STATIC_PAGES[item.path as PagePath].label ?? item.name },
    );
}
