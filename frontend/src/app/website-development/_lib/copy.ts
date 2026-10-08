import type { JourneyContent } from '@/components/marketing/JourneySection';
import type { WebDesignCopy } from '../_components/WebDesignPage';
import { money, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

export const WEB_DESIGN_JOURNEY: JourneyContent = {
  title: 'Websites designed to',
  accentTitle: 'be obvious.',
  description:
    'Good web design means visitors never have to work out what to do next. We create clear paths from their first click to a purchase, booking or enquiry.',
  bullets: [
    'One clear action at every stage',
    'Fewer fields, choices and dead ends',
    'A clear confirmation and handoff at the end',
  ],
  flow: {
    label: 'Customer journey',
    start: { label: 'Point A', title: 'Interested visitor', description: 'Intent captured' },
    steps: [
      { title: 'Find the path', description: 'One clear route forward' },
      { title: 'Understand the offer', description: 'The right detail, in the right order' },
      { title: 'Take action', description: 'Only the essential effort' },
    ],
    end: { label: 'Point B', title: 'Action complete', description: 'Next step confirmed' },
    ariaLabel: 'A clear customer journey from interest to completed action',
  },
};

const WEBSITE_DEV_FAQS: FaqItem[] = [
  {
    question: 'Do you design the website as well as build it?',
    answer:
      'Yes. Web design and development happen together here, so the layout is planned around what the site has to do: the pages people search for, the action you want them to take and the admin it should save.',
  },

  {
    question: 'Can you replace or improve an existing site?',
    answer:
      'Yes. We can rebuild it, preserve useful content and search equity, or improve one high-value part without replacing everything at once.',
  },

  {
    question: 'Will the website work properly on mobile?',
    answer:
      'Yes. We design mobile-first, then use the extra room on larger screens deliberately. Forms, navigation, product pages and conversion paths are tested across practical viewport sizes.',
  },
];

/**
 * Prices come from the admin, so the cost answer is built per request. A
 * location page names its place in the cost question and adds its own local
 * questions straight after it.
 */
function webDesignFaqs(prices: ServicePrices, place: string, local: FaqItem[] = []): FaqItem[] {
  const [small, large, webApp] = prices.packages;
  return [
    {
      question: `How much does web design cost in ${place}?`,
      answer: `Our ${small.name} is ${money(small.price)} and our ${large.name} is ${money(large.price)}, each priced per page, and you can buy either on this page. Work outside a package is ${prices.hourlyRate} an hour.`,
      links: [{ phrase: `${prices.hourlyRate} an hour`, href: '/pricing' }],
    },
    ...local,
    ...WEBSITE_DEV_FAQS,
    {
      question: 'Do you build web applications as well as websites?',
      answer: `Yes: customer portals, booking and ordering systems, marketplaces and internal tools. The web application package starts with discovery, ${webApp.priceNote}, ${money(webApp.price)} paid upfront, and ends with a written scope. The build is then priced to your budget.`,
      links: [{ phrase: 'web application package', href: '#packages' }],
    },
  ];
}

/** /website-development: web design for Perth. */
export const PERTH_WEB_DESIGN: WebDesignCopy = {
  heroEyebrow: 'Web design & development Perth',
  heroTitleLines: ['Websites should'],
  heroLead:
    'Custom web design and development for Perth businesses: websites that turn visitors into customers and automate the repetitive work behind them.',
  designDescription:
    'Web design with clear layouts and simple steps that guide visitors towards a purchase, booking or enquiry, on mobile and desktop.',
  seoDescription:
    'Every website launches with strong SEO foundations, but ranking in Perth takes iteration. We analyse live data as it arrives and give you ranked, plain-English opportunities with implementation costs.',
  faqTitle: 'Website development questions.',
  faqs: (prices) => webDesignFaqs(prices, 'Perth'),
  ctaTitle: 'What should your website make easier?',
};

/**
 * /web-design-subiaco: the same page for businesses in Subiaco. Only facts we
 * can stand behind: we are in Dianella and work across Perth, not in Subiaco.
 */
export const SUBIACO_WEB_DESIGN: WebDesignCopy = {
  heroEyebrow: 'Web design Subiaco',
  heroTitleLines: ['Subiaco websites should'],
  heroLead:
    'Web design and development for Subiaco businesses, from Rokeby Road shopfronts to the clinics and offices off Hay Street: websites that turn local searches into customers and automate the work behind them.',
  designDescription:
    'Clear layouts and simple steps that take someone searching for a Subiaco business on their phone to a booking, order or enquiry.',
  seoDescription:
    'Every website launches with strong SEO foundations, but showing up when people search for a business in Subiaco takes iteration. We analyse live data as it arrives and give you ranked, plain-English opportunities with implementation costs.',
  faqTitle: 'Web design in Subiaco: common questions.',
  faqs: (prices) =>
    webDesignFaqs(prices, 'Subiaco', [
      {
        question: 'Do you work with businesses in Subiaco?',
        answer:
          'Yes. We are a Perth web design team based in Dianella, and we build for businesses across the metro area, Subiaco included.',
      },
      {
        question: 'Will my website show up when people search for businesses in Subiaco?',
        answer:
          'That is what the SEO foundations are for: pages that name the suburbs you serve, structured data with your address and service area, and a Google Business Profile that matches. After launch, our SEO audits show which local searches you appear in and what would move you up.',
        links: [{ phrase: 'SEO audits', href: '/seo' }],
      },
    ]),
  ctaTitle: 'What should your Subiaco website make easier?',
};
