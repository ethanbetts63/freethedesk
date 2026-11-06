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
    callout: 'Brief stays attached',
  },
  feature: {
    variant: 'dual-steps',
    eyebrow: 'Both sides',
    title: { lines: ['One marketplace.', 'Two customers.'] },
    columns: [
      {
        label: 'Demand',
        title: 'The customer',
        description: 'Describes the outcome and pays once—no catalogue, no surprises at checkout.',
        steps: [
          { number: '01', detail: 'Choose an occasion and the feeling behind it.' },
          { number: '02', detail: 'Set the budget—a tier, or any custom amount from $65.' },
          {
            number: '03',
            detail: 'Add favourite colours, dislikes, allergies and special requests.',
          },
          { number: '04', detail: 'Pick the delivery date and write the card message.' },
          { number: '05', detail: 'Pay once. Delivery is included over $100.' },
        ],
      },
      {
        label: 'Supply',
        title: 'The florist',
        description:
          'Gets paid work near the shop with the creative freedom to design it properly.',
        steps: [
          { number: '01', detail: 'Join free with a two-step store account.' },
          { number: '02', detail: 'Receive fully paid local orders near the store.' },
          { number: '03', detail: "Take the ones that suit the week's stock and diary." },
          { number: '04', detail: 'Design from what is fresh instead of a fixed recipe.' },
          { number: '05', detail: "Deliver under the store's own name and brand." },
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
