import type { Metadata } from 'next';

import {
  PortfolioCaseStudy,
  type PortfolioCaseStudyConfig,
} from '@/app/portfolio/_components/PortfolioCaseStudy';
import { portfolioFaqs } from '@/app/portfolio/_lib/copy';
import { metadataFor } from '@/lib/pages';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';

export const metadata: Metadata = metadataFor('/portfolio/scooter-shop');

// The FAQ quotes the admin's prices, read fresh on every request.
export const dynamic = 'force-dynamic';

const config = {
  path: '/portfolio/scooter-shop',
  hero: {
    eyebrow: 'Scooter Shop case study',
    title: { lines: ['One dealership.', 'One connected system.'], accentLine: 1 },
    description:
      'A working website that brings sales, parts, service, hire and dealership operations into one customer experience.',
    liveHref: 'https://www.scootershop.com.au/',
    browserUrl: 'www.scootershop.com.au',
    desktopImage: {
      src: '/case-studies/scooter-shop/home-desktop.png',
      alt: 'Scooter Shop homepage on desktop',
      width: 1440,
      height: 960,
    },
    mobileImage: {
      src: '/case-studies/scooter-shop/inventory-mobile.png',
      alt: 'Scooter Shop used inventory experience on mobile',
      width: 390,
      height: 844,
    },
  },
  tour: {
    eyebrow: 'The customer experience',
    title: { lines: ['Built around what', 'the customer came to do.'] },
    label: 'Scooter Shop website tour',
    browserUrl: 'www.scootershop.com.au',
    items: [
      {
        number: '01',
        label: 'Find the right machine',
        title: 'Inventory that helps people decide.',
        copy: 'Strong category pages, useful filters, stock alerts and a simple three-step buying explanation turn a changing feed into a proper sales experience.',
        src: '/case-studies/scooter-shop/inventory-desktop.png',
        alt: 'Used motorcycle inventory with buying steps, stock alert and filters',
        width: 1440,
        height: 960,
      },
      {
        number: '02',
        label: 'Move toward sold',
        title: 'The detail page carries the sale forward.',
        copy: 'Real photography, key facts and price sit beside the next action. Customers can reserve, buy outright or register interest without searching for a way to continue.',
        src: '/case-studies/scooter-shop/vehicle-desktop.png',
        alt: 'Ducati vehicle detail page with photography, price and reserve option',
        width: 1440,
        height: 960,
      },
      {
        number: '03',
        label: 'Book the workshop',
        title: 'Service becomes a usable online journey.',
        copy: 'Customers choose a date, time and job type in a focused three-step booking flow. The dealership receives useful information before the motorcycle reaches the workshop.',
        src: '/case-studies/scooter-shop/service-desktop.png',
        alt: 'Online motorcycle service booking form',
        width: 1440,
        height: 960,
      },
      {
        number: '04',
        label: 'Find an exact part',
        title: 'A technical catalogue people can understand.',
        copy: 'Customers move from model to diagram, match the numbered component and add the correct item from the adjacent list. A specialist counter process becomes available online.',
        src: '/case-studies/scooter-shop/parts-desktop.png',
        alt: 'SYM visual parts catalogue with exploded diagram and matching parts list',
        width: 1440,
        height: 960,
      },
    ],
  },
  mobile: {
    eyebrow: 'Every screen',
    title: 'Designed for the screen customers use.',
    description:
      'For Scooter Shop we found that an average of 66% of users are browsing on mobile. That is why every journey starts with the smallest screen in our process—not as a reduced version of desktop.',
    image: {
      src: '/case-studies/scooter-shop/inventory-mobile.png',
      alt: 'Responsive Scooter Shop inventory page showing the online buying steps',
      width: 390,
      height: 844,
    },
    callout: 'Clear buying path',
  },
  feature: {
    variant: 'operations',
    eyebrow: 'Behind the website',
    title: { lines: ['Dealership operations', 'behind the website.'] },
    description:
      'The public website is only half the system. The management experience is organised around what dealership staff need to action next, so better customer service does not create more administration.',
    console: {
      workspace: 'Dealer workspace',
      navigation: ['Today', 'Customers', 'Inventory', 'Orders', 'Service'],
      activeNavigation: 'Today',
      activeCount: '8',
      timestamp: 'Thursday / 9:41 AM',
      title: 'What needs attention.',
      status: 'All systems connected',
      items: [
        {
          number: '01',
          title: 'Action queue',
          detail: 'Enquiries and next steps arrive with the context staff need.',
        },
        {
          number: '02',
          title: 'Orders & licensing',
          detail: 'Customer paperwork, payment and handover progress stay connected.',
        },
        {
          number: '03',
          title: 'Stock & content',
          detail: 'The information customers rely on can be managed in one place.',
        },
        {
          number: '04',
          title: 'Service diary',
          detail: 'Bookings become an organised workshop schedule, not another inbox.',
        },
      ],
    },
  },
  intent: {
    eyebrow: 'High-intent pages',
    title: { lines: ['Search pages built', 'around customer intent.'] },
    description:
      'A service, a used bike, a part: each search gets its own page and a relevant next step.',
  },
  seo: {
    eyebrow: 'SEO growth',
    title: `${SCOOTER_SHOP_GROWTH.percent}% growth.`,
    accentTitle: '5 months.',
    description: `Across ${SCOOTER_SHOP_GROWTH.period}, organic clicks grew ${SCOOTER_SHOP_GROWTH.percent}%. Indexable stock, focused landing pages and useful guides created more ways for ready-to-buy customers to find the dealership.`,
  },
} satisfies Omit<PortfolioCaseStudyConfig, 'faq'>;

export default async function ScooterShopCaseStudy() {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  return (
    <PortfolioCaseStudy
      config={{ ...config, faq: { eyebrow: 'Common questions', items: portfolioFaqs(prices) } }}
    />
  );
}
