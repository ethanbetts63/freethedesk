import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import type { ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

import { BUILT_SITE_LINK, HOW_IT_WORKS_FAQ, WEBSITE_PLANS } from './packages';
import type { WebsitePageCopy } from './pageCopy';

/**
 * /website-development's words. It leaves WordPress to its variation (owner, 2026-11-21) and carries
 * the searches Search Console shows without it: website and web design, prices, custom web
 * development, website SEO, support and maintenance, and e-commerce.
 */
export const WEBSITE_COPY: WebsitePageCopy = {
  hero: {
    titleLines: ['Website design Perth:'],
    accentTitle: 'fixed-price packages',
    lead: 'Custom web design and development for Perth businesses. Three packages, each at a fixed price.',
    trustLine: 'Fixed prices · The site is yours · Perth-based',
  },
  packages: {
    eyebrow: 'Website Development Packages',
    title: 'Website design packages',
    accentTitle: 'and prices.',
    lead: 'Fixed prices: half upfront, the rest before launch. Online shops and bookings are add-ons.',
  },
  nudge: 'Not sure which package you need?',
  introduction: {
    eyebrow: 'How our website development works',
    title: 'What is in a',
    accentTitle: 'website package?',
    body: 'Your whole site, custom designed and developed, with a mobile-friendly page for each service. Growth and Complete add more pages for people to land on.',
  },
  sections: [
    {
      id: 'seo',
      label: 'Website SEO',
      title: 'SEO optimised web design:',
      accentTitle: 'built to rank on Google',
      description:
        'Every service gets its own page, titled the way people search for it. Structured data tells Google what you do and where, your pages link to each other, and many more SEO techniques are built into every package.',
      picture: '/images/guides/business-not-showing-up-on-google.webp',
      link: BUILT_SITE_LINK,
    },
    {
      id: 'speed',
      label: 'Website speed',
      title: 'Built for website speed:',
      accentTitle: 'no plugins, no page builder',
      description:
        'Custom code loads only what each page needs, so pages open fast on a phone. Slow pages lose customers and rankings.',
      picture: '/images/redesign/why-not-wordpress.webp',
      link: BUILT_SITE_LINK,
    },
    {
      id: 'design',
      label: 'Website design',
      title: 'Sales-first web design:',
      accentTitle: 'from click to sale',
      description:
        'Every page is designed for the phone first, with your reviews, your work and a call button within reach.',
      picture: '/images/pages/website-development.webp',
      link: BUILT_SITE_LINK,
    },
  ],
  caseStudy: {
    label: 'Web design case study',
    title: `Web design results for a Perth business: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`,
    body: `We rebuilt a Perth scooter dealership's site as one custom-coded site. Its organic clicks grew ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}.`,
    points: [
      'Old addresses redirected',
      'A page for each search',
      'Structured data',
      'Measured in Search Console',
    ],
  },
  faq: {
    label: 'Web design questions',
    title: 'Website design Perth: common questions.',
    items: (prices) => websiteFaqs(prices, 'Perth'),
  },
  call: {
    title: 'Ready for a website that brings in work?',
    picture: '/images/pages/website-redesign-perth.webp',
  },
};

/**
 * /web-design-subiaco: the same page for businesses in Subiaco. Only facts we can stand behind:
 * we are in Dianella and work across Perth, not in Subiaco. A trial of one suburb page, linked only
 * from the footer, so its search results can be read on their own before any more are made.
 */
export const SUBIACO_COPY: WebsitePageCopy = {
  ...WEBSITE_COPY,
  hero: {
    ...WEBSITE_COPY.hero,
    titleLines: ['Web design and development'],
    accentTitle: 'in Subiaco',
    lead: 'Custom web design and development for Subiaco businesses, from Rokeby Road shopfronts to the clinics and offices off Hay Street. Three packages, each at a fixed price.',
  },
  faq: {
    ...WEBSITE_COPY.faq,
    title: 'Web design in Subiaco: common questions.',
    items: (prices) =>
      websiteFaqs(prices, 'Subiaco', [
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
  },
  call: { ...WEBSITE_COPY.call, title: 'Ready for a better Subiaco website?' },
};

/** A location page names its place in the cost question and adds its own questions straight after it. */
function websiteFaqs(prices: ServicePrices, place: string, local: FaqItem[] = []): FaqItem[] {
  const [basic, growth, complete] = WEBSITE_PLANS;
  return [
    {
      question: `How much does website design cost in ${place}?`,
      answer: `Our web design prices are fixed: Basic is ${basic.price}, Growth ${growth.price} and Complete ${complete.price}. Online shops, bookings and connected tools are add-ons, quoted on a call before any work starts. Our guide to what a website costs in Perth sets these beside the ranges other Perth studios publish.`,
      links: [{ phrase: 'what a website costs in Perth', href: '/website-cost-perth' }],
    },
    ...local,
    HOW_IT_WORKS_FAQ,
    {
      question: 'What does each website package include?',
      answer:
        'Basic is the whole site: home, a page for each service, about and contact, with an enquiry form on every page. Growth adds up to five suburb pages, three homepage variations, a page for each of your five best jobs and your Google Business Profile optimised. Complete adds five guides and an SEO audit at three months, with its fixes made.',
    },
    {
      question: 'Do I own the website?',
      answer:
        'Yes. The domain, hosting and Google accounts are held in your name, and once the site is paid for the code is yours to use, change and move, with or without us. Ask and we send you a copy.',
    },
    {
      question: 'What if I do not have a website yet?',
      answer:
        'The packages are the same. On the call we take your services, photos and details, and build from those.',
    },
    {
      question: 'Will I lose my Google rankings or my email in the switch?',
      answer:
        'No. Every old address is redirected to the page that replaces it, the titles and wording that already rank are kept, and your email is checked before and after the domain moves.',
    },
    {
      question: 'Do you offer website support and maintenance after launch?',
      answer: `Yes. Faults reported in the first 30 days are fixed free. After that, website support, changes and maintenance are ${prices.hourlyRate} an hour, quoted before we start, with no monthly plan to sign.`,
    },
    {
      question: 'Do you build e-commerce websites and booking systems?',
      answer:
        'Yes, as add-ons to any package, quoted on the call: e-commerce web development for an online shop, online booking, your other tools connected, or a Google Ads campaign pointed at your new pages.',
    },
    {
      question: 'Is the website custom built or a template?',
      answer: `Custom. Every site is designed and coded for the business, not assembled from a template or a page builder, which is why it loads fast and is yours to move. Larger custom web development, such as a web application, starts with paid discovery, ${prices.discoveryTotal}, which ends in a written scope.`,
    },
  ];
}
