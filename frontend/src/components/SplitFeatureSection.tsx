import type { ReactNode } from "react";

import { SectionNumber } from "./SectionNumber";
import styles from "./SplitFeatureSection.module.css";

type SplitFeatureSectionProps = {
  eyebrow: string;
  title: string;
  accentTitle: string;
  description: ReactNode;
  visual: ReactNode;
  id?: string;
  textSide?: "left" | "right";
  titleBreak?: "always" | "desktop" | "none";
  background?: "white" | "tint" | "transparent";
  spacing?: "standard" | "compact" | "joined";
  bullets?: readonly string[];
  supportingContent?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SplitFeatureSection({
  eyebrow,
  title,
  accentTitle,
  description,
  visual,
  id,
  textSide = "left",
  titleBreak = "always",
  background = "transparent",
  spacing = "standard",
  bullets,
  supportingContent,
  action,
  className = "",
}: SplitFeatureSectionProps) {
  const sectionClasses = [styles.section, styles[background], styles[spacing], className].filter(Boolean).join(" ");

  return (
    <section className={sectionClasses} id={id}>
      <div className={`shell ${styles.layout}`} data-text-side={textSide}>
        <div className={styles.copy}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>
            {title}
            {titleBreak !== "none" && <br className={titleBreak === "desktop" ? styles.desktopBreak : undefined} />}
            {titleBreak === "none" ? " " : null}
            <span className="moving-colour-text">{accentTitle}</span>
          </h2>
          <div className={styles.description}>{description}</div>
          {bullets?.length ? (
            <ul className={styles.bullets}>
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {supportingContent}
          {action ? <div className={styles.action}>{action}</div> : null}
        </div>
        <div className={styles.visual}>{visual}</div>
      </div>
    </section>
  );
}
