import { SectionNumber } from "@/components/SectionNumber";
import type { ProjectType } from "@/lib/api";
import type { ReactNode } from "react";
import { ProjectEnquiryPanel } from "./ProjectEnquiryPanel";
import styles from "./ProjectEnquiry.module.css";

/* Server shell: only the budget chooser and the form need to hydrate. */
export function ProjectEnquiry({
  eyebrow = "Start here",
  id = "project-enquiry",
  showProjectType = true,
  defaultProjectType = "both",
  footer,
  lead = "You give us the constraint, and we tell you the most valuable thing we can build within it.",
}: {
  eyebrow?: string | null;
  id?: string;
  showProjectType?: boolean;
  defaultProjectType?: ProjectType;
  footer?: ReactNode;
  lead?: string;
}) {
  return (
    <section className={`shell ${styles.section}`} id={id}>
      <ProjectEnquiryPanel
        heading={
          <>
            {eyebrow && <SectionNumber>{eyebrow}</SectionNumber>}
            <h2>
              Tell us your <span className="moving-colour-text">budget.</span>
            </h2>
            <p className={styles.lead}>{lead}</p>
          </>
        }
        showProjectType={showProjectType}
        defaultProjectType={defaultProjectType}
      />
      {footer}
    </section>
  );
}
