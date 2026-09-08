import Link from "next/link";

export type Service = {
  title: string;
  body: string;
  examples: string[];
  color: string;
  icon: React.ReactNode;
};

const customService = {
  title: "Custom automation",
  body: "The repetitive, computer-based task too specific for any off-the-shelf tool. Tell us what eats your week.",
  color: "var(--accent-strong)",
  icon: (
    <svg viewBox="0 0 64 64" width={96} height={96} fill="none" aria-hidden="true">
      <path d="M32 2V62M6 12L58 52M58 12L6 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * The sticky service list, used by /automation, /website-development, /seo and
 * the dealership pitch. Every page gets the identical layout and the same
 * "something only your business does" closer; only the service copy and the
 * closer's destination differ, so the pitch cannot drift between pages.
 *
 * Needs `main:has(.service-scroll) { overflow: visible }` (see globals.css)
 * on whichever page renders this—position:sticky is inert under any ancestor
 * with overflow != visible, and every <main> defaults to overflow: hidden.
 */
export function ServiceScroll({ services, customHref }: { services: Service[]; customHref: string }) {
  return (
    <div className="service-scroll">
      {services.map((service, index) => (
        <div className="service-row" key={service.title}>
          <div className="service-sticky">
            <span style={{ color: service.color }}>0{index + 1}</span>
            <h3>{service.title}</h3>
          </div>
          <div className="service-content">
            <div className="service-lead">
              <div className="service-icon" style={{ color: service.color }}>
                {service.icon}
              </div>
              <p>{service.body}</p>
            </div>
            <ul className="service-examples">
              {service.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      <div className="service-row service-row-highlight">
        <div className="service-sticky">
          <span style={{ color: customService.color }}>0{services.length + 1}</span>
          <h3>{customService.title}</h3>
        </div>
        <div className="service-content">
          <div className="service-lead">
            <div className="service-icon" style={{ color: customService.color }}>
              {customService.icon}
            </div>
            <p>{customService.body}</p>
          </div>
          <Link className="service-cta" href={customHref} style={{ background: customService.color }}>
            Tell us about it <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
