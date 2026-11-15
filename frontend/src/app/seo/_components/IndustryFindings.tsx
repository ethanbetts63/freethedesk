import { SectionHeader } from '@/components/SectionHeader';

import { FINDINGS, type Industry } from '../_lib/industries';

/**
 * What the group's prospect reports found most often: each fault, how many of the reports had it,
 * and what it means. Numbered tiles, as the contact page's steps were.
 */
export function IndustryFindings({ industry, eyebrow }: { industry: Industry; eyebrow: string }) {
  return (
    <section className="bg-surface-tint py-section" aria-labelledby="findings-title">
      <div className="site-shell">
        <SectionHeader
          eyebrow={eyebrow}
          title={`What holds Perth ${industry.audience} back`}
          accentTitle="on Google."
          titleId="findings-title"
        />
        <p className="mt-m max-w-[46rem] text-lead leading-relaxed text-text-muted">
          We&apos;ve written SEO reports for {industry.reports} Perth businesses in this line of
          work: {industry.kinds}. These are the faults we found most often, and every audit checks
          yours for them.
        </p>
        <ol className="m-0 mt-2xl grid list-none grid-cols-1 gap-4xs p-0 md:grid-cols-2 lg:grid-cols-3">
          {industry.findings.map((finding) => (
            <li key={finding.id} className="bg-surface-page p-xl">
              <span className="mb-m block text-label font-black tracking-label-wide text-action-primary">
                {finding.count} of {industry.reports} reports
              </span>
              <h3 className="m-0 mb-xs text-lead tracking-[-0.025em] text-text-secondary">
                {FINDINGS[finding.id].title}
              </h3>
              <p className="m-0 text-body leading-relaxed text-text-muted">
                {FINDINGS[finding.id].body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
