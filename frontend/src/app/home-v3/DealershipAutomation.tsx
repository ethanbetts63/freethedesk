type Service = {
  title: string;
  body: string;
  examples: string[];
  color: string;
  icon: React.ReactNode;
};

const iconProps = { viewBox: "0 0 64 64", width: 56, height: 56, fill: "none" as const, "aria-hidden": true };

const services: Service[] = [
  {
    title: "Sales, licensing & delivery",
    body: "Coordinate the paperwork and handoff from signed deal to delivered vehicle, without a dozen calls to check where it's up to.",
    examples: [
      "Licensing and contracts started online, not chased on paper",
      "Delivery or pickup scheduled with the customer automatically",
      "Finance and trade-in steps tracked in one place",
      "Every handoff—sales to admin to delivery—visible without asking",
    ],
    color: "var(--blue-500)",
    icon: (
      <svg {...iconProps}>
        <rect x="12" y="8" width="34" height="48" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M19 22H39M19 30H39M19 38H31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="46" cy="46" r="12" fill="currentColor" />
        <path d="M41 46L45 50L52 42" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Lead handling",
    body: "Every enquiry captured with vehicle and customer context, and routed to the right salesperson before the trail goes cold.",
    examples: [
      "New enquiries arrive with the vehicle, page and customer detail attached",
      "Routed to the right salesperson automatically, not whoever checks the inbox first",
      "A reminder if a lead sits untouched for too long",
      "Follow-up timed around how buyers actually decide",
    ],
    color: "var(--blue-600)",
    icon: (
      <svg {...iconProps}>
        <circle cx="32" cy="32" r="23" stroke="currentColor" strokeWidth="2" opacity=".2" />
        <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="2" opacity=".45" />
        <circle cx="32" cy="32" r="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Communication templates",
    body: "Pre-written, on-brand emails for the moments that repeat—finance follow-up, trade-in requests, service reminders—sent without starting from a blank page.",
    examples: [
      "Templates for the emails your team writes every day",
      "Personalised with customer and vehicle details automatically",
      "Consistent tone and information, whoever hits send",
      "Edited centrally so a wording fix updates everywhere at once",
    ],
    color: "var(--blue-700)",
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="14" width="52" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M9 18L32 36L55 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Quotes and documents",
    body: "Generate professional PDF quotes, invoices and trade-in valuations from information already on file, instead of rebuilding them by hand.",
    examples: [
      "Quotes generated as a PDF straight from the enquiry",
      "Consistent pricing, terms and branding every time",
      "Sent to the customer without leaving the enquiry",
      "No re-typing figures that already exist elsewhere in the system",
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
];

/** Dealer-specific automation pitch, sitting on the homepage under the other product components. */
export function DealershipAutomation() {
  return (
    <>
      <section className="section shell intro-section">
        <div>
          <p className="eyebrow"><span /> Dealership automation</p>
          <h2>The systems that keep a sales floor moving.</h2>
        </div>
        <p className="section-intro">The same connected systems, aimed at what actually eats a dealership's week: enquiries, licensing paperwork, delivery handoffs and the emails your team writes every day.</p>
      </section>

      <section className="shell" id="dealership-automation">
        <div className="service-scroll">
          {services.map((service, index) => (
            <div className="service-row" key={service.title}>
              <div className="service-sticky">
                <span style={{ color: service.color }}>0{index + 1}</span>
                <h3>{service.title}</h3>
              </div>
              <div className="service-content">
                <div className="service-icon" style={{ color: service.color }}>{service.icon}</div>
                <p>{service.body}</p>
                <ul className="service-examples">
                  {service.examples.map((example) => <li key={example}>{example}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
