import Link from "next/link";

import { NetworkField } from "@/components/visuals/NetworkField";

import styles from "./Hero.module.css";

type HeroProps = {
  eyebrow: string;
  /** Plain-weight headline lines, rendered one per line above `accentTitle`. */
  titleLines: readonly string[];
  /** Final headline line, rendered in the hero accent colour. */
  accentTitle: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  trustLine?: string;
  /** Pass a process to render the numbered rail beside the copy. Omit for a full-width hero. */
  stages?: readonly string[];
};

/** The site's only hero. Every page passes its own copy—nothing here is page-specific. */
export function Hero({
  eyebrow,
  titleLines,
  accentTitle,
  lead,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  trustLine = "Perth-based · working with businesses across Australia",
  stages,
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.network}>
        <NetworkField />
      </div>
      <div className={styles.grid} />
      <div className={`shell ${styles.content}${stages ? ` ${styles.withStages}` : ""}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span /> {eyebrow}
          </p>
          <h1>
            {titleLines.map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
            <em>{accentTitle}</em>
          </h1>
          <p className={styles.lead}>{lead}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={primaryHref}>
              {primaryLabel} <span>↗</span>
            </Link>
            <Link className={styles.secondary} href={secondaryHref}>
              {secondaryLabel} <span>→</span>
            </Link>
          </div>
          {trustLine ? <p className={styles.trustLine}>{trustLine}</p> : null}
        </div>
        {stages ? (
          <div className={styles.readout} aria-hidden="true">
            {stages.map((stage, index) => (
              <div key={stage}>
                <span>0{index + 1}</span>
                <p>{stage}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
