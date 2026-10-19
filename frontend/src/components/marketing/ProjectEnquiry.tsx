import { SectionNumber } from '@/components/SectionNumber';
import type { ProjectType } from '@/lib/api';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ProjectEnquiryPanel } from './ProjectEnquiryPanel';

/* Server shell: only the budget chooser and the form need to hydrate. */
export function ProjectEnquiry({
  eyebrow = 'Start here',
  id = 'project-enquiry',
  showProjectType = true,
  showSeo = false,
  defaultProjectType = 'both',
  footer,
  leadAction,
  lead = 'You give us the constraint, and we tell you the most valuable thing we can build within it.',
  headingLevel = 'h2',
  title,
  compact = false,
  spacing = 'standard',
}: {
  eyebrow?: string | null;
  id?: string;
  showProjectType?: boolean;
  /** Offers an SEO audit beside the build scopes, as on /contact. */
  showSeo?: boolean;
  defaultProjectType?: ProjectType;
  footer?: ReactNode;
  lead?: string;
  /** A control on its own line under the lead, such as /contact's call button. */
  leadAction?: ReactNode;
  /** `h1` where the form is the page, as on /contact. */
  headingLevel?: 'h1' | 'h2';
  /** Replaces "Tell us your budget." */
  title?: ReactNode;
  /**
   * Where the form is the page, as on /contact: the section starts just under
   * the breadcrumb rather than a full section's air below it, and the form
   * column sits level with the heading instead of centred beside it.
   */
  compact?: boolean;
  /** `joined` where the sections either side bring their own half, as on the homepage. */
  spacing?: 'standard' | 'joined';
}) {
  const Heading = headingLevel;
  return (
    <section
      className={cn(
        'site-shell',
        compact ? 'pt-xl pb-section' : spacing === 'joined' ? 'py-section-half' : 'py-section',
      )}
      id={id}
    >
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
            <p
              className={cn(
                'mt-m max-w-[470px] text-lead leading-[1.7] text-text-muted',
                leadAction ? 'mb-m' : 'mb-xl',
              )}
            >
              {lead}
            </p>
            {leadAction && <div className="mb-xl">{leadAction}</div>}
          </>
        }
        showProjectType={showProjectType}
        showSeo={showSeo}
        defaultProjectType={defaultProjectType}
        formClassName={compact ? 'lg:justify-start' : undefined}
      />
      {footer}
    </section>
  );
}
