import type { ReactNode } from "react";

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

type SeoReportOverviewProps = {
  eyebrow: ReactNode;
  description: ReactNode;
  id?: string;
  className?: string;
};

export function SeoReportOverview({ eyebrow, description, id, className = "" }: SeoReportOverviewProps) {
  return (
    <section className={`shell ${styles.reportSection} ${className}`} id={id}>
      <div className={styles.reportCopy}>
        <p className={styles.label}>{eyebrow}</p>
        <h2>
          One document.
          <br />
          <span>Four sections.</span>
        </h2>
        <div className={styles.description}>{description}</div>
        <div className={styles.reportSequence} aria-hidden="true">
          <span>01</span>
          <i />
          <span>02</span>
          <i />
          <span>03</span>
          <i />
          <span>04</span>
        </div>
      </div>

      <div className={styles.reportCard}>
        <header className={styles.reportCardHead}>
          <span className={styles.reportDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>Quarterly SEO report</strong>
            <small>Your business · this quarter</small>
          </div>
          <span className={styles.reportBadge}>Action plan</span>
        </header>
        <ol className={styles.reportList}>
          {reportSections.map((section, index) => (
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
          <span>Plain English</span>
          <span>Ranked by impact</span>
          <span>Effort estimate on every item</span>
        </footer>
      </div>
    </section>
  );
}
