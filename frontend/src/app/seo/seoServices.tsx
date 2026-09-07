import type { Service } from "@/components/ServiceScroll";

const iconProps = { viewBox: "0 0 64 64", width: 56, height: 56, fill: "none" as const, "aria-hidden": true };

export const seoServices: Service[] = [
  {
    title: "Crawl and redirect architecture",
    body: "Search engines only spend so much attention on a site. What gets crawled, what gets indexed, and what old links point to all decide how much of that attention goes to waste.",
    examples: [
      "Old URLs redirected to their nearest modern equivalent, not just the homepage—so a page already ranking doesn't lose that position for good",
      "Duplicate pages consolidated onto one canonical URL instead of competing with themselves",
      "Crawl access opened deliberately to AI answer engines, not just Google, and closed off from admin, checkout and account pages that have nothing to rank for",
      "A sitemap that reflects what's actually live, not what used to be",
    ],
    color: "var(--blue-500)",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="44" r="5" stroke="currentColor" strokeWidth="2.5" />
        <path d="M17 44H36a10 10 0 0 0 10-10v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 24l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Content worth linking to",
    body: "One of the strongest signals a search engine weighs is whether other pages—and people—link to yours. That has to be earned with something worth linking to, not requested.",
    examples: [
      "Long-form guides with a named author and a real publish date, not anonymous filler",
      "Interactive tools people bookmark and share, not just another paragraph of text",
      "Genuine reviews shown on the page itself, not just buried in schema",
      "Guides and location pages cross-linked to each other so authority moves between them",
    ],
    color: "var(--blue-600)",
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="24" width="24" height="16" rx="8" transform="rotate(-40 18 32)" stroke="currentColor" strokeWidth="2.5" />
        <rect x="34" y="24" width="24" height="16" rx="8" transform="rotate(-40 46 32)" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    title: "High-intent page testing",
    body: "The highest-leverage move is also the easiest to get wrong: splitting a page off to chase a specific search intent, without it reading as a duplicate of the page it came from.",
    examples: [
      "Built from a real gap in the data—a search term or local variant already earning clicks elsewhere with nothing built for it",
      "Different enough in substance—distinct detail, its own FAQs, a genuine reason to exist—that it earns its own ranking instead of getting folded into the original",
      "Launched as a test, not a bet: watched in Search Console to see whether it actually gets indexed and ranks",
      "Kept if it earns its place, folded back in or removed if it doesn't—nothing left cluttering the site just because it was built",
    ],
    color: "var(--blue-700)",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="32" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="16" r="5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="48" r="5" stroke="currentColor" strokeWidth="2.5" />
        <path d="M17 32C28 32 28 16 45 16M17 32C28 32 28 48 45 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];
