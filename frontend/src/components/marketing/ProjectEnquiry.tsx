import { SectionNumber } from "@/components/SectionNumber";
import { ProjectEnquiryPanel } from "./ProjectEnquiryPanel";
import styles from "./ProjectEnquiry.module.css";

/* Server shell: only the budget chooser and the form need to hydrate. */
export function ProjectEnquiry({
  eyebrow = "Start here",

  id = "project-enquiry",
}: {
  eyebrow?: string;
  id?: string;
}) {
  return (
    <section className={`shell ${styles.section}`} id={id}>
      <ProjectEnquiryPanel
        heading={
          <>
            <SectionNumber>{eyebrow}</SectionNumber>
            <h2>
              Tell us your <span className="moving-colour-text">budget.</span>
            </h2>
            <p className={styles.lead}>We&apos;ll tell you what we could build for it.</p>
          </>
        }
      />
    </section>
  );
}
