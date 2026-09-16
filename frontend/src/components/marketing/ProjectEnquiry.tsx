import { SectionNumber } from "@/components/SectionNumber";
import type { ProjectType } from "@/lib/api";
import type { ReactNode } from "react";
import { ProjectEnquiryPanel } from "./ProjectEnquiryPanel";

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
    <section className="shell py-section [scroll-margin-top:24px]" id={id}>
      <ProjectEnquiryPanel
        heading={
          <>
            {eyebrow && <SectionNumber>{eyebrow}</SectionNumber>}
            <h2 className="m-0 text-display-1 leading-[1.02] tracking-[-0.058em] text-text-secondary">
              Tell us your <span className="moving-colour-text">budget.</span>
            </h2>
            <p className="mt-m mb-xl max-w-[470px] text-step-0 leading-[1.7] text-text-muted">{lead}</p>
          </>
        }
        showProjectType={showProjectType}
        defaultProjectType={defaultProjectType}
      />
      {footer}
    </section>
  );
}
