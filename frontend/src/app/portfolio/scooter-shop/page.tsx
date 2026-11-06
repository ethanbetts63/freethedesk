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
 * own search reports, each told as its experiment card tells it, with the
 * figures the reports read afterwards (owner, 2026-11-06). The sources are
 * the Scootershop reports in ftp_search, r8 to r12.
 */
const config = {
  path: '/portfolio/scooter-shop',
  hero: {
    eyebrow: 'Scooter Shop case study',
    title: { lines: ['Grown by decisions,', 'measured one at a time.'], accentLine: 1 },
    description: `A Perth scooter dealership whose website grew its Google visits ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}: changes made from its own search data, each one read in that data afterwards.`,
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
  sections: [
    {
      kind: 'growth',
      eyebrow: 'The growth',
      title: `${SCOOTER_SHOP_GROWTH.percent}% growth.`,
      accentTitle: '5 months.',
      description: `Across ${SCOOTER_SHOP_GROWTH.period}, Google sent ${SCOOTER_SHOP_GROWTH.percent}% more visits than at the start. The site is under a year old, so there is no earlier spring to compare with, and some of the rise is the season. What can be measured is each decision on its own, which is what the three below are.`,
      action: 'report',
    },
    {
      kind: 'decisions',
      eyebrow: 'Three decisions',
      title: { lines: ['What the data said.', 'What we did about it.'] },
      description:
        'Every change to the site is an experiment: what the data showed, what changed, what happened next. Three of them, each resting on one of the fundamentals our SEO reports check.',
      items: [
        {
          label: 'The word',
          title: 'Customers say moped. The site said scooter.',
          showed:
            'Searches saying "moped" clicked through to the site twice as often as the same searches saying "scooter", and every page, title and menu said scooter.',
          changed:
            'The 50cc page became the moped page, with its new and used prices shown apart and the homepage linking to it as mopeds. The Segway page was retitled Electric Mopeds Perth, and the licence guide now opens with mopeds.',
          happened:
            'In October, visits from "moped for sale perth" went from 4 to 26 and from "moped" from 7 to 24. Google visits to the used-stock pages doubled, and to the new-stock pages nearly doubled.',
          restsOn: 'Titles and headings use the words customers actually search.',
          figures: [
            { value: '4 → 26', label: 'Visits from "moped for sale perth", September to October' },
            { value: '7 → 24', label: 'Visits from "moped"' },
            { value: '2×', label: 'Google visits to the used-stock pages' },
          ],
        },
        {
          label: 'Fewer pages',
          title: 'Four workshop pages folded into one.',
          showed:
            'Workshop searches were spread across four near-identical service pages, and the best of them sat about 37th. Demand split four ways lands nowhere.',
          changed:
            'Three of the pages were merged into one service page on 14 September, and each old address forwards to it permanently, so the standing the old pages had moved with them.',
          happened:
            'On workshop searches the service page climbed to about 19th within a week, 14th the week after, and the edge of the top ten four weeks on, from about 37th before.',
          restsOn:
            'Each main service has its own page, and every old address redirects to its closest match.',
          figures: [
            {
              value: '37th → 10th',
              label:
                'Where the service page ranks on workshop searches, before and four weeks after',
            },
            { value: '4 → 1', label: 'Pages competing for the same searches' },
          ],
        },
        {
          label: 'Speed',
          title: 'Fast on real phones. Not a perfect score.',
          showed:
            'Google ranks on how real visitors experience a page, not on a lab score. Its own field data for the site: the largest image painted in 1.2 seconds, the first byte in 0.4, and no layout shift at all.',
          changed:
            'Nothing, deliberately. Every page scores 90 plus in PageSpeed and we leave it there. The last ten points cost real money and usually a feature, and no visitor or ranking ever notices them.',
          happened:
            "Google rates every one of the site's 73 pages Good on phones and on desktops, with none needing improvement and no issue reported in the last 90 days.",
          restsOn: "Pages pass Core Web Vitals on real visitors' devices.",
          image: {
            src: '/case-studies/scooter-shop/core-web-vitals.webp',
            alt: "Google's Core Web Vitals assessment for scootershop.com.au: passed, with largest contentful paint 1.2 seconds, cumulative layout shift 0, first contentful paint 1.1 seconds and time to first byte 0.4 seconds",
            width: 1904,
            height: 738,
          },
        },
      ],
    },
    {
      kind: 'check',
      eyebrow: 'Your site',
      title: { lines: ['Check your own', 'site against it.'] },
      description:
        "Type your address and Google's PageSpeed Insights opens in a new tab with the same assessment: how real visitors experience your pages, with the lab score beside it.",
    },
    {
      kind: 'built',
      eyebrow: 'The loop',
      title: 'Built here.',
      accentTitle: 'Run here.',
      description:
        "Scootershop's website is one we built and run, so each recommendation in its reports shipped within days and was read in the next one. That is the loop every SEO report we write is for. Here, nothing waited in a queue.",
      browserUrl: 'www.scootershop.com.au',
      image: {
        src: '/case-studies/scooter-shop/service-desktop.png',
        alt: 'The Scooter Shop service page with its online booking form',
        width: 1440,
        height: 960,
      },
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
