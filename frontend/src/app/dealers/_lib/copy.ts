import type { FaqItem } from '@/types/FaqItem';

export const DEALER_FAQS: FaqItem[] = [
  {
    question: 'Do you just build websites, or the operations behind them too?',
    answer:
      'Both, connected. A dealership site we build ties into licensing, enquiries and delivery scheduling—not just the pages a customer sees.',
  },

  {
    question: 'Do you work outside Perth?',
    answer:
      'Yes. We work primarily in Perth, and we also have clients in cities across Australia. Online licensing works for dealers in every state.',
  },

  {
    question: 'Which features can a dealership website include?',
    answer:
      'Live stock with search, accessories and visual parts catalogues, service bookings, hire and fleet, guides and articles, online purchasing with deposits, online sales contracts and online licensing, a new stock newsletter, and integrations with your stock system and CRM.',
  },

  {
    question: 'How much does a dealership website cost?',
    answer:
      'The pages are priced like any of our websites, per page, from our website packages. Dealer features such as stock feeds, online purchasing and licensing are scoped in a paid discovery and priced before we start.',
    links: [
      { phrase: 'website packages', href: '/website-packages' },
      { phrase: 'paid discovery', href: '/pricing' },
    ],
  },

  {
    question: 'How is this different from a template website?',
    answer:
      "It's shaped around your brand and connected to the way your team actually sells and services vehicles, not a static template with your logo swapped in.",
  },

  {
    question: 'Can I get just the website, or also licensing and automation?',
    answer:
      'Either. Websites, online licensing and workflow automation are separate products that work well together, so you can start with what matters most right now.',
  },
];
