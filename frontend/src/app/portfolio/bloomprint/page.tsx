import type { Metadata } from 'next';

import {
  PortfolioCaseStudy,
  type PortfolioCaseStudyConfig,
} from '@/app/portfolio/_components/PortfolioCaseStudy';
import { portfolioFaqs } from '@/app/portfolio/_lib/copy';
import { metadataFor } from '@/lib/pages';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';

export const metadata: Metadata = metadataFor('/portfolio/bloomprint');

// The FAQ quotes the admin's prices, read fresh on every request.
export const dynamic = 'force-dynamic';

const config = {
  path: '/portfolio/bloomprint',
  hero: {
    eyebrow: 'Bloomprint case study',
    title: { lines: ['Not a catalogue.', 'A brief.'], accentLine: 1 },
    description:
      'A national flower delivery marketplace where the customer describes what they want and an independent local florist designs it. Customer ordering, florist supply and organic growth built as one product.',
    liveHref: 'https://www.bloomprint.com.au/',
    browserUrl: 'www.bloomprint.com.au',
    desktopImage: {
      src: '/case-studies/bloomprint/home-desktop.png',
      alt: 'Bloomprint homepage with the order builder open',
      width: 1440,
      height: 681,
    },
    mobileImage: {
      src: '/case-studies/bloomprint/home-mobile.png',
      alt: 'Bloomprint homepage and order builder on a phone',
      width: 390,
      height: 844,
    },
  },
  tour: {
    eyebrow: 'The experience',
    title: { lines: ['Four journeys,', 'one order engine.'] },
    label: 'Bloomprint website tour',
    browserUrl: 'www.bloomprint.com.au',
    items: [
      {
        number: '01',
        label: 'Give the brief',
        title: 'The order starts as a description, not a product.',
        copy: 'Occasion, budget, free-text preferences, delivery date and card message are captured up front. Custom budgets let the customer set the number instead of picking the closest tier.',
        src: '/case-studies/bloomprint/brief-desktop.png',
        alt: 'Bloomprint order builder showing budget tiers, custom preferences, delivery date and card message',
        width: 1440,
        height: 681,
      },
      {
        number: '02',
        label: 'Recipient and delivery',
        title: 'A three-step checkout that carries the brief with it.',
        copy: 'Step two collects the sender, the recipient and the delivery address, with a progress bar that keeps a gift order feeling finite. The brief stays attached to the order all the way to the florist.',
        src: '/case-studies/bloomprint/order-desktop.png',
        alt: 'Bloomprint checkout step two collecting sender and recipient details',
        width: 1440,
        height: 681,
      },
      {
        number: '03',
        label: 'The florist side',
        title: 'Supply needed its own product, not a contact form.',
        copy: 'Florists sign up free through a two-step account flow, then receive fully paid local orders they can accept or decline. Same platform, an entirely different audience and a different promise.',
        src: '/case-studies/bloomprint/florists-desktop.png',
        alt: 'Bloomprint florist signup page with account creation form',
        width: 1440,
        height: 681,
      },
    ],
  },
  mobile: {
    eyebrow: 'Every screen',
    title: 'The whole order works on mobile.',
    description:
      'Flower orders often begin on a phone, so the brief, budget, delivery details and payment path were designed for the smallest screen first. The mobile journey is the product—not a compressed desktop checkout.',
    image: {
      src: '/case-studies/bloomprint/home-mobile.png',
      alt: 'Bloomprint homepage and order builder on a phone',
      width: 390,
      height: 844,
    },
  },
  feature: {
    variant: 'dual-steps',
    eyebrow: 'Both sides',
    title: { lines: ['One marketplace.', 'Two customers.'] },
    columns: [
      {
        label: 'Demand',
        title: 'The customer',
        portrait: {
          src: '/case-studies/bloomprint/customer.webp',
          alt: '',
          width: 768,
          height: 1152,
        },
        steps: [
          { number: '01', detail: 'Describe the occasion and set a budget.' },
          { number: '02', detail: 'Add preferences and a card message.' },
          { number: '03', detail: 'Pay once. Delivery is included over $100.' },
        ],
      },
      {
        label: 'Supply',
        title: 'The florist',
        portrait: {
          src: '/case-studies/bloomprint/florist.webp',
          alt: '',
          width: 768,
          height: 1152,
        },
        steps: [
          { number: '01', detail: 'Join free and take the paid local orders that suit the week.' },
          { number: '02', detail: 'Design from what is fresh, not a fixed recipe.' },
          { number: '03', detail: "Deliver under the shop's own name." },
        ],
      },
    ],
  },
  intent: {
    eyebrow: 'Front doors',
    title: { lines: ['Many ways in.', 'One way to order.'] },
    description:
      'Each page answers a different search, then hands the visitor the same order builder.',
  },
  seo: {
    eyebrow: 'SEO growth',
    title: '3 months.',
    accentTitle: '68% growth.',
    description:
      'Organic clicks grew 68% in three months. City, occasion and guide pages gave a new brand more ways to meet customers already searching for flower delivery.',
  },
} satisfies Omit<PortfolioCaseStudyConfig, 'faq'>;

export default async function BloomprintCaseStudy() {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  return (
    <PortfolioCaseStudy
      config={{ ...config, faq: { eyebrow: 'Common questions', items: portfolioFaqs(prices) } }}
    />
  );
}
