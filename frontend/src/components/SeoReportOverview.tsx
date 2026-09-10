import type { ReactNode } from "react";

import { SeoReportVisual } from "./SeoReportVisual";
import { SplitFeatureSection } from "./SplitFeatureSection";
import styles from "./SeoReportOverview.module.css";

type SeoReportOverviewProps = {
  eyebrow: string;
  description: ReactNode;
  title?: string;
  accentTitle?: string;
  id?: string;
  className?: string;
  showSequence?: boolean;
  mode?: "report" | "improvement";
  spacing?: "standard" | "compact" | "joined";
  textSide?: "left" | "right";
};

export function SeoReportOverview({
  eyebrow,
  description,
  title = "One document.",
  accentTitle = "Four sections.",
  id,
  className = "",
  showSequence = true,
  mode = "report",
  spacing = "compact",
  textSide = "left",
}: SeoReportOverviewProps) {
  return (
    <SplitFeatureSection
      id={id}
      eyebrow={eyebrow}
      title={title}
      accentTitle={accentTitle}
      description={description}
      visual={<SeoReportVisual mode={mode} />}
      textSide={textSide}
      spacing={spacing}
      className={className}
      supportingContent={
        showSequence ? (
          <div className={styles.reportSequence} aria-hidden="true">
            <span>01</span>
            <i />
            <span>02</span>
            <i />
            <span>03</span>
            <i />
            <span>04</span>
          </div>
        ) : undefined
      }
    />
  );
}
