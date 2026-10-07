import { SectionNumber } from '@/components/SectionNumber';
import type { ProjectType } from '@/lib/api';
import type { ReactNode } from 'react';
import { ProjectEnquiryPanel } from './ProjectEnquiryPanel';

/* Server shell: only the budget chooser and the form need to hydrate. */
export function ProjectEnquiry({
  eyebrow = 'Start here',
  id = 'project-enquiry',
  showProjectType = true,
  defaultProjectType = 'both',
  footer,
  lead = 'You give us the constraint, and we tell you the most valuable thing we can build within it.',
  headingLevel = 'h2',
  title,
}: {
  eyebrow?: string | null;
  id?: string;
  showProjectType?: boolean;
  defaultProjectType?: ProjectType;
  footer?: ReactNode;
  lead?: string;
  /** `h1` where the form is the page, as on /contact. */
  headingLevel?: 'h1' | 'h2';
  /** Replaces "Tell us your budget." */
  title?: ReactNode;
}) {
  const Heading = headingLevel;
  return (
    <section className="site-shell py-section [scroll-margin-top:24px]" id={id}>
      <ProjectEnquiryPanel
        heading={
          <>
            {eyebrow && <SectionNumber>{eyebrow}</SectionNumber>}
            <Heading className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary">
              {title ?? (
                <>
                  Tell us your <span className="moving-colour-text">budget.</span>
                </>
              )}
            </Heading>
            <p className="mt-m mb-xl max-w-[470px] text-lead leading-[1.7] text-text-muted">
              {lead}
            </p>
          </>
        }
        showProjectType={showProjectType}
        defaultProjectType={defaultProjectType}
      />
      {footer}
    </section>
  );
}
