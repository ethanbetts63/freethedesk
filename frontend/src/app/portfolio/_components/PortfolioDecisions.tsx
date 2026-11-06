import Image from 'next/image';

import { SectionNumber } from '@/components/SectionNumber';
import { cn } from '@/lib/utils';

import type { PortfolioImage } from './BrowserFrame';
import {
  HeadingLines,
  caseHeadingClassName,
  caseLeadClassName,
  caseSectionHeadingClassName,
  type LineHeading,
} from './caseHeading';

/**
 * One decision, told the way the reports' experiment cards tell theirs: what
 * the data showed, what changed, what happened, and the fundamental it rests
 * on. A card carries either a picture or a few figures beside the words.
 */
export type Decision = {
  label: string;
  title: string;
  showed: string;
  changed: string;
  happened: string;
  /** The line of the fundamentals catalogue the decision rests on. */
  restsOn: string;
  figures?: readonly { value: string; label: string }[];
  image?: PortfolioImage;
};

export type DecisionsSection = {
  eyebrow: string;
  title: LineHeading;
  description?: string;
  items: readonly Decision[];
};

const ROWS = [
  ['showed', 'What the data showed'],
  ['changed', 'What changed'],
  ['happened', 'What happened'],
] as const;

function DecisionCard({ item, number }: { item: Decision; number: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)] gap-xl rounded-l border border-border-default bg-surface-page p-ml sm:p-xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-2xl">
      <div>
        <small className="mb-s block text-label font-black tracking-label text-text-action uppercase">
          {number} · {item.label}
        </small>
        <h3 className="m-0 text-display tracking-[-0.06em]">{item.title}</h3>
        <dl className="m-0 mt-l">
          {ROWS.map(([key, heading]) => (
            <div
              className="grid gap-2xs border-t border-border-default py-m sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-l"
              key={key}
            >
              <dt className="text-label font-heavy tracking-label text-text-muted uppercase">
                {heading}
              </dt>
              <dd className="m-0 text-body leading-normal text-text-secondary">{item[key]}</dd>
            </div>
          ))}
        </dl>
        <p className="m-0 border-t border-border-default pt-m text-body-sm leading-normal text-text-muted">
          <b className="font-heavy text-text-primary">Rests on:</b> {item.restsOn}
        </p>
      </div>
      <div className="flex flex-col justify-center">
        {item.image && (
          <Image
            className={cn(
              'h-auto w-full rounded-md border border-border-default',
              item.image.className,
            )}
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        )}
        {item.figures && (
          // The reports' readings: the figure heavy and black under a black
          // rule, the label in the accent beneath.
          <ul className="m-0 grid list-none grid-cols-2 gap-l border-t-2 border-text-primary p-0 pt-m lg:grid-cols-1 lg:gap-m">
            {item.figures.map((figure) => (
              <li key={figure.label}>
                <strong className="block text-display font-heavy tracking-[-0.04em] text-text-primary tabular-nums">
                  {figure.value}
                </strong>
                <span className="mt-2xs block text-label font-heavy tracking-label text-text-action uppercase">
                  {figure.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function PortfolioDecisions({ config }: { config: DecisionsSection }) {
  return (
    <section className="bg-surface-tint py-section" id="decisions">
      <div className="site-shell">
        <div className={caseSectionHeadingClassName}>
          <SectionNumber>{config.eyebrow}</SectionNumber>
          <div className="lg:col-start-2">
            <h2 className={caseHeadingClassName}>
              <HeadingLines heading={config.title} />
            </h2>
            {config.description && (
              <p className={cn(caseLeadClassName, 'mt-xl mb-0 max-w-[560px]')}>
                {config.description}
              </p>
            )}
          </div>
        </div>
        <ol className="m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-l p-0">
          {config.items.map((item, index) => (
            <DecisionCard
              item={item}
              number={String(index + 1).padStart(2, '0')}
              key={item.label}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
