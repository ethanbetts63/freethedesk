import { ChecklistCard, LiveDot } from '@/components/visuals/ChecklistCard';

/** What the SEO fundamentals checks ask of a site, in the order a finding reads them. */
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
      eyebrow="SEO fundamentals"
      title="Checked against the research"
      items={questions.map((title) => ({ title, tag: 'Checked' }))}
      ariaLabel="The questions the SEO fundamentals checks answer"
    />
  );
}
