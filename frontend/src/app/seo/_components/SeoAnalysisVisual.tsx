import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** The five groups the foundation checks are filed under, in the order a
    finding reads them. */
const questions = [
  ['Is this one business?', 'Name, address and phone agree across site, profile and directories'],
  ['Can Google reach it?', 'Crawling, indexing, redirects and one agreed address per page'],
  ['Can a machine read it?', 'Structured data, headings and titles that fit in results'],
  ['Does the click survive?', 'Speed, mobile layout and a page that answers the search'],
  [
    'Can it be judged by value?',
    'Enquiries and sales recorded, so changes are measured by what earns',
  ],
] as const;

export function SeoAnalysisVisual() {
  return (
    <ChecklistCard
      mark={<LiveDot />}
      eyebrow="Foundations"
      title="23 checks, every cycle"
      countLabel={`${questions.length} questions`}
      items={questions.map(([title, description]) => ({ title, description, tag: 'Checked' }))}
      ariaLabel="The five questions the foundation checks answer"
    />
  );
}
