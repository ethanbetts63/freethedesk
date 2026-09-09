import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
import "./ServiceScroll.css";

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
  ctaLabel = "Tell us about it",
  showCustomService = true,
}: {
  services: Service[];
  customHref: string;
  eyebrow: string;
  title: string;
  ctaLabel?: string;
  showCustomService?: boolean;
}) {
  // The form is below this list, so in-page links scroll down.
  const ctaDirection = customHref.startsWith("#") ? "down" : "page";

  return (
    <div className="service-scroll">
      <div className="service-scroll-intro">
        <div>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>{title}</h2>
        </div>
      </div>
      {services.map((service, index) => (
        <div className="service-row" key={service.title}>
          <div className="service-sticky">
            {/* Number colour comes from the stylesheet (--accent-ink) so it always
                clears contrast; service.color only tints the decorative icon. */}
            <span>0{index + 1}</span>
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
      {showCustomService && (
        <div className="service-custom">
          <div className="service-custom-icon" aria-hidden="true">
            {customService.icon}
          </div>
          <div className="service-custom-copy">
            <p className="service-custom-label">
              <span>0{services.length + 1}</span>
              Built around your business
            </p>
            <h3>{customService.title}</h3>
            <p>{customService.body}</p>
          </div>
          <PrimaryButton className="service-custom-cta" href={customHref} direction={ctaDirection}>
            {ctaLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
