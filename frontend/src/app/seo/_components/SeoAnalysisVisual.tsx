import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** The five groups the foundation checks are filed under, in the order a
    finding reads them. */
const questions = [
  'Is this one business?',
  'Can Google reach it?',
  'Can a machine read it?',
  'Does the click survive?',
  'Can it be judged by value?',
] as const;

export function SeoAnalysisVisual() {
  return (
    <ChecklistCard
      mark={<LiveDot />}
      eyebrow="Foundations"
      title="23 checks, every cycle"
      countLabel={`${questions.length} questions`}
      items={questions.map((title) => ({ title, tag: 'Checked' }))}
      ariaLabel="The five questions the foundation checks answer"
    />
  );
}
