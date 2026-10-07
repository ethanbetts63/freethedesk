import type { JourneyContent } from '@/components/marketing/JourneySection';
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

/** Prices come from the admin, so the cost answer is built per request. */
export function websiteDevFaqs(prices: ServicePrices): FaqItem[] {
  const [small, large, webApp] = prices.packages;
  return [
    {
      question: 'How much does web design cost in Perth?',
      answer: `Our ${small.name} is ${money(small.price)} and our ${large.name} is ${money(large.price)}, each priced per page, and you can buy either on this page. Work outside a package is ${prices.hourlyRate} an hour. Or tell us your budget and we will tell you what it buys.`,
      links: [
        { phrase: `${prices.hourlyRate} an hour`, href: '/pricing' },
        { phrase: 'tell us your budget', href: '#enquiry' },
      ],
    },
    ...WEBSITE_DEV_FAQS,
    {
      question: 'Do you build web applications as well as websites?',
      answer: `Yes: customer portals, booking and ordering systems, marketplaces and internal tools. The web application package starts with discovery, ${webApp.priceNote}, ${money(webApp.price)} paid upfront, and ends with a written scope and a price for the first release. Projects start from ${prices.webAppFrom}.`,
      links: [{ phrase: 'web application package', href: '#packages' }],
    },
  ];
}
