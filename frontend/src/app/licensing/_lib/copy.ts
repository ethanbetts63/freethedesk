import type { FaqItem } from '@/types/FaqItem';

export const LICENSING_FAQS: FaqItem[] = [
  {
    question: 'Do I need a new website to use this?',
    answer:
      'No. Choose the hosted portal and keep your current site, or have it built directly into a dealership website we design for you.',
  },

  {
    question: 'Does the customer need to create an account?',
    answer:
      'No. They open the secure link you send them, complete their details, verify their identity and sign.',
  },

  {
    question: 'What happens once the customer signs?',
    answer:
      'The completed paperwork lands straight back in your dealer queue—no scanning, printing or chasing an emailed PDF.',
  },

  {
    question: "Does this replace DoT's Dealer Online?",
    answer:
      "No. Dealer Online is where your team lodges the transaction with DoT. This collects what comes before it: the customer's details and signatures, without a visit. Our guide to DoT Dealer Online covers what the portal does and who can join.",
    links: [{ phrase: 'guide to DoT Dealer Online', href: '/dealer-online-wa' }],
  },

  {
    question: 'Do I need both licensing and contracts?',
    answer:
      'No—pick whichever you need. Online licensing and online contracts are priced separately, or combined at a lower combined rate.',
  },
];
