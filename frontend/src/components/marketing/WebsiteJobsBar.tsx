import { ProcessStepsBar } from '@/components/ProcessStepsBar';

const jobs = ['Get found', 'Get customers', 'Get time back'] as const;

/**
 * The dark bar under a service page's hero. Its `id` is where the floating CTA
 * appears, so every service page keeps one; the steps are the page's own.
 */
export function WebsiteJobsBar({
  id = 'website-hero-end',
  steps = jobs,
  ariaLabel = 'Three jobs your website should do',
}: {
  id?: string;
  steps?: readonly string[];
  ariaLabel?: string;
}) {
  return <ProcessStepsBar id={id} ariaLabel={ariaLabel} steps={steps} />;
}
