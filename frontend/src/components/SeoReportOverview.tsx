import type { ReactNode } from "react";

import { SectionNumber } from "@/components/SectionNumber";
import styles from "./SeoReportOverview.module.css";

const reportSections = [
  {
    title: "Last period tracked",
    note: "What moved, what didn't.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M3 17l5.5-5.5 3.5 3.5L21 6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M16 6h5v5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Issues",
    note: "What's broken or holding you back.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M12 3.5 22 20H2L12 3.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Opportunities",
    note: "Searches you're missing.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "What to do next",
    note: "Ranked, with effort estimates.",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path
          d="M3 7.5 5 9.5 9 5.5M3 17 5 19l4-4"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13 8h8M13 17h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    ),
  },
];

const improvementSections = [
  {
    title: "What the data says",
    note: "A service page appears often in search but earns few clicks.",
    icon: reportSections[0].icon,
  },
  {
    title: "What it means",
    note: "Its search title is not matching what people want.",
    icon: reportSections[2].icon,
  },
  {
    title: "What to improve next",
    note: "Rewrite the title and compare the result in the next report.",
    icon: reportSections[3].icon,
  },
];

type SeoReportOverviewProps = {
  eyebrow: string;
  description: ReactNode;
  title?: string;
  accentTitle?: string;
  id?: string;
  className?: string;
  showSequence?: boolean;
  mode?: "report" | "improvement";
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
}: SeoReportOverviewProps) {
  const sections = mode === "improvement" ? improvementSections : reportSections;

  return (
    <section className={`shell ${styles.reportSection} ${className}`} id={id}>
      <div className={styles.reportCopy}>
        <SectionNumber>{eyebrow}</SectionNumber>
        <h2>
          {title}
          <br />
          <span>{accentTitle}</span>
        </h2>
        <div className={styles.description}>{description}</div>
        {showSequence && (
          <div className={styles.reportSequence} aria-hidden="true">
            <span>01</span>
            <i />
            <span>02</span>
            <i />
            <span>03</span>
            <i />
            <span>04</span>
          </div>
        )}
      </div>

      <div className={styles.reportCard}>
        <header className={styles.reportCardHead}>
          <span className={styles.reportDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>{mode === "improvement" ? "SEO improvement report" : "Quarterly SEO report"}</strong>
            <small>{mode === "improvement" ? "Real search data · this quarter" : "Your business · this quarter"}</small>
          </div>
          <span className={styles.reportBadge}>{mode === "improvement" ? "Next actions" : "Action plan"}</span>
        </header>
        <ol className={styles.reportList}>
          {sections.map((section, index) => (
            <li key={section.title}>
              <span className={styles.reportIndex}>0{index + 1}</span>
              <span className={styles.reportIcon} aria-hidden="true">
                {section.icon}
              </span>
              <div>
                <h3>{section.title}</h3>
                <p>{section.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <footer className={styles.reportCardFoot}>
          {mode === "improvement" ? (
            <>
              <span>Evidence first</span>
              <span>Plain English</span>
              <span>Tracked over time</span>
            </>
          ) : (
            <>
              <span>Plain English</span>
              <span>Ranked by impact</span>
              <span>Effort estimate on every item</span>
            </>
          )}
        </footer>
      </div>
    </section>
  );
}
