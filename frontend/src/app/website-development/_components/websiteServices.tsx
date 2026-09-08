import type { Service } from "@/components/ServiceScroll";

const iconProps = { viewBox: "0 0 64 64", width: 56, height: 56, fill: "none" as const, "aria-hidden": true };

export const websiteServices: Service[] = [
  {
    title: "Stock and pricing that update themselves",
    body: "If your suppliers publish stock or pricing anywhere—even without a proper API—we build a sync that checks it on a schedule, so nobody is cross-referencing a spreadsheet by hand.",
    examples: [
      "Runs on a schedule—no one needs to remember to check it",
      "Works even when the supplier has no proper API to plug into",
      "Price and stock changes reflected without manual re-entry",
      "One source of truth instead of a spreadsheet everyone half-trusts",
    ],
    color: "var(--blue-500)",
    icon: (
      <svg {...iconProps}>
        <path d="M46 20a16 16 0 0 0-27-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M18 44a16 16 0 0 0 27 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M17 6v9h9M47 58v-9h-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "The moment something happens, you know",
    body: "A new order, a booking, an enquiry, a failed sync. SMS and email alerts land the second it matters, not whenever someone next opens a dashboard.",
    examples: [
      "SMS and email alerts fire the moment something happens",
      "Covers orders, bookings, enquiries and failed syncs alike",
      "No dashboard to remember to check",
      "Routed to the right person, not broadcast to everyone",
    ],
    color: "var(--blue-600)",
    icon: (
      <svg {...iconProps}>
        <path
          d="M32 8a16 16 0 0 0-16 16v10l-5 8h42l-5-8V24A16 16 0 0 0 32 8Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M26 52a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Every routine email, already written",
    body: "Order confirmations, booking reminders, status updates. Sent automatically the moment they are triggered, never drafted from scratch.",
    examples: [
      "Order confirmations, reminders and status updates sent automatically",
      "Personalised with the customer's own details, not generic",
      "Consistent tone and information, whoever or whatever triggers it",
      "Nothing left waiting on someone to remember to send it",
    ],
    color: "var(--blue-700)",
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="14" width="52" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M9 18L32 36L55 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Your calendar and your other tools, in sync",
    body: "If you already run a booking or job system, we connect it to your website instead of asking your team to enter the same thing twice.",
    examples: [
      "Connects to the booking or job system you already run",
      "Nothing entered twice between the website and your other tools",
      "A change on one side reflected on the other automatically",
      "Built around what you already use, not a replacement for it",
    ],
    color: "var(--blue-800)",
    icon: (
      <svg {...iconProps}>
        <rect x="10" y="12" width="44" height="42" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 24H54" stroke="currentColor" strokeWidth="2.5" />
        <path d="M21 6v10M43 6v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M20 34l5 5 11-11"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];
