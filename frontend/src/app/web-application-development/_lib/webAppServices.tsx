import type { Service } from '@/components/ServiceScroll';

const iconProps = {
  viewBox: '0 0 64 64',
  width: 56,
  height: 56,
  fill: 'none' as const,
  'aria-hidden': true,
};

const stroke = {
  stroke: 'currentColor',
  strokeWidth: '2.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const webAppServices: Service[] = [
  {
    title: 'Customer accounts and portals',
    body: 'Customers sign in to see their orders, bookings, documents and invoices, instead of ringing to ask where things are up to.',
    examples: [
      'Each customer sees their own records and nobody else’s',
      'Status updates without a phone call',
      'Documents and invoices ready to download',
      'Sign-in that works on any phone',
    ],
    color: 'var(--category-service-1)',
    icon: (
      <svg {...iconProps}>
        <rect x="8" y="10" width="48" height="44" rx="4" {...stroke} />
        <circle cx="32" cy="27" r="7" {...stroke} />
        <path d="M19 46c2-6 7-9 13-9s11 3 13 9" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Payments, deposits and subscriptions',
    body: 'Stripe checkout, deposits and recurring billing built into the flow, so the money arrives with the order rather than after it.',
    examples: [
      'One-off payments and deposits',
      'Monthly, quarterly or yearly subscriptions',
      'Receipts sent the moment a payment clears',
      'Refunds handled from your own dashboard',
    ],
    color: 'var(--category-service-2)',
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="14" width="52" height="36" rx="4" {...stroke} />
        <path d="M6 24h52M14 40h12" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Identity checks and online signing',
    body: 'Check who a customer is and have them sign online, the way our online vehicle licensing works for dealerships.',
    examples: [
      'Identity checked before anything is signed',
      'Contracts signed on a phone',
      'A signed record kept against the customer',
      'No printing, scanning or trip to the office',
    ],
    color: 'var(--category-service-3)',
    icon: (
      <svg {...iconProps}>
        <path d="M32 6l20 8v14c0 13-8 23-20 29C20 51 12 41 12 28V14l20-8Z" {...stroke} />
        <path d="M23 31l6 6 12-13" {...stroke} />
      </svg>
    ),
  },
  {
    title: 'Staff dashboards and approvals',
    body: 'The screens your team works from: what needs doing next, what is waiting on approval, and the records behind both, in place of a shared spreadsheet.',
    examples: [
      'A queue of what needs doing next',
      'Approve or decline in one place',
      'A history of every change to a record',
      'Reports that add themselves up',
    ],
    color: 'var(--category-service-4)',
    icon: (
      <svg {...iconProps}>
        <rect x="8" y="8" width="20" height="20" rx="3" {...stroke} />
        <rect x="36" y="8" width="20" height="20" rx="3" {...stroke} />
        <rect x="8" y="36" width="20" height="20" rx="3" {...stroke} />
        <path d="M38 46l5 5 11-12" {...stroke} />
      </svg>
    ),
  },
];
