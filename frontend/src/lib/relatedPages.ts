/**
 * The block of related pages a service page, guide or case study ends on: one
 * place that says which pages lead to which, so every page is linked from the
 * pages a buyer reads beside it and none is left reachable only from the menu.
 */

export interface RelatedLink {
  href: string;
  label: string;
  /** One line on what the reader finds there. */
  line: string;
  /** Opens in a new tab: a page the reader looks at and comes back from. */
  newTab?: boolean;
  /** The card's picture, a path under `public/`; none, and the card shows the page's icon. */
  image?: string;
}

const LINKS = {
  websites: {
    href: '/website-development',
    label: 'Website development',
    line: 'Fixed-price websites, from one page to ten.',
    image: '/images/pages/website-development.webp',
  },
  redesign: {
    href: '/website-redesign-perth',
    label: 'Website redesign',
    line: 'Moving off WordPress without losing the searches you win.',
    image: '/images/pages/website-redesign-perth.webp',
  },
  aiSeo: {
    href: '/ai-seo-perth',
    label: 'AI SEO',
    line: 'Get your business named in ChatGPT and AI Overviews.',
  },
  migration: {
    href: '/website-migration-seo-perth',
    label: 'Website migration SEO',
    line: 'Moving site, platform or domain without losing your rankings.',
  },
  seo: {
    href: '/seo',
    label: 'SEO audits',
    line: 'A ranked, written plan of what to fix first.',
    image: '/images/pages/seo.webp',
  },
  gbp: {
    href: '/google-business-profile-optimisation',
    label: 'Business Profile optimisation',
    line: 'Your Google Business Profile set up properly, paid once.',
    image: '/images/pages/google-business-profile-optimisation.webp',
  },
  tradies: {
    href: '/seo/tradies',
    label: 'SEO for tradies',
    line: 'SEO audits for plumbers, electricians and every trade.',
    image: '/images/pages/seo-tradies.webp',
  },
  builders: {
    href: '/seo/builders',
    label: 'SEO for builders',
    line: 'SEO audits for home builders and renovators.',
    image: '/images/pages/seo-builders.webp',
  },
  healthClinics: {
    href: '/seo/health-clinics',
    label: 'SEO for health clinics',
    line: 'SEO audits for physios, podiatrists and allied health.',
    image: '/images/pages/seo-health-clinics.webp',
  },
  professionalServices: {
    href: '/seo/professional-services',
    label: 'SEO for professional services',
    line: 'SEO audits for lawyers, accountants and brokers.',
    image: '/images/pages/seo-professional-services.webp',
  },
  dealerships: {
    href: '/seo/dealerships',
    label: 'SEO for dealerships',
    line: 'SEO audits for car, motorcycle, caravan and boat dealers.',
  },

  sampleReport: {
    href: '/seo/sample-report',
    label: 'Sample SEO report',
    line: 'Read a whole audit before you buy one.',
    newTab: true,
    // The report's cover: its site in a browser, and on a phone.
    image: '/case-studies/sample-report/cover-desktop.png',
  },
  automation: {
    href: '/automation',
    label: 'Business automation',
    line: 'Your systems connected, starting with a paid discovery.',
    image: '/images/pages/automation.webp',
  },
  dealers: {
    href: '/dealers',
    label: 'Dealer websites',
    line: 'Websites built for the way a dealership sells.',
    image: '/images/pages/dealers.webp',
  },
  licensing: {
    href: '/licensing',
    label: 'Online licensing',
    line: 'Customers fill in and sign their vehicle paperwork online.',
    image: '/images/pages/licensing.webp',
  },
  scooterShop: {
    href: '/portfolio/scooter-shop',
    label: 'Scooter Shop case study',
    line: 'A Perth dealership: stock, service and licensing in one site.',
    image: '/case-studies/scooter-shop/home-desktop.png',
  },
  bloomprint: {
    href: '/portfolio/bloomprint',
    label: 'Bloomprint case study',
    line: 'A flower marketplace with customers on one side and florists on the other.',
    // The case study's desktop shot cut to the card's 3:2 from the left, so the headline stays.
    image: '/case-studies/bloomprint/home-desktop-tile.png',
  },
  wordpressCost: {
    href: '/wordpress-website-cost-perth',
    label: 'WordPress website cost in Perth',
    line: 'What a WordPress site really costs to build and keep.',
  },
  websiteCost: {
    href: '/website-cost-perth',
    label: 'Website cost in Perth',
    line: 'What each kind of site costs to build and run.',
  },
  seoCost: {
    href: '/seo-cost-perth',
    label: 'SEO cost in Perth',
    line: 'Audits, retainers and paid clicks, side by side.',
  },
  notShowing: {
    href: '/business-not-showing-up-on-google',
    label: "Why isn't my business showing up on Google?",
    line: 'The usual reasons, and how to check each one.',
  },
  aiSearch: {
    href: '/how-to-show-up-in-ai-search',
    label: 'How to show up in AI search',
    line: "What ChatGPT and Google's AI answers draw on.",
  },
  whatToAutomate: {
    href: '/what-to-automate-in-a-small-business',
    label: 'What to automate first',
    line: 'Where a small business gets its time back soonest.',
  },
  dealerOnline: {
    href: '/dealer-online-wa',
    label: 'Dealer Online WA',
    line: 'The login, who can join, and what it leaves on paper.',
  },
} as const satisfies Record<string, RelatedLink>;

type Key = keyof typeof LINKS;

