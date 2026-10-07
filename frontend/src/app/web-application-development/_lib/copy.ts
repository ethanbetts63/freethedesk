import type { JourneyContent } from '@/components/marketing/JourneySection';
import type { IntroductionItem } from '@/components/marketing/WebsiteIntroduction';
import type { IndexedFeature } from '@/components/marketing/IndexedFeatureSection';
import type { ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

export const WEB_APP_INTRODUCTION: readonly IntroductionItem[] = [
  {
    title: 'Discovery and scope',
    description:
      'We start with how the work happens today, then scope the smallest release that takes the most of it off your hands.',
    targetId: 'process',
    linkLabel: 'Explore how we build',
  },
  {
    title: 'The customer side',
    description:
      'Portals, bookings, ordering and payments your customers can finish on their phone, without calling you.',
    targetId: 'customer-journeys',
    linkLabel: 'Explore the customer side',
  },
  {
    title: 'The back office',
    description:
      'Approvals, records, documents and invoices that move on their own, instead of through a shared spreadsheet.',
    targetId: 'webapp-automation',
    linkLabel: 'Explore the back office',
  },
];

/** "How a build runs", priced from the admin. */
export function webAppProcess(prices: ServicePrices): readonly IndexedFeature[] {
  return [
    [
      'Discovery',
      `${prices.discoveryHours} hours at ${prices.hourlyRate} an hour, paid upfront. We map the process, the tools you already pay for and what the first release has to do.`,
    ],
    [
      'Build in stages',
      'Each feature is built, shown to you and signed off before the next one starts, so nothing arrives as a surprise at the end.',
    ],
    [
      'Launch and improve',
      `The first release goes live and starts saving time. Changes after launch are ${prices.hourlyRate} an hour, agreed before we start.`,
    ],
  ];
}

export const WEB_APP_JOURNEY: JourneyContent = {
  title: 'Applications designed to',
  accentTitle: 'be self-serve.',
  description:
    'A good web application lets customers finish the job themselves: book, order, pay, upload or sign, without waiting for your office to open.',
  bullets: [
    'Customers finish tasks without a phone call',
    'Every step works on a phone',
    'Your team sees the result straight away',
  ],
  flow: {
    browserLabel: 'customer portal',
    start: { label: 'Point A', title: 'Customer signs in', description: 'Their records only' },
    steps: [
      { title: 'Choose', description: 'Book, order or request' },
      { title: 'Provide', description: 'Details, documents or ID' },
      { title: 'Pay or sign', description: 'Settled in the same visit' },
    ],
    end: { label: 'Point B', title: 'Job done', description: 'Your team already knows' },
    ariaLabel: 'A customer finishing a task in a web application without calling the business',
  },
};

export const WEB_APP_BACK_OFFICE = {
  description:
    'Behind every customer screen is the admin it replaces: approvals, records, documents, invoices and the follow-ups nobody remembers to send. We build that side too, so the work moves on its own.',
  jobs: [
    'Approvals & status changes',
    'Documents & records',
    'Invoices & payments',
    'Notifications & reminders',
    'Reports & exports',
  ],
} as const;

export const WEB_APP_SUBSCRIPTION_LEAD =
  'Most businesses rent four or five apps to run one process, and still copy data between them. We add up what those subscriptions cost, work out which parts you actually use, and price an application against the bill. Stop renting. Own the tools you use.';

export function webAppFaqs(prices: ServicePrices): FaqItem[] {
  return [
    {
      question: 'How much does a web application cost in Perth?',
      answer: `Web applications start from ${prices.webAppFrom}. Every one begins with discovery: ${prices.discoveryHours} hours at ${prices.hourlyRate} an hour, ${prices.discoveryTotal} paid upfront, ending with a written scope and a price for the first release. Or tell us your budget and we will tell you what it buys.`,
      links: [{ phrase: 'discovery', href: '/pricing' }],
    },
    {
      question: 'What is the difference between a website and a web application?',
      answer:
        'A website mostly tells people things. A web application lets them do things: sign in, book, order, pay, upload or sign, while your team works the same records from a dashboard. Many of our builds are both.',
      links: [{ phrase: 'A website', href: '/website-development' }],
    },
    {
      question: 'Can a web application replace the subscriptions we already pay for?',
      answer:
        'Often, yes. We add up what your current tools cost and which of their features you use, and price an application against that bill. If it would not come out cheaper to run or genuinely better to use, we tell you.',
    },
    {
      question: 'Can it connect to the systems we already use?',
      answer:
        'Yes. Payments run through Stripe, and we connect accounting, CRM, booking and supplier systems through their APIs. Where a system has no API, business automation can often still keep it in sync on a schedule.',
      links: [{ phrase: 'business automation', href: '/automation' }],
    },
  ];
}
