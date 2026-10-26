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
}

const LINKS = {
  websites: {
    href: '/website-development',
    label: 'Website development',
    line: 'Fixed-price websites, from one page to ten.',
  },
  redesign: {
    href: '/website-redesign-perth',
    label: 'Website redesign',
    line: 'Moving off WordPress without losing the searches you win.',
  },
  seo: { href: '/seo', label: 'SEO audits', line: 'A ranked, written plan of what to fix first.' },
  sampleReport: {
    href: '/seo/sample-report',
    label: 'Sample SEO report',
    line: 'Read a whole audit before you buy one.',
    newTab: true,
  },
  automation: {
    href: '/automation',
    label: 'Business automation',
    line: 'Your systems connected, starting with a paid discovery.',
  },
  dealers: {
    href: '/dealers',
    label: 'Dealer websites',
    line: 'Websites built for the way a dealership sells.',
  },
  licensing: {
    href: '/licensing',
    label: 'Online licensing',
    line: 'Customers fill in and sign their vehicle paperwork online.',
  },
  scooterShop: {
    href: '/portfolio/scooter-shop',
    label: 'Scooter Shop case study',
    line: 'A Perth dealership: stock, service and licensing in one site.',
  },
  bloomprint: {
    href: '/portfolio/bloomprint',
    label: 'Bloomprint case study',
    line: 'A flower marketplace with customers on one side and florists on the other.',
  },
  wordpressCost: {
    href: '/wordpress-website-cost-perth',
    label: 'WordPress website cost in Perth',
    line: 'What a WordPress site really costs to build and keep.',
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
    title: 'Case studies and the sample report',
    links: ['scooterShop', 'bloomprint', 'sampleReport', 'wordpressCost'],
  },
  '/website-development': {
    title: 'Redesigns, case studies and costs',
    links: ['redesign', 'bloomprint', 'scooterShop', 'wordpressCost'],
  },
  '/web-design-subiaco': {
    title: 'Redesigns, case studies and costs',
    links: ['redesign', 'bloomprint', 'scooterShop', 'wordpressCost'],
  },
  '/website-redesign-perth': {
    title: 'New websites, WordPress costs and case studies',
    links: ['websites', 'wordpressCost', 'bloomprint', 'scooterShop'],
  },
  '/seo': {
    title: 'The sample report and our search guides',
    links: ['sampleReport', 'notShowing', 'aiSearch', 'scooterShop'],
  },
  '/affiliates': {
    title: 'The audits you would be recommending',
    links: ['seo', 'sampleReport', 'scooterShop'],
  },
  '/automation': {
    title: 'An automation guide and a case study',
    links: ['whatToAutomate', 'scooterShop', 'websites'],
  },
  '/dealers': {
    title: 'Online licensing, Dealer Online and a dealer case study',
    links: ['licensing', 'dealerOnline', 'scooterShop'],
  },
  '/licensing': {
    title: 'Dealer Online, dealer websites and a dealer case study',
    links: ['dealerOnline', 'dealers', 'scooterShop'],
  },
  '/portfolio/scooter-shop': {
    title: 'Another case study, and the services behind this one',
    links: ['bloomprint', 'dealers', 'websites', 'seo'],
  },
  '/portfolio/bloomprint': {
    title: 'Another case study, and the services behind this one',
    links: ['scooterShop', 'websites', 'seo'],
  },
  '/business-not-showing-up-on-google': {
    title: 'SEO audits, the sample report and AI search',
    links: ['seo', 'sampleReport', 'aiSearch'],
  },
  '/how-to-show-up-in-ai-search': {
    title: 'SEO audits, the sample report and Google',
    links: ['seo', 'sampleReport', 'notShowing'],
  },
  '/dealer-online-wa': {
    title: 'Online licensing, dealer websites and a dealer case study',
    links: ['licensing', 'dealers', 'scooterShop'],
  },
  '/what-to-automate-in-a-small-business': {
    title: 'Automation and a case study',
    links: ['automation', 'scooterShop', 'websites'],
  },
  '/wordpress-website-cost-perth': {
    title: 'Redesigns, new websites and a case study',
    links: ['redesign', 'websites', 'bloomprint', 'notShowing'],
  },
};

export function relatedPagesFor(path: string): { title: string; links: RelatedLink[] } | null {
  const entry = RELATED[path];
  return entry ? { title: entry.title, links: entry.links.map((key) => LINKS[key]) } : null;
}
