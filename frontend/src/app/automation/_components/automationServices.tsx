import type { Service } from "@/components/ServiceScroll";

const iconProps = { viewBox: "0 0 64 64", width: 56, height: 56, fill: "none" as const, "aria-hidden": true };

export const automationServices: Service[] = [
  {
    title: "Lead handling",
    body: "Capture the product and customer context, route it to the right person and make sure the next action is visible.",
    examples: [
      "New enquiries arrive with the product, page and customer detail already attached",
      "Routed to the right person automatically, not whoever opens the inbox first",
      "A text the moment it lands, not the next time someone checks email",
      "A reminder if a lead sits untouched for too long",
    ],
    color: "var(--blue-500)",
    icon: (
      <svg {...iconProps}>
        <circle cx="32" cy="32" r="23" stroke="currentColor" strokeWidth="2" opacity=".2" />
        <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="2" opacity=".45" />
        <circle cx="32" cy="32" r="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Customer onboarding",
    body: "Every new customer or job kicks off the same first steps, without anyone having to remember them.",
    examples: [
      "Welcome and next steps sent the moment a deal is marked won",
      "Forms, documents and deposits requested and chased on their own",
      "The job created in every system it needs to exist in",
      "A task list waiting for your team so nothing is missed on day one",
    ],
    color: "var(--blue-600)",
    icon: (
      <svg {...iconProps}>
        <path
          d="M10 36v12a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4V36"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M32 8v28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M21 25l11 11 11-11"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Bookings",
    body: "Collect better booking details, send reminders and keep customers informed at the useful moments.",
    examples: [
      "Booking details collected upfront, not chased afterwards",
      "Automatic reminders sent before the appointment",
      "Customers notified the moment something changes",
      "Synced with the booking system you already run",
    ],
    color: "var(--blue-700)",
    icon: (
      <svg {...iconProps}>
        <rect x="10" y="14" width="44" height="40" rx="5" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 26H54" stroke="currentColor" strokeWidth="2.5" />
        <path d="M20 9V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M44 9V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M21 39L28 46L43 31"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "CRM and system sync",
    body: "Enter information once and let it appear everywhere it is needed, instead of re-keying it between tools.",
    examples: [
      "A new contact on the website appears in the CRM without retyping",
      "A status change in one system updates the others",
      "Sales, accounts and delivery working from the same record",
      "The gaps between tools that don't officially integrate, filled in",
    ],
    color: "var(--blue-800)",
    icon: (
      <svg {...iconProps}>
        <path d="M14 26a19 19 0 0 1 33-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 38a19 19 0 0 1-33 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M47 9v11H35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 55V44h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Invoicing and payments",
    body: "Raise, send, chase and reconcile the routine billing that currently waits on someone finding the time.",
    examples: [
      "Invoices raised from the job or order, not re-keyed from it",
      "Overdue accounts chased on a schedule, politely and automatically",
      "Payments matched against the bank feed as they land",
      "Recurring billing that runs without a monthly reminder",
    ],
    color: "var(--blue-900)",
    icon: (
      <svg {...iconProps}>
        <rect x="8" y="15" width="48" height="34" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="32" r="2" fill="currentColor" />
        <circle cx="48" cy="32" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Documents and data",
    body: "Generate, classify, extract or transfer information where people are currently copying and pasting.",
    examples: [
      "Pull details straight out of a supplier PDF or price list",
      "Generate paperwork from information already entered once",
      "Classify incoming documents without opening each one",
      "Move data between systems that don't otherwise talk to each other",
    ],
    color: "var(--blue-950)",
    icon: (
      <svg {...iconProps}>
        <rect
          x="14"
          y="10"
          width="34"
          height="44"
          rx="3"
          transform="rotate(-8 31 32)"
          fill="currentColor"
          opacity=".18"
        />
        <rect
          x="14"
          y="10"
          width="34"
          height="44"
          rx="3"
          transform="rotate(4 31 32)"
          fill="currentColor"
          opacity=".35"
        />
        <rect x="14" y="10" width="34" height="44" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M22 24H40M22 32H40M22 40H33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];
