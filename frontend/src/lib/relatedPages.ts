/**
 * The block of related pages a service page, guide or case study ends on: one
 * place that says which pages lead to which, so every page is linked from the
 * pages a buyer reads beside it and none is left reachable only from the menu.
 *
 * Every block opens on the two pages that sell a website, and each page adds
 * its own cards after them to make four.
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
    line: 'Custom websites in three fixed-price packages.',
    image: '/images/pages/website-development.webp',
  },
  redesign: {
    href: '/wordpress-web-design-perth',
    label: 'WordPress website redesign',
    line: 'Your WordPress site rebuilt to load faster and rank higher.',
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
  smallBusinessSeo: {
    href: '/small-business-seo-perth',
    label: 'Small business SEO in Perth',
    line: 'Titles, headings, a page per service and your Business Profile.',
  },
  chooseDesigner: {
    href: '/how-to-choose-a-web-designer-perth',
    label: 'How to choose a web designer in Perth',
    line: 'What to ask, what you should own and what to walk away from.',
  },
  builderOrDesigner: {
    href: '/website-builder-vs-web-designer-perth',
    label: 'Website builder or web designer?',
    line: 'Wix, Squarespace, WordPress or custom, side by side.',
  },
  dealerOnline: {
    href: '/dealer-online-wa',
    label: 'Dealer Online WA',
    line: 'The login, who can join, and what it leaves on paper.',
  },
} as const satisfies Record<string, RelatedLink>;

type Key = keyof typeof LINKS;

/** The cards every block opens on. A page leaves its own out, and lists a third card of its own instead. */
const ALWAYS = ['websites', 'redesign'] as const satisfies readonly Key[];

type OwnKey = Exclude<Key, (typeof ALWAYS)[number]>;

/** Each page's block: a heading naming what is in it, and the page's own cards, in order, after the two above. */
const RELATED: Record<string, { title: string; links: readonly OwnKey[] }> = {
  '/': {
    title: 'Websites, WordPress redesigns, SEO audits and a case study',
    links: ['seo', 'scooterShop'],
  },
  '/website-development': {
    title: 'WordPress redesigns, SEO audits and case studies',
    links: ['seo', 'bloomprint', 'scooterShop'],
  },
  '/web-design-subiaco': {
    title: 'Websites, WordPress redesigns and case studies',
    links: ['bloomprint', 'scooterShop'],
  },
  '/wordpress-web-design-perth': {
    title: 'New websites, WordPress costs, migration SEO and SEO audits',
    links: ['wordpressCost', 'migration', 'seo'],
  },
  '/ai-seo-perth': {
    title: 'Websites, WordPress redesigns, SEO audits and the AI search guide',
    links: ['seo', 'aiSearch'],
  },
  '/website-migration-seo-perth': {
    title: 'Websites, WordPress redesigns, SEO audits and the sample report',
    links: ['seo', 'sampleReport'],
  },
  '/seo': {
    title: 'Websites, WordPress redesigns, the sample report and profile optimisation',
    links: ['sampleReport', 'gbp'],
  },
  '/seo/tradies': {
    title: 'Websites, WordPress redesigns, SEO audits and another industry',
    links: ['seo', 'builders'],
  },
  '/seo/builders': {
    title: 'Websites, WordPress redesigns, SEO audits and another industry',
    links: ['seo', 'tradies'],
  },
  '/seo/health-clinics': {
    title: 'Websites, WordPress redesigns, SEO audits and another industry',
    links: ['seo', 'professionalServices'],
  },
  '/seo/professional-services': {
    title: 'Websites, WordPress redesigns, SEO audits and another industry',
    links: ['seo', 'healthClinics'],
  },
  '/seo/dealerships': {
    title: 'Websites, WordPress redesigns, SEO audits and dealer websites',
    links: ['seo', 'dealers'],
  },

  '/google-business-profile-optimisation': {
    title: 'Websites, WordPress redesigns, SEO audits and local search',
    links: ['seo', 'notShowing'],
  },
  '/affiliates': {
    title: 'Websites, WordPress redesigns, SEO audits and the sample report',
    links: ['seo', 'sampleReport'],
  },
  '/automation': {
    title: 'Websites, WordPress redesigns, SEO audits and an automation guide',
    links: ['seo', 'whatToAutomate'],
  },
  '/dealers': {
    title: 'Websites, WordPress redesigns, dealership SEO and online licensing',
    links: ['dealerships', 'licensing'],
  },
  '/licensing': {
    title: 'Websites, WordPress redesigns, Dealer Online and dealer websites',
    links: ['dealerOnline', 'dealers'],
  },
  '/portfolio/scooter-shop': {
    title: 'Websites, WordPress redesigns, another case study and dealer websites',
    links: ['bloomprint', 'dealers'],
  },
  '/portfolio/bloomprint': {
    title: 'Websites, WordPress redesigns, another case study and SEO audits',
    links: ['scooterShop', 'seo'],
  },
  '/business-not-showing-up-on-google': {
    title: 'Websites, WordPress redesigns, small business SEO and profile optimisation',
    links: ['smallBusinessSeo', 'gbp'],
  },
  '/how-to-show-up-in-ai-search': {
    title: 'Websites, WordPress redesigns, AI SEO and SEO audits',
    links: ['aiSeo', 'seo'],
  },
  '/dealer-online-wa': {
    title: 'Websites, WordPress redesigns, online licensing and dealer websites',
    links: ['licensing', 'dealers'],
  },
  '/what-to-automate-in-a-small-business': {
    title: 'Websites, WordPress redesigns, automation and SEO audits',
    links: ['automation', 'seo'],
  },
  '/wordpress-website-cost-perth': {
    title: 'New websites, WordPress redesigns, builders compared and a case study',
    links: ['builderOrDesigner', 'bloomprint'],
  },
  '/seo-cost-perth': {
    title: 'Websites, WordPress redesigns, SEO audits and the sample report',
    links: ['seo', 'sampleReport'],
  },
  '/website-cost-perth': {
    title: 'New websites, WordPress redesigns, WordPress costs and choosing a designer',
    links: ['wordpressCost', 'chooseDesigner'],
  },
  '/small-business-seo-perth': {
    title: 'Websites, WordPress redesigns, SEO audits and profile optimisation',
    links: ['seo', 'gbp'],
  },
  '/how-to-choose-a-web-designer-perth': {
    title: 'Websites, WordPress redesigns, website costs and builders compared',
    links: ['websiteCost', 'builderOrDesigner'],
  },
  '/website-builder-vs-web-designer-perth': {
    title: 'Websites, WordPress redesigns, choosing a designer and WordPress costs',
    links: ['chooseDesigner', 'wordpressCost'],
  },
};

export function relatedPagesFor(path: string): { title: string; links: RelatedLink[] } | null {
  const entry = RELATED[path];
  if (!entry) return null;
  const links: RelatedLink[] = [...ALWAYS, ...entry.links].map((key) => LINKS[key]);
  return { title: entry.title, links: links.filter((link) => link.href !== path) };
}

/**
 * A page's own illustration, the picture on its card in other pages' related blocks, for its
 * call-back panel. Only the drawn pictures under `/images/`, not the case studies' screenshots.
 */
export function pagePicture(path: string): string | undefined {
  const own = (Object.values(LINKS) as RelatedLink[]).find((link) => link.href === path);
  return own?.image?.startsWith('/images/') ? own.image : undefined;
}
