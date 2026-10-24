import { packageByCode, money, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

/** Built per request so the cost answer quotes the prices the admin has set. */
export function portfolioFaqs(prices: ServicePrices): FaqItem[] {
  const [one, large] = (['website_one_page', 'website_large'] as const).map((code) =>
    packageByCode(prices.packages, code),
  );

  return [
    {
      question: 'Can you build something like this for my business?',
      answer:
        "Yes. We reuse the thinking and proven patterns, not another business's design. Your website or system is scoped around your customers, operations and commercial goals.",
    },
    {
      question: 'Do I need a detailed brief before getting in touch?',
      answer:
        'No. A website URL and a plain-English explanation of what is taking too much time or not working well are enough to start.',
    },
    {
      question: 'Can you connect the website to our existing systems?',
      answer:
        'Usually. We can connect websites with CRMs, inventory systems, email tools, payment platforms and other software where suitable integration options are available.',
    },
    {
      question: 'How much does a project like this cost?',
      answer: `Website packages start at ${money(one.price)} for a ${one.name} and ${money(large.price)} for a ${large.name}. A connected system like this one starts with discovery: ${prices.discoveryHours} hours for ${prices.discoveryTotal} that map how your business runs and end in a written scope, with the build priced to your budget.`,
      links: [{ phrase: 'Website packages', href: '/website-development#packages' }],
    },
  ];
}
