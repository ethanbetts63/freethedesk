import { Fragment } from "react";

import styles from "./FlowCardVisual.module.css";

export type FlowCardNode = {
  label: string;
  title: string;
  description: string;
};

type FlowCardVisualProps = {
  browserLabel: string;
  inputs: readonly FlowCardNode[];
  result: FlowCardNode;
  steps?: readonly Omit<FlowCardNode, "label">[];
  ariaLabel?: string;
};

export function FlowCardVisual({ browserLabel, inputs, result, steps = [], ariaLabel }: FlowCardVisualProps) {
  const mode = steps.length ? "steps" : "combine";

  return (
    <div className={styles.visual} aria-label={ariaLabel}>
      <div className={styles.browser} aria-hidden="true">
        <i />
        <i />
        <i />
        <span>{browserLabel}</span>
      </div>

      <div className={styles.body} data-mode={mode}>
        <div className={styles.inputs} data-count={inputs.length}>
          {inputs.map((input, index) => (
            <Fragment key={input.title}>
              {index > 0 ? <b aria-hidden="true">+</b> : null}
              <article>
                <small>{input.label}</small>
                <strong>{input.title}</strong>
                <span>{input.description}</span>
              </article>
            </Fragment>
          ))}
        </div>

        {steps.length ? (
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <small>{step.description}</small>
              </li>
            ))}
          </ol>
        ) : null}

        <div className={styles.connector} aria-hidden="true">
          <i />
          <span>↓</span>
        </div>

        <div className={styles.result}>
          <span className={styles.tick} aria-hidden="true">
            ✓
          </span>
          <span>{result.label}</span>
          <strong>{result.title}</strong>
          <small>{result.description}</small>
        </div>
      </div>
    </div>
  );
}