/** Each page's block: a heading naming what is in it, and the pages in order. */
const RELATED: Record<string, { title: string; links: readonly Key[] }> = {
  '/': {
    title: 'SEO audits, case studies and the sample report',
    links: ['seo', 'scooterShop', 'bloomprint', 'sampleReport'],
  },
  '/website-development': {
    title: 'SEO audits, redesigns and case studies',
    links: ['seo', 'redesign', 'bloomprint', 'scooterShop'],
  },
  '/web-design-subiaco': {
    title: 'SEO audits, redesigns and case studies',
    links: ['seo', 'redesign', 'bloomprint', 'scooterShop'],
  },
  '/website-redesign-perth': {
    title: 'SEO audits, new websites, WordPress costs and migration SEO',
    links: ['seo', 'websites', 'wordpressCost', 'migration'],
  },
  '/ai-seo-perth': {
    title: 'SEO audits, the AI search guide, the sample report and profile optimisation',
    links: ['seo', 'aiSearch', 'sampleReport', 'gbp'],
  },
  '/website-migration-seo-perth': {
    title: 'SEO audits, redesigns, the sample report and a case study',
    links: ['seo', 'redesign', 'sampleReport', 'scooterShop'],
  },
  '/seo': {
    title: 'The sample report, profile optimisation and our search guides',
    links: ['sampleReport', 'gbp', 'notShowing', 'aiSearch'],
  },
  '/seo/tradies': {
    title: 'SEO audits, the sample report, profile optimisation and another industry',
    links: ['seo', 'sampleReport', 'gbp', 'builders'],
  },
  '/seo/builders': {
    title: 'SEO audits, the sample report, profile optimisation and another industry',
    links: ['seo', 'sampleReport', 'gbp', 'tradies'],
  },
  '/seo/health-clinics': {
    title: 'SEO audits, the sample report, profile optimisation and another industry',
    links: ['seo', 'sampleReport', 'gbp', 'professionalServices'],
  },
  '/seo/professional-services': {
    title: 'SEO audits, the sample report, profile optimisation and another industry',
    links: ['seo', 'sampleReport', 'gbp', 'healthClinics'],
  },
  '/seo/dealerships': {
    title: 'SEO audits, the sample report, dealer websites and a dealer case study',
    links: ['seo', 'sampleReport', 'dealers', 'scooterShop'],
  },

  '/google-business-profile-optimisation': {
    title: 'SEO audits, the sample report and local search',
    links: ['seo', 'sampleReport', 'notShowing'],
  },
  '/affiliates': {
    title: 'The audits you would be recommending',
    links: ['seo', 'sampleReport', 'scooterShop'],
  },
  '/automation': {
    title: 'SEO audits, an automation guide and a case study',
    links: ['seo', 'whatToAutomate', 'scooterShop', 'websites'],
  },
  '/dealers': {
    title: 'Dealership SEO, online licensing, Dealer Online and a dealer case study',
    links: ['dealerships', 'licensing', 'dealerOnline', 'scooterShop'],
  },
  '/licensing': {
    title: 'SEO audits, Dealer Online, dealer websites and a dealer case study',
    links: ['seo', 'dealerOnline', 'dealers', 'scooterShop'],
  },
  '/portfolio/scooter-shop': {
    title: 'SEO audits, another case study and the services behind this one',
    links: ['seo', 'bloomprint', 'dealers', 'websites'],
  },
  '/portfolio/bloomprint': {
    title: 'SEO audits, another case study and the services behind this one',
    links: ['seo', 'scooterShop', 'websites'],
  },
  '/business-not-showing-up-on-google': {
    title: 'SEO audits, profile optimisation and AI search',
    links: ['seo', 'gbp', 'sampleReport', 'aiSearch'],
  },
  '/how-to-show-up-in-ai-search': {
    title: 'SEO audits, AI SEO, the sample report and Google',
    links: ['seo', 'aiSeo', 'sampleReport', 'notShowing'],
  },
  '/dealer-online-wa': {
    title: 'SEO audits, online licensing, dealer websites and a dealer case study',
    links: ['seo', 'licensing', 'dealers', 'scooterShop'],
  },
  '/what-to-automate-in-a-small-business': {
    title: 'SEO audits, automation and a case study',
    links: ['seo', 'automation', 'scooterShop', 'websites'],
  },
  '/wordpress-website-cost-perth': {
    title: 'SEO audits, redesigns, new websites and a case study',
    links: ['seo', 'redesign', 'websites', 'bloomprint'],
  },
  '/seo-cost-perth': {
    title: 'SEO audits, the sample report and search guides',
    links: ['seo', 'sampleReport', 'notShowing', 'aiSearch'],
  },
  '/website-cost-perth': {
    title: 'SEO audits, new websites, WordPress costs and redesigns',
    links: ['seo', 'websites', 'wordpressCost', 'redesign'],
  },
};

export function relatedPagesFor(path: string): { title: string; links: RelatedLink[] } | null {
  const entry = RELATED[path];
  return entry ? { title: entry.title, links: entry.links.map((key) => LINKS[key]) } : null;
}

/**
 * A page's own illustration, the picture on its card in other pages' related blocks, for its
 * call-back panel. Only the drawn pictures under `/images/`, not the case studies' screenshots.
 */
export function pagePicture(path: string): string | undefined {
  const own = (Object.values(LINKS) as RelatedLink[]).find((link) => link.href === path);
  return own?.image?.startsWith('/images/') ? own.image : undefined;
}
