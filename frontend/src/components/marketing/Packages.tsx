'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';
import { type ReactNode, useRef, useState } from 'react';

import { CtaButton } from '@/components/CtaButton';
import { MovingColourButton } from '@/components/MovingColourButton';
import { SectionHeader } from '@/components/SectionHeader';
import { type AnalyticsItem, trackSelectPlanOnce } from '@/lib/analytics';
import type { Plan } from '@/lib/plans';
import { cn } from '@/lib/utils';

/** Whole cards per row from `lg`, by how many there are: four would be too narrow in three. */
const gridColumns: Record<number, string> = {
  // A lone card sits in the right half of the split, at its natural width.
  1: '',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4',
};

/** One card's button: the highlighted one carries the moving colour, the others are dark. */
function ChooseButton<Code extends string>({
  plan,
  label,
  highlighted,
  onChoose,
}: {
  plan: Plan<Code>;
  label: string;
  highlighted: boolean;
  onChoose: (code: Code) => void;
}) {
  if (highlighted) {
    return (
      <MovingColourButton
        type="button"
        onClick={() => onChoose(plan.code)}
        direction="right"
        fullWidth
      >
        {label}
      </MovingColourButton>
    );
  }
  return (
    <CtaButton
      type="button"
      onClick={() => onChoose(plan.code)}
      appearance="dark"
      direction="right"
      fullWidth
    >
      {label}
    </CtaButton>
  );
}

/**
 * One thing to buy: its name, a line on what it is, the price, what it includes, a button. White
 * cards with a hairline border; the recommended one wears the moving border and says so (owner,
 * 2026-11-07, chosen over a filled card and a joined frame). A card on its own wears the same
 * colour without the label, as there is nothing to recommend it over (owner, 2026-11-26).
 */
