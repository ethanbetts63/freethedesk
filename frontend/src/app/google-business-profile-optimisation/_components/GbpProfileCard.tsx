import { ReportCardVisual, type ReportCardItem } from '@/components/visuals/ReportCardVisual';

const icon = (path: string) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path
      d={path}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** What the job fills in, row for row with the card's ticks (`_lib/plan.ts`). */
const PROFILE_PARTS: readonly ReportCardItem[] = [
  {
    title: 'Categories',
    description: 'The most specific main one, then the rest.',
    icon: icon('M4 6h16M4 12h10M4 18h6'),
  },
  {
    title: 'Services and prices',
    description: 'One for everything you sell.',
    icon: icon('M5 4h14v16H5zM9 9h6M9 13h6M9 17h3'),
  },
  {
    title: 'Hours, area and attributes',
    description: 'Holidays and the suburbs you travel to.',
    icon: icon(
      'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    ),
  },
  {
    title: 'Photos and replies',
    description: 'Your work, and an answer to every review.',
    icon: icon('M4 7h4l2-2h4l2 2h4v12H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'),
  },
];

/** The /seo page's report card, drawn as the profile this job fills in. */
export function GbpProfileCard() {
  return (
    <ReportCardVisual
      title="Your Business Profile"
      subtitle="Filled in by us · paid once"
      badge="Complete"
      items={PROFILE_PARTS}
      footerItems={['Every fact from you', 'No keyword stuffing']}
      ariaLabel="The parts of a Business Profile the job fills in"
    />
  );
}
