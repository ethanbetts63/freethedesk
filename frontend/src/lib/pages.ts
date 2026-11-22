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
    updated: '2026-11-22',
    label: 'Home',
    title: 'Websites, SEO & Business Automation Perth - freethedesk',
    description:
      'Perth websites and SEO audits for WA businesses, with every price on the page, plus web applications and business automation.',
    absoluteTitle: true,
  },
  '/dealers': {
    updated: '2026-11-22',
    label: 'Dealer websites',
    title: 'Dealership Websites & Online Licensing, WA',
    description:
      'One connected system for Perth and WA dealerships: a website built to be found, online licensing, and the admin automation behind it.',
  },
  '/licensing': {
    updated: '2026-11-16',
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
    updated: '2026-11-22',
    label: 'Website development',
    title: 'Website Design Perth: Fixed-Price Packages',
    description:
      'Custom web design and development for Perth businesses: three website packages at fixed prices, built to rank on Google, load fast and bring in enquiries.',
    // Perth rather than Australia, matching the page's own h1 and the local
    // intent the title targets.
    service: {
      name: 'Web Design & Development Perth',
      serviceType: 'Web design, website development and web application development',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/web-design-subiaco': {
    updated: '2026-11-22',
    label: 'Web design Subiaco',
    title: 'Web Design & Development Subiaco',
    description:
      'Web design and development for Subiaco businesses: custom websites in three fixed-price packages, built to show up in local search and bring in enquiries.',
    service: {
      name: 'Web Design Subiaco',
      serviceType: 'Web design, website development and web application development',
      areaServed: { type: 'Place', name: 'Subiaco, Western Australia' },
    },
  },
  '/wordpress-web-design-perth': {
    updated: '2026-11-22',
    label: 'WordPress website redesign',
    title: 'WordPress Website Redesign Perth: Load Faster, Rank Higher',
    description:
      'Web design for Perth businesses still on WordPress: your site rebuilt as an industry-grade website, built to load fast, rank higher and convert more.',
    service: {
      name: 'WordPress Website Redesign Perth',
      serviceType: 'Website redesign and WordPress migration',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/ai-seo-perth': {
    updated: '2026-11-16',
    label: 'AI SEO',
    title: 'AI SEO Perth: Get Named in ChatGPT & AI Overviews',
    description:
      "AI SEO for Perth businesses: what ChatGPT, Google's AI Overviews, Copilot and Perplexity need to find your site, read it and name you. Audits paid once.",
    service: {
      name: 'AI SEO Perth',
      serviceType: 'AI search optimisation (GEO)',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/website-migration-seo-perth': {
    updated: '2026-11-16',
    label: 'Website migration SEO',
    title: 'Website Migration SEO Perth: Keep Your Rankings',
    description:
      'Moving to a new website, platform or domain? Keep the searches your old site wins: every ranking page found, redirected to its replacement and checked after launch.',
    service: {
      name: 'Website Migration SEO Perth',
      serviceType: 'Website migration SEO',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/automation': {
    updated: '2026-11-16',
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
    updated: '2026-11-16',
    label: 'SEO',
    title: 'SEO Audit Perth: Technical, Local & AI Search',
    description: `Organic clicks up ${SCOOTER_SHOP_GROWTH.percent}% for a Perth dealer. Each audit is a written SEO report of your site: the searches you're losing and what to fix.`,
    service: {
      name: 'SEO Audit Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/google-business-profile-optimisation': {
    updated: '2026-11-16',
    label: 'Business Profile optimisation',
    title: 'Google Business Profile Optimisation Perth',
    description:
      'Your Google Business Profile set up properly for a fixed $650, paid once: categories, services and prices, photos, posts, review replies and links that agree with your site.',
    service: {
      name: 'Google Business Profile Optimisation Perth',
      serviceType: 'Google Business Profile optimisation',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/tradies': {
    updated: '2026-11-16',
    label: 'Tradies',
    title: 'SEO for Tradies Perth: Technical, Local & AI Search',
    description:
      "A written SEO report of your trade website: the local jobs you're losing on Google and what to fix. For plumbers, electricians and every trade.",
    service: {
      name: 'SEO for Tradies Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/builders': {
    updated: '2026-11-16',
    label: 'Builders',
    title: 'SEO for Builders Perth: Technical, Local & AI Search',
    description:
      "A written SEO report of your building website: the project searches you're losing and what to fix. For home builders, renovators and building trades.",
    service: {
      name: 'SEO for Builders Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/health-clinics': {
    updated: '2026-11-16',
    label: 'Health clinics',
    title: 'SEO for Health Clinics Perth: Local & AI Search',
    description:
      "A written SEO report of your clinic's website: the patient searches you're losing and what to fix. For physios, podiatrists, chiros and allied health.",
    service: {
      name: 'SEO for Health Clinics Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/professional-services': {
    updated: '2026-11-16',
    label: 'Professional services',
    title: 'SEO for Professional Services Perth: Local & AI Search',
    description:
      "A written SEO report of your firm's website: the client searches you're losing and what to fix. For lawyers, accountants, brokers and professional firms.",
    service: {
      name: 'SEO for Professional Services Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },
  '/seo/dealerships': {
    updated: '2026-11-16',
    label: 'Dealerships',
    title: 'SEO for Dealerships Perth: Technical, Local & AI Search',
    description:
      "A written SEO report of your dealership's website: the stock and model searches you're losing and what to fix. For car, motorcycle, caravan and boat dealers.",
    service: {
      name: 'SEO for Dealerships Perth',
      serviceType: 'SEO audits and consulting',
      areaServed: { type: 'City', name: 'Perth' },
    },
  },

  '/seo/sample-report': {
    updated: '2026-11-16',
    label: 'Sample report',
    title: 'Sample SEO Report: What an Audit Includes',
    description:
      'A sample SEO report for an invented Perth plumber: ranked fixes with cost and impact, what each change did, and the questions its data answers.',
  },
  '/guides': {
    updated: '2026-11-04',
    label: 'Guides',
    title: 'SEO & Website Development Guides for Perth',
    description:
      'Practical guides for Perth businesses on SEO, website development and what each costs, with automation and dealer licensing besides.',
  },
  '/portfolio/scooter-shop': {
    updated: '2026-11-22',
    label: 'Scooter Shop',
    title: 'Scooter Shop Case Study: Dealer Website & SEO',
    description:
      "How a Perth scooter dealership's website grew: three decisions made from its own search data, what changed, and what the data said afterwards.",
    ogImage: '/case-studies/scooter-shop/home-desktop.png',
  },
  '/portfolio/bloomprint': {
    updated: '2026-11-22',
    label: 'Bloomprint',
    title: 'Bloomprint Case Study: Flower Delivery Marketplace',
    description:
      'A two-sided flower delivery marketplace: brief-led ordering for customers, paid local orders for florists, and landing pages built to be found.',
    ogImage: '/case-studies/bloomprint/home-desktop.png',
  },
  '/affiliates': {
    updated: '2026-11-16',
    label: 'Affiliates',
    title: 'SEO Audit Affiliate Program: 50% Commission',
    description:
      'Earn 50% of every freethedesk SEO audit sold with your code, $220 to $560 a sale. Your audience gets 20% off, your own audit is free, and you are paid fortnightly.',
  },
  '/contact': {
    updated: '2026-11-16',
    label: 'Contact',
    title: 'Contact Us: SEO in Perth',
    description:
      'Call or email freethedesk, Dianella-based and by appointment only, or leave your number and we will ring you back about your site.',
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
    updated: '2026-11-16',
    label: 'SEO audit terms',
    title: 'SEO Audit Terms',
    description: 'Terms for freethedesk SEO audits: Essentials, Plus and Complete, each paid once.',
  },
  '/legal/affiliate-program-terms': {
    updated: '2026-10-26',
    label: 'Affiliate program terms',
    title: 'Affiliate Program Terms',
    description:
      'Terms for the freethedesk podcast affiliate program: your code, the listener discount, and how half of every audit is paid to you.',
  },
  '/legal/web-development-terms': {
    updated: '2026-11-04',
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
