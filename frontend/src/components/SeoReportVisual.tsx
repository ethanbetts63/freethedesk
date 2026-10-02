import { ReportCardVisual, type ReportCardItem } from './visuals/ReportCardVisual';

const trendIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M3 17l5.5-5.5 3.5 3.5L21 6"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 6h5v5"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const issueIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d="M12 3.5 22 20H2L12 3.5Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path d="M12 10v4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

const targetIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.9" />
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.9" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
);

const actionIcon = (
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
);

const reportSections: readonly ReportCardItem[] = [
  { title: 'Recommendations', description: 'Ranked by impact and cost.', icon: actionIcon },
  { title: 'Experiments', description: 'What each change earned.', icon: trendIcon },
  { title: 'Foundations', description: '23 checks: pass, warn or fail.', icon: issueIcon },
  {
    title: 'Trend analysis',
    description: 'Where your search traffic is heading.',
    icon: targetIcon,
  },
];

const improvementSections: readonly ReportCardItem[] = [
  {
    title: 'What the data says',
    description: 'A service page appears often in search but earns few clicks.',
    icon: trendIcon,
  },
  {
    title: 'What it means',
    description: 'Its search title is not matching what people want.',
    icon: targetIcon,
  },
  {
    title: 'What to improve next',
    description: 'Rewrite the title and compare the result next cycle.',
    icon: actionIcon,
  },
];

export function SeoReportVisual({ mode }: { mode: 'report' | 'improvement' }) {
  const improvement = mode === 'improvement';

  return (
    <ReportCardVisual
      title={improvement ? 'SEO findings' : 'Your SEO findings'}
      subtitle={improvement ? 'Real search data · this cycle' : 'Your business · this cycle'}
      badge={improvement ? 'Next actions' : 'Ranked'}
      items={improvement ? improvementSections : reportSections}
      footerItems={
        improvement
          ? ['Evidence first', 'Plain English', 'Tracked over time']
          : ['Plain English', 'Impact and cost on every item', 'Every claim sourced']
      }
      ariaLabel={improvement ? 'Example SEO findings' : 'Example SEO findings for one cycle'}
    />
  );
}
