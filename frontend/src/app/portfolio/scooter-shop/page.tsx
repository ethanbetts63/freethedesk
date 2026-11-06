import type { Metadata } from 'next';

import {
  PortfolioCaseStudy,
  type PortfolioCaseStudyConfig,
} from '@/app/portfolio/_components/PortfolioCaseStudy';
import { portfolioFaqs } from '@/app/portfolio/_lib/copy';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import { metadataFor } from '@/lib/pages';
import { getSiteSettingsServer, SERVICE_PRICE_FIELDS } from '@/lib/serverApi';
import { servicePrices } from '@/lib/servicePricing';

export const metadata: Metadata = metadataFor('/portfolio/scooter-shop');

// The FAQ quotes the admin's prices, read fresh on every request.
export const dynamic = 'force-dynamic';

/**
 * Written for the reader with a site to grow: three decisions from the site's
 * own search reports (ftp_search, scootershop r8 to r12), each a few lines
 * beside the site's own screen, then the growth figure and the report
 * (owner, 2026-11-06).
 */
const config = {
  path: '/portfolio/scooter-shop',
  hero: {
    eyebrow: 'Scooter Shop case study',
    title: { lines: ['Grown by decisions,', 'measured one at a time.'], accentLine: 1 },
    description: `A Perth scooter dealership whose Google visits grew ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}, one measured decision at a time.`,
    liveHref: 'https://www.scootershop.com.au/',
    browserUrl: 'www.scootershop.com.au',
    desktopImage: {
      src: '/case-studies/scooter-shop/home-desktop.png',
      alt: 'Scooter Shop homepage on desktop',
      width: 1440,
      height: 960,
    },
    mobileImage: {
      src: '/case-studies/scooter-shop/home-mobile.webp',
      alt: 'Scooter Shop homepage on a phone',
      width: 780,
      height: 1688,
    },
  },
  sections: [
    {
      kind: 'intro',
      eyebrow: 'How it works',
      title: 'Data-driven SEO.',
      accentTitle: 'Not guesswork.',
      description:
        "Every recommendation started in the site's own search data and ended with a measurement. Three of them below: what we found, what changed, and what each change earned.",
    },
    {
      kind: 'split',
      eyebrow: 'The word',
      title: 'Customers say moped.',
      accentTitle: 'The site said scooter.',
      description:
        'Searches saying moped clicked twice as often as the same searches saying scooter. So the 50cc page became the moped page, and the Segway page the electric-moped page.',
      figures: [
        { value: '4 → 26', label: 'Visits from "moped for sale perth" in a month' },
        { value: '2×', label: 'Clicks per search, moped against scooter' },
      ],
      image: {
        src: '/case-studies/scooter-shop/moped-desktop.webp',
        alt: 'The Scooter Shop 50cc scooters and mopeds page',
        width: 1440,
        height: 960,
      },
      browserUrl: 'www.scootershop.com.au/50cc-scooters-perth',
      // The hero's screen sits right, so the sides alternate from the left.
      textSide: 'right',
      background: 'white',
    },
    {
      kind: 'split',
      eyebrow: 'Fewer pages',
      title: 'Four workshop pages.',
      accentTitle: 'Folded into one.',
      description:
        'Workshop searches were split across four near-identical pages, the best of them about 37th. Merged into one, with every old address forwarding, the service page reached the edge of the top ten in four weeks.',
      figures: [
        { value: '37th → 10th', label: 'Where the service page ranks on workshop searches' },
      ],
      image: {
        src: '/case-studies/scooter-shop/service-desktop.png',
        alt: 'The Scooter Shop service page with its online booking form',
        width: 1440,
        height: 960,
      },
      browserUrl: 'www.scootershop.com.au/service',
      textSide: 'left',
      background: 'tint',
    },
    {
      kind: 'split',
      eyebrow: 'Speed',
      title: 'Fast on real phones.',
      accentTitle: 'Not a perfect score.',
      description:
        'We build things to be more than good enough, not perfect. Perfect costs exponentially more than really good, for almost no benefit, so every page scores 90 plus and we leave it there. Try yours.',
      image: {
        src: '/case-studies/scooter-shop/core-web-vitals.webp',
        alt: "Google's Core Web Vitals assessment for scootershop.com.au: passed, with largest contentful paint 1.2 seconds, cumulative layout shift 0, first contentful paint 1.1 seconds and time to first byte 0.4 seconds",
        width: 1904,
        height: 738,
      },
      // Google's panel is too wide to share a row with the words.
      textSide: 'above',
      background: 'white',
      speedCheck: true,
    },
    {
      kind: 'growth',
      eyebrow: 'The growth',
      title: `${SCOOTER_SHOP_GROWTH.percent}% growth.`,
      accentTitle: '5 months.',
      description: `Across ${SCOOTER_SHOP_GROWTH.period}, Google sent ${SCOOTER_SHOP_GROWTH.percent}% more visits. The decisions above are how, each one read in the site's own report afterwards.`,
      action: 'report',
    },
  ],
} satisfies Omit<PortfolioCaseStudyConfig, 'faq'>;

export default async function ScooterShopCaseStudy() {
  const prices = servicePrices(await getSiteSettingsServer(SERVICE_PRICE_FIELDS));
  return (
    <PortfolioCaseStudy
      config={{ ...config, faq: { eyebrow: 'Common questions', items: portfolioFaqs(prices) } }}
    />
  );
}
