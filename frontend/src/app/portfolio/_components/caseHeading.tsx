import { Fragment } from 'react';

/** A heading written line by line, one line optionally in the accent. */
export type LineHeading = {
  lines: readonly string[];
  accentLine?: number;
};

export function HeadingLines({ heading }: { heading: LineHeading }) {
  return (
    <>
      {heading.lines.map((line, index) => (
        <Fragment key={line}>
          {index === heading.accentLine ? <span>{line}</span> : line}
          {index < heading.lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Every section below the hero opens with this heading. It was four selectors
 * sharing one rule in the case-study stylesheet, which is exactly the shape
 * that has to become a named constant rather than a descendant selector.
 */
export const caseHeadingClassName = 'm-0 text-hero leading-[0.96] tracking-[-0.067em]';

/** The muted lead paragraph that follows a section heading. */
export const caseLeadClassName = 'text-lead leading-[1.72] text-text-muted';

/**
 * A section's opening block: the number in a narrow first column, the heading
 * in a wide second. Three columns from xl, the last left empty as a rail.
 */
export const caseSectionHeadingClassName =
  'mb-2xl grid grid-cols-[minmax(0,1fr)] gap-ml lg:mb-3xl lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1.2fr)] lg:gap-x-3xl lg:gap-y-xl xl:grid-cols-[minmax(0,0.5fr)_minmax(0,1.2fr)_minmax(0,0.7fr)]';
