import type { IndexedFeature } from '@/components/marketing/IndexedFeatureSection';
import { money, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

import type { ServicePriceRow } from '../_components/ServicePriceList';

export function priceRows(prices: ServicePrices): readonly ServicePriceRow[] {
  const [small, large, webApp] = prices.packages;
  return [
    {
      service: 'Websites',
      price: `from ${money(small.price)}`,
      basis: `A ${small.name} or a ${large.name}, priced per page from ${prices.pagePriceFrom} a page. Buy either online, paying half upfront.`,
      href: '/website-development#packages',
      linkLabel: 'Website packages',
    },
    {
      service: 'Web applications',
      price: `${money(webApp.price)} to start`,
      basis: `Discovery first: ${webApp.priceNote}, paid upfront. Then the build, priced to your budget and built in stages.`,
      href: '/website-development#packages',
      linkLabel: 'Web application package',
    },
    {
      service: 'Business automation',
      price: `from ${prices.automationFrom}`,
      basis: `Integrations and workflows that take repetitive admin off your team, at ${prices.hourlyRate} an hour.`,
      href: '/automation',
      linkLabel: 'Automation',
    },
    {
      service: 'SEO audits',
      price: `from ${prices.seoFrom}`,
      basis: 'A one-off audit or one on a schedule, bought online with the price on the page.',
      href: '/seo',
      linkLabel: 'SEO audits',
    },
    {
      service: 'Changes and new features',
      price: `${prices.hourlyRate} / hour`,
      basis: 'Work on a site or application after launch, agreed before we start.',
      href: '#enquiry',
      linkLabel: 'Ask us',
    },
    {
      service: 'Online licensing for dealers',
      price: `from ${prices.licensingFrom} / month`,
      basis: 'Vehicle licensing and contract signing online, for Perth and WA dealerships.',
      href: '/licensing',
      linkLabel: 'Online licensing',
    },
  ];
}

export function pricingPrinciples(prices: ServicePrices): readonly IndexedFeature[] {
  return [
    [
      'Discovery, paid upfront',
      `${prices.discoveryHours} hours, ${prices.discoveryTotal}. We map the work, the tools you already pay for and what to build first.`,
    ],
    [
      'Packages, priced per page',
      `Websites come in two fixed packages from ${prices.websiteFrom}, so you know the total before we start.`,
    ],
    [
      'Or start from your budget',
      'Tell us what you can spend and what you need, and we tell you the most valuable thing we can build within it.',
    ],
  ];
}

export function pricingFaqs(prices: ServicePrices): FaqItem[] {
  return [
    {
      question: 'How much does a website cost in Perth?',
      answer: `Our website packages start at ${prices.websiteFrom} and are priced per page, from ${prices.pagePriceFrom} a page. Web applications start with ${prices.discoveryTotal} of discovery and are then priced to your budget. Automation starts from ${prices.automationFrom}.`,
      links: [{ phrase: 'website packages', href: '/website-development#packages' }],
    },
    {
      question: 'Why is discovery paid upfront?',
      answer: `Discovery is real work: ${prices.discoveryHours} hours mapping your process, your tools and what to build first, ending in a written scope and a price. Paying for it means the advice is not a sales pitch.`,
    },
    {
      question: 'Can I just give you a budget?',
      answer:
        'Yes. Tell us what you can spend and what you need, and we will tell you what that budget can build. If it cannot build anything worthwhile, we say so.',
    },
    {
      question: 'What is not included in a price?',
      answer:
        'Running costs charged by other providers: hosting, domain renewals and paid services such as SMS or card processing fees. We set those out before you commit.',
    },
    {
      question: 'Why do you publish your prices?',
      answer:
        'So you can decide whether we are a fit before you pick up the phone. The number on this page is the number we work to.',
    },
  ];
}
