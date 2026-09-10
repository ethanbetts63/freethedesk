import Link from "next/link";
import type { CSSProperties } from "react";

import "./ProcessBar.css";

export type ProcessBarStep = {
  label: string;
  description: string;
  href?: string;
};

export function ProcessBar({ label, steps, id }: { label: string; steps: readonly ProcessBarStep[]; id?: string }) {
  return (
    <section className="process-bar" aria-label={label} id={id}>
      <div className="shell process-bar-inner">
        <p className="process-bar-label">{label}</p>
        <ol className="process-bar-steps" style={{ "--process-columns": steps.length } as CSSProperties}>
          {steps.map((step, index) => {
            const content = (
              <>
                <span className="process-bar-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="process-bar-copy">
                  <strong>{step.label}</strong>
                  <small>{step.description}</small>
                </span>
                {step.href && (
                  <span className="process-bar-arrow" aria-hidden="true">
                    ↓
                  </span>
                )}
              </>
            );

            return (
              <li key={step.label}>{step.href ? <Link href={step.href}>{content}</Link> : <div>{content}</div>}</li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
