import Link from "next/link";

type Service = {
  title: string;
  body: string;
  examples?: string[];
  color: string;
  icon: React.ReactNode;
  highlight?: boolean;
  cta?: { label: string; href: string };
};

const iconProps = { viewBox: "0 0 64 64", width: 56, height: 56, fill: "none" as const, "aria-hidden": true };

const services: Service[] = [
  {
    title: "Lead handling",
    body: "Capture the product and customer context, route it to the right person and make sure the next action is visible.",
    examples: [
      "New enquiries arrive with the product, page and customer detail already attached",
      "Routed to the right person automatically, not whoever opens the inbox first",
      "A notification the moment it lands, not the next time someone checks email",
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
        <path d="M21 39L28 46L43 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
    color: "var(--blue-800)",
    icon: (
      <svg {...iconProps}>
        <rect x="14" y="10" width="34" height="44" rx="3" transform="rotate(-8 31 32)" fill="currentColor" opacity=".18" />
        <rect x="14" y="10" width="34" height="44" rx="3" transform="rotate(4 31 32)" fill="currentColor" opacity=".35" />
        <rect x="14" y="10" width="34" height="44" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M22 24H40M22 32H40M22 40H33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Reporting",
    body: "Bring live operational information together so the owner sees the decision, not another spreadsheet job.",
    examples: [
      "One weekly summary instead of five separate spreadsheets",
      "Numbers pulled from the systems you already run",
      "Delivered to your inbox, not another login to remember",
      "Built around the decision it needs to inform",
    ],
    color: "var(--blue-900)",
    icon: (
      <svg {...iconProps}>
        <rect x="10" y="34" width="10" height="20" rx="2" fill="currentColor" opacity=".4" />
        <rect x="27" y="22" width="10" height="32" rx="2" fill="currentColor" opacity=".7" />
        <rect x="44" y="10" width="10" height="44" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Something only your business does",
    body: "The repetitive, computer-based task too specific for any off-the-shelf tool. Tell us what eats your week.",
    color: "var(--accent-strong)",
    icon: (
      <svg viewBox="0 0 64 64" width={96} height={96} fill="none" aria-hidden="true">
        <path d="M32 2V62M6 12L58 52M58 12L6 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    ),
    highlight: true,
    cta: { label: "Tell us about it", href: "/contact" },
  },
];

export function ServiceScroll() {
  return (
    <div className="service-scroll">
      {services.map((service, index) => (
        <div className={`service-row${service.highlight ? " service-row-highlight" : ""}`} key={service.title}>
          <div className="service-sticky">
            <span style={{ color: service.color }}>0{index + 1}</span>
            <h3>{service.title}</h3>
          </div>
          <div className="service-content">
            <div className="service-icon" style={{ color: service.color }}>{service.icon}</div>
            <p>{service.body}</p>
            {service.examples && (
              <ul className="service-examples">
                {service.examples.map((example) => <li key={example}>{example}</li>)}
              </ul>
            )}
            {service.cta && (
              <Link className="service-cta" href={service.cta.href} style={{ background: service.color }}>
                {service.cta.label} <span>→</span>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
