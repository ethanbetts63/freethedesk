import Link from "next/link";

import { Eyebrow } from "@/components/Eyebrow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { NetworkField } from "@/components/visuals/NetworkField";

import styles from "./Hero.module.css";

type HeroProps = {
  eyebrow: string;

  titleLines: readonly string[];

  accentTitle: string;
  lead: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  trustLine?: string;
};

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
}: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.glow} />
      <div className={styles.network}>
        <NetworkField />
      </div>
      <div className={styles.grid} />
      <div className={`shell ${styles.content}`}>
        <div className={styles.copy}>
          <Eyebrow className={styles.eyebrow}>{eyebrow}</Eyebrow>
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
            {/* Hero is at the top, so in-page links scroll down. */}
            <PrimaryButton
              className={styles.primary}
              href={primaryHref}
              direction={primaryHref.startsWith("#") ? "down" : "page"}
              size="large"
            >
              {primaryLabel}
            </PrimaryButton>
            <Link className={styles.secondary} href={secondaryHref}>
              {secondaryLabel} <span>{secondaryHref.startsWith("#") ? "↓" : "↗"}</span>
            </Link>
          </div>
          {trustLine ? <p className={styles.trustLine}>{trustLine}</p> : null}
        </div>
      </div>
    </section>
  );
}
