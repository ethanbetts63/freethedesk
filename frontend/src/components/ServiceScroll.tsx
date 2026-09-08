import Link from "next/link";

import { PrimaryButton } from "@/components/PrimaryButton";

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

   
                                                                               
                                                                          
                                                                            
                                                                        
  
                                                                            
                                                                             
                                                                           
   
export function ServiceScroll({
  services,
  customHref,
  eyebrow,
  title,
  lead,
  ctaLabel,
}: {
  services: Service[];
  customHref: string;
  eyebrow: string;
  title: string;
  lead?: string;
  ctaLabel?: string;
}) {
  // The list sits above the page's form, so an on-page target is below it.
  const ctaDirection = customHref.startsWith("#") ? "down" : "page";

  return (
    <div className="service-scroll">
      <div className="service-scroll-intro">
        <div>
          <p className="service-scroll-label">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        {ctaLabel && (
          <PrimaryButton className="service-scroll-cta" href={customHref} direction={ctaDirection}>
            {ctaLabel}
          </PrimaryButton>
        )}
      </div>
      {lead && <p className="service-scroll-lead">{lead}</p>}

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
          {/* The list sits above the page's form, so an on-page target is below. */}
          <Link className="service-cta" href={customHref} style={{ background: customService.color }}>
            Tell us about it <span>{ctaDirection === "down" ? "↓" : "↗"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
