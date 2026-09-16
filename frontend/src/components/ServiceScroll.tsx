import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";

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
  showCustomCta = true,
}: {
  services: Service[];
  customHref: string;
  eyebrow: string;
  title: string;
  ctaLabel?: string;
  showCustomService?: boolean;
  showCustomCta?: boolean;
}) {
  // The form is below this list, so in-page links scroll down.
  const ctaDirection = customHref.startsWith("#") ? "down" : "page";

  return (
    // "service-scroll" carries no styling of its own - it's a marker class so
    // base.css's `main:has(.service-scroll)` can let sticky content escape
    // main's default `overflow: hidden`.
    <div className="service-scroll mt-0">
      <div className="flex flex-wrap items-center justify-between gap-xl pt-2xl">
        <div>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2 className="m-0 max-w-[780px] text-display-3 leading-[1.02] tracking-[-0.058em]">{title}</h2>
        </div>
      </div>
      {services.map((service, index) => (
        <div
          className={`grid grid-cols-[minmax(0,1fr)] gap-2xl border-t border-border-default px-0 pb-3xl min-[900px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] ${
            index === 0 ? "border-t-0 pt-2xl" : "pt-3xl"
          }`}
          key={service.title}
        >
          <div className="static top-[130px] self-start min-[900px]:sticky">
            {/* Number colour comes from the stylesheet (--accent-ink) so it always
                clears contrast; service.color only tints the decorative icon. */}
            <span className="text-caption font-heavy text-text-action">0{index + 1}</span>
            <h3 className="mt-m mb-0 text-display-2 leading-[1.05] tracking-[-0.04em]">{service.title}</h3>
          </div>
          <div className="max-w-[560px] pt-2xs">
            <div className="flex flex-col items-start gap-l sm:flex-row sm:items-center">
              <div className="flex-none" style={{ color: service.color }}>
                {service.icon}
              </div>
              <p className="m-0 text-lead leading-[1.65] font-medium text-text-muted">{service.body}</p>
            </div>
            <ul className="m-0 mt-xl list-none border-t border-border-default p-0">
              {service.examples.map((example) => (
                <li
                  key={example}
                  className="relative border-b border-border-default py-m pr-0 pl-l text-body leading-[1.6] text-text-primary before:absolute before:left-0 before:text-text-action before:content-['→']"
                >
                  {example}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      {showCustomService && (
        <div className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-[clamp(30px,5vw,64px)] border-t border-border-default px-0 py-3xl text-text-primary sm:grid-cols-[auto_minmax(0,1fr)] min-[900px]:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div
            className="relative z-1 flex h-[82px] w-[82px] items-center justify-center border border-[color-mix(in_srgb,var(--text-action)_30%,transparent)] bg-[color-mix(in_srgb,var(--text-action)_8%,transparent)] text-text-action sm:h-[112px] sm:w-[112px] [&>svg]:h-[44px] [&>svg]:w-[44px] sm:[&>svg]:h-[58px] sm:[&>svg]:w-[58px]"
            aria-hidden="true"
          >
            {customService.icon}
          </div>
          <div className="relative z-1">
            <p className="m-0 mb-s flex items-center gap-s text-meta font-black tracking-[0.13em] text-text-action uppercase">
              <span className="border-r border-[color-mix(in_srgb,var(--text-action)_30%,transparent)] pr-s">
                0{services.length + 1}
              </span>
              Built around your business
            </p>
            <h3 className="m-0 mb-m text-display-2 leading-none tracking-[-0.05em]">{customService.title}</h3>
            <p className="m-0 max-w-[520px] text-lead leading-[1.65] text-text-muted">{customService.body}</p>
          </div>
          {showCustomCta && (
            <PrimaryButton
              className="relative z-1 flex-none justify-self-start sm:col-start-2 min-[900px]:col-auto min-[900px]:justify-self-auto"
              href={customHref}
              direction={ctaDirection}
            >
              {ctaLabel}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
