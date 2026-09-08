import "./ApproachSection.css";

import type { ReactNode } from "react";

import { PrimaryButton } from "./PrimaryButton";

export type ApproachStep = {
  title: string;
  description: string;
  icon: ReactNode;
};

type ApproachSectionProps = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  steps: readonly ApproachStep[];
  ctaHref: string;
  ctaLabel: string;
};

export function ApproachSection({ eyebrow, title, accentTitle, steps, ctaHref, ctaLabel }: ApproachSectionProps) {
  return (
    <section className="approach-section">
      <div className="shell approach-inner">
        <p className="section-number section-number-light">{eyebrow}</p>
        <h2>
          {title}
          <br />
          <span className="moving-colour-text">{accentTitle}</span>
        </h2>
        <ol className="approach-steps">
          {steps.map(({ title: stepTitle, description, icon }, index) => (
            <li className="approach-step" key={stepTitle}>
              <div className="approach-step-rail">
                <span className="approach-step-icon" aria-hidden="true">
                  {icon}
                </span>
                {index < steps.length - 1 && <span className="approach-step-line" />}
              </div>
              <div className="approach-step-body">
                <span className="approach-step-index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{stepTitle}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <PrimaryButton className="approach-cta" href={ctaHref} direction="down">
          {ctaLabel}
        </PrimaryButton>
      </div>
    </section>
  );
}
