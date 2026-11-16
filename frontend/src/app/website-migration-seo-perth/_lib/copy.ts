import type { SeoAuditPrices } from '@/app/seo/_lib/plans';
import type { FaqItem } from '@/types/FaqItem';

/** Prices come from the admin, so the cost answer is built per request. */
export function migrationFaqs(prices: SeoAuditPrices): FaqItem[] {
  return [
    {
      question: 'Will moving my website hurt my Google rankings?',
      answer:
        "It can, when pages that rank disappear or point somewhere unrelated. Some movement in the first weeks is normal while Google re-reads the site, and a whole site can take about three months to settle. A page still down after that usually has a missing or wrong redirect, and that's what to look for first.",
    },
    {
      question: 'How much does website migration SEO cost?',
      answer: `An Essentials audit is ${prices.essentials}, Plus is ${prices.plus} and Complete is ${prices.complete}, each paid once with no subscription. If we build your new site, moving your pages across and redirecting the old addresses is part of the redesign price.`,
      links: [{ phrase: 'part of the redesign price', href: '/website-redesign-perth' }],
    },
    {
      question: 'When should SEO start in a website move?',
      answer:
        'Before the new site is designed. Once the pages and addresses are built, changing them costs more, and a page that wins searches can be left out without anyone noticing. Read your Search Console first, then design the new site around the pages it shows.',
    },
    {
      question: 'My traffic dropped after the new site went live. Can you help?',
      answer:
        "Yes. An audit reads your Search Console from before and after launch day and names the pages and searches that went missing, with the fix for each: usually a redirect that was never added, one that points at the home page, or a page whose wording changed. It's written so your developer can make the fixes the same week.",
    },
    {
      question: 'Do you build the new website as well?',
      answer:
        'If you want us to. Our website redesigns are custom-coded sites at a fixed price, and every old address is redirected as part of the build. If your own developer is building it, the audit is written for them, and any recommendation can come with a fixed price for us to make the change instead.',
      links: [{ phrase: 'website redesigns', href: '/website-redesign-perth' }],
    },
    {
      question: 'Should I change my domain at the same time?',
      answer:
        'Better not. Moves that change the domain and every page address at once are the slowest to recover. Move to the new domain with the same addresses first, then restructure once Google has caught up, about three months later. If both have to happen together, every old address still needs its own redirect.',
    },
    {
      question: "What's the difference between a 301 and a 302 redirect?",
      answer:
        'A 301 says the page has moved for good, so Google shows the new address in its place. A 302 says the move is temporary, and Google can keep showing the old address for months. A website move needs 301s, each pointing at the closest replacement page, not the home page.',
    },
    {
      question: 'What access do you need?',
      answer:
        "Google Search Console and a short brief about what you sell and where. Everything is read-only: we can't edit your site and we don't install anything. If you don't have Search Console, it's free and takes a few minutes to set up, and it is the only place Google lists the searches your current site is found for.",
    },
    {
      question: "Can I get migration SEO if I'm not in Perth?",
      answer:
        'Yes. The audit is written from your site and your Search Console, so it is delivered the same way anywhere in Australia. We work primarily in Perth and have clients in cities across the country.',
    },
  ];
}