function Card<Code extends string>({
  plan,
  title,
  kicker,
  chooseLabel,
  alone,
  onChoose,
}: {
  plan: Plan<Code>;
  title: string;
  kicker: string;
  chooseLabel: string;
  alone: boolean;
  onChoose: (code: Code) => void;
}) {
  const highlighted = alone || Boolean(plan.recommended);
  return (
    <li
      className={cn(
        'flex flex-col bg-surface-page p-xl',
        highlighted ? 'moving-colour-border' : 'border border-border-default',
      )}
    >
      {/* The label drops under the name when a card in a row of four has no room beside it. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-s gap-y-2xs">
        <h3 className="m-0 text-lead leading-tight font-heavy tracking-[-0.025em] text-text-primary">
          {title}
        </h3>
        {plan.recommended && (
          <span className="text-label font-heavy tracking-label text-text-action uppercase">
            Recommended
          </span>
        )}
      </div>
      <p className="mt-xs mb-0 min-h-[2lh] text-body-sm leading-snug text-text-muted">
        {plan.summary}
      </p>
      {/* The cadence keeps to one line, under the price when a narrow card has no room beside it. */}
      <p className="mt-l mb-0 flex flex-wrap items-baseline gap-x-xs gap-y-2xs">
        <span className="text-title leading-none font-heavy tracking-[-0.05em] text-text-primary">
          {plan.price}
        </span>
        <span className="text-body-sm whitespace-nowrap text-text-muted">{plan.cadence}</span>
      </p>
      <div className="mt-l mb-xl border-t border-border-subtle pt-l">
        <span className="mb-s block text-label font-heavy tracking-label text-text-action uppercase">
          {kicker}
        </span>
        <ul className="m-0 grid list-none gap-xs p-0">
          {plan.features.map((line) => (
            <li
              key={line}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug text-text-muted"
            >
              <Check aria-hidden="true" className="mt-4xs size-[14px] text-action-primary" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto">
        <ChooseButton
          plan={plan}
          label={chooseLabel}
          highlighted={highlighted}
          onChoose={onChoose}
        />
      </div>
    </li>
  );
}

/**
 * What a packages section remembers: the item chosen, and the dialog its cards open. The section
 * and its order dialog share it, so a choice made in the dialog's chips is the card's too.
 */
export function usePackageChoice<Code extends string>(
  plans: readonly Plan<Code>[],
  category: AnalyticsItem['item_category'],
) {
  const [selectedCode, setSelectedCode] = useState<Code>(
    (plans.find((plan) => plan.recommended) ?? plans[0]).code,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const choose = (code: Code) => {
    setSelectedCode(code);
    trackSelectPlanOnce(category, code);
  };
  const open = (code: Code) => {
    choose(code);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  };

  return { selectedCode, choose, open, dialogRef };
}

/**
 * Everything a page sells, as cards under a heading, each with a button that opens the order form
 * over the page (the dialog passed as `children`, an OrderDialog). The SEO audits and the website,
 * redesign and automation packages all sell this way, so a buyer picks first and gives their
 * details second. `id` is where the hero's button lands.
 *
 * Top padding only: the section after it opens with its own `pt-section`.
 */
export function PackagesSection<Code extends string>({
  id,
  endId,
  eyebrow,
  title,
  accentTitle,
  lead,
  wideHeader = false,
  plans,
  kicker,
  cardTitle = (plan) => plan.name,
  chooseLabel = (plan) => `Choose ${plan.name}`,
  note,
  picture,
  onChoose,
  children,
}: {
  id: string;
  /** A marker past the section for the page's floating button to watch (`showAfterId`). */
  endId: string;
  eyebrow: string;
  title: string;
  accentTitle: string;
  /** A line under the heading; left out where the heading says enough. */
  lead?: string;
  /** Lets the heading and lead run the width of the cards, where the default keeps them to a reading measure. */
  wideHeader?: boolean;
  plans: readonly Plan<Code>[];
  /** Small capitals over each card's ticks, saying what they are: "Recommendations based on". */
  kicker: string;
  /** The card's heading, where it says more than the button's name: "Plus SEO audit". */
  cardTitle?: (plan: Plan<Code>) => string;
  /** The card's button, where choosing is not buying: "Book a call". */
  chooseLabel?: (plan: Plan<Code>) => string;
  /** One line under the cards that holds for all of them: the audits' money-back guarantee. */
  note?: ReactNode;
  /** A guide illustration under the heading, as wide as it, a path under `public/`. */
  picture?: string;
  onChoose: (code: Code) => void;
  /** The order dialog the cards open; none where a card leads to the call-back form instead. */
  children?: ReactNode;
}) {
  // One card is no row to compare: on a large screen the heading, and any picture under it at the
  // heading's width, take the left and the card the rest of the row (owner, 2026-11-26).
  const alone = plans.length === 1;
  return (
    <section id={id} aria-label={eyebrow} className="bg-surface-page pt-section">
      <div
        className={cn(
          'site-shell',
          alone &&
            'lg:grid lg:grid-cols-[var(--container-measure-tight)_minmax(0,1fr)] lg:gap-x-2xl',
        )}
      >
        <div
          className={cn(
            'mb-xl',
            !wideHeader && 'max-w-measure-tight',
            alone && 'lg:mb-0 lg:flex lg:flex-col',
          )}
        >
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            accentTitle={accentTitle}
            size="display-sm"
          />
          {lead ? (
            <p className="mt-m mb-0 text-lead leading-relaxed text-text-muted">{lead}</p>
          ) : null}
          {/* Beside a lone card it fills the column under the heading, so its foot lines up with the
              card's; on a phone it keeps its 3:2 (owner, 2026-11-26). */}
          {picture ? (
            <div
              className={cn(
                'relative mt-l aspect-[3/2] w-full overflow-hidden rounded-lg border border-border-default',
                alone && 'lg:aspect-auto lg:min-h-0 lg:flex-1',
              )}
            >
              <Image
                src={picture}
                alt=""
                fill
                sizes="(min-width: 1024px) 576px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
        <ul
          className={cn(
            'm-0 grid list-none grid-cols-1 gap-m p-0',
            gridColumns[plans.length] ?? gridColumns[3],
          )}
        >
          {plans.map((plan) => (
            <Card
              key={plan.code}
              plan={plan}
              title={cardTitle(plan)}
              kicker={kicker}
              chooseLabel={chooseLabel(plan)}
              alone={alone}
              onChoose={onChoose}
            />
          ))}
        </ul>
        {note ? (
          <p className="mt-l mb-0 text-body leading-relaxed text-text-muted lg:col-span-2">
            {note}
          </p>
        ) : null}
      </div>
      {children}
      <div id={endId} aria-hidden="true" />
    </section>
  );
}
