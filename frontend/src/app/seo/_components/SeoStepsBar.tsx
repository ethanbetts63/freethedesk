import { ProcessStepsBar } from '@/components/ProcessStepsBar';

export function SeoStepsBar() {
  return (
    <ProcessStepsBar
      id="seo-hero-end"
      ariaLabel="Our three-step SEO process"
      steps={['Analyse', 'Recommend', 'Experiment']}
    />
  );
}
