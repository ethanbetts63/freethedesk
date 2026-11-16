import type { SeoAuditPrices } from '@/app/seo/_lib/plans';
import type { FaqItem } from '@/types/FaqItem';

/** Prices come from the admin, so the cost answer is built per request. */
export function aiSeoFaqs(prices: SeoAuditPrices): FaqItem[] {
  return [
    {
      question: 'What is AI SEO, and how is it different from SEO?',
      answer:
        "AI SEO, also called GEO or AEO, is getting your business found, read and named in AI answers: ChatGPT, Google's AI Overviews and AI Mode, Copilot and Perplexity. Most of it is the SEO Google already rewards, because those tools lean on search indexes. The difference is a handful of checks most sites have never had: which AI crawlers are let in, whether Bing has your pages, and whether a machine can tell who you are.",
    },
    {
      question: 'Does AI SEO replace traditional SEO?',
      answer:
        "No. Google's AI Overviews use Google's own index, Copilot runs on Bing, and ChatGPT search draws on search providers too. A page that isn't indexed and ranking is rarely the one an AI answer quotes, so AI SEO sits on top of SEO rather than instead of it.",
    },
    {
      question: 'How do I get my business mentioned in ChatGPT?',
      answer:
        "Let OpenAI's search crawler, OAI-SearchBot, into your site, get your pages into Bing as well as Google, and make your business name, phone number and address match everywhere you're listed. Reviews and genuine mentions on other sites help too. Then ask ChatGPT what your customers would ask and see who it names, as a spot check rather than a measurement.",
    },
    {
      question: "How do I show up in Google's AI Overviews?",
      answer:
        "Google says there are no extra requirements: a page has to be indexed and eligible to show in Google Search with a snippet. So the work is ordinary SEO done well, plus one setting most owners have never seen: Search Console's Search generative AI setting, which must be left to include your site.",
    },
    {
      question: 'Do I need an llms.txt file?',
      answer:
        "It helps to have a good one. An llms.txt file is a plain summary of your site written for AI tools, and Google's PageSpeed Insights now checks that it works. We write one for every site we build, and for yours at a fixed price alongside the audit's other fixes. Google says its own search ignores these files, so treat it as a tidy extra for the AI tools that read it, not a shortcut to rankings.",
    },
    {
      question: 'How long does AI SEO take to work?',
      answer:
        "A crawler that was blocked can be let in the same day, and Google's AI features pick up a page once Google has re-read it, usually within weeks. Changes across a whole site can take several months to be recognised. Be wary of any promise that you'll be named by a date: the same question can get a different AI answer next time.",
    },
    {
      question: 'How much does AI SEO cost in Perth?',
      answer: `An Essentials audit is ${prices.essentials}, Plus is ${prices.plus} and Complete is ${prices.complete}, each paid once with no subscription, and every one checks your site for AI search. If you'd rather not make the changes yourself, any recommendation can come with a fixed price for us to do it.`,
    },
    {
      question: 'Can you guarantee AI tools will recommend my business?',
      answer:
        "No, and nobody can: no one controls what an AI tool says, and its answers change from one asking to the next. What can be checked is everything that stops it naming you, and what can be measured is how often Google shows your pages in its AI features. The audit's money-back guarantee is on your Google clicks, which we can measure.",
      links: [{ phrase: 'money-back guarantee', href: '/legal/seo-audit-terms' }],
    },
    {
      question: 'How do I check where I appear in AI answers?',
      answer:
        "Search Console's Generative AI report shows how often your pages were shown in AI Overviews and AI Mode, and Bing Webmaster Tools reports citations in Copilot. Your analytics shows visits from chatgpt.com and perplexity.ai. Our guide to showing up in AI search walks through each one.",
      links: [{ phrase: 'showing up in AI search', href: '/how-to-show-up-in-ai-search' }],
    },
    {
      question: "Can I get AI SEO if I'm not in Perth?",
      answer:
        'Yes. The audit is written from your site and your search data, so it is delivered the same way anywhere in Australia. We work primarily in Perth and have clients in cities across the country.',
    },
  ];
}
