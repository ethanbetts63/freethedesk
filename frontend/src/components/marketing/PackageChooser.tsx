'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { choiceInputClassName } from '@/components/forms/selectionFormClassNames';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

/** One card in the row, already priced and worded: a package, or a plan. */
export interface PackageCard<Code extends string> {
  code: Code;
  /** Small capitals above the name: the card's position or kind. */
  label: string;
  name: string;
  /** What the price buys, in small capitals over it. */
  priceLabel: string;
  price: string;
  priceNote: string;
  includes: readonly string[];
  recommended?: boolean;
}

/** Every card is the same width, so the row scrolls in whole cards. */
const cardClassName =
  'group flex w-[256px] shrink-0 cursor-pointer snap-start flex-col bg-surface-page p-l text-left transition-colors duration-200 has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[-3px] has-[:focus-visible]:outline-[color-mix(in_srgb,var(--action-primary)_25%,transparent)]';

/** Small capitals: the card's label, and what its price buys. */
const cardKickerClassName =
  'block text-caption font-heavy tracking-label text-text-subtle uppercase';

/**
 * The foot of every card, pushed to the bottom: where a card is chosen, and what fills
 * the height the form beside the row gives it.
 */
const cardFootClassName =
  'mt-auto flex items-center justify-center gap-2xs border py-s text-label font-heavy tracking-label uppercase transition-colors duration-200 [&>svg]:size-[16px]';

/** One card width and its gap, so an arrow press lands on the next card's edge. */
const CARD_STEP = 268;

/** A round button over one edge of the row, as scootershop's card carousels draw it. */
function ScrollArrow({
  direction,
  noun,
  onClick,
}: {
  direction: 'left' | 'right';
  noun: string;
  onClick: () => void;
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Scroll the ${noun}s ${direction}`}
      className={cn(
        'group absolute top-0 bottom-0 z-10 hidden w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 sm:flex',
        direction === 'left' ? 'left-0' : 'right-0',
      )}
    >
      <span
        className={cn(
          'flex size-[40px] items-center justify-center rounded-full border border-border-default bg-surface-page text-text-primary shadow-s transition-colors group-hover:border-surface-dark group-hover:bg-surface-dark group-hover:text-text-on-dark [&>svg]:size-[20px]',
          focusRingClassName,
        )}
      >
        <Icon aria-hidden="true" />
      </span>
    </button>
  );
}

/**
 * The left half of an order form: "Choose your {noun}." over a row of cards that fills the
 * column and scrolls sideways (arrows, swipe or trackpad; no scrollbar). The cards are radios;
 * the form beside them owns what is chosen.
 *
 * A single card is not a choice: the heading drops "Choose" and the card sits centred in the
 * moving border a recommended choice wears elsewhere.
 */
export function PackageChooser<Code extends string>({
  noun,
  cards,
  selectedCode,
  onChoose,
}: {
  /** "package", "plan": the heading's last word, and the radio group's name. */
  noun: string;
  cards: readonly PackageCard<Code>[];
  selectedCode: Code;
  onChoose: (code: Code) => void;
}) {
  const single = cards.length === 1;
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // An arrow shows only while there is more of the row that way.
  const updateArrows = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setCanScrollLeft(row.scrollLeft > 4);
    setCanScrollRight(row.scrollLeft + row.clientWidth < row.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    updateArrows();
    row.addEventListener('scroll', updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(row);
    return () => {
      row.removeEventListener('scroll', updateArrows);
      observer.disconnect();
    };
  }, [updateArrows]);

  const scrollRow = (direction: -1 | 1) =>
    rowRef.current?.scrollBy({ left: direction * CARD_STEP, behavior: 'smooth' });

  return (
    <>
      <h3 className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary">
        {single ? 'Your' : 'Choose your'} <span className="moving-colour-text">{noun}.</span>
      </h3>

      <div className="relative mt-xl flex flex-1">
        {canScrollLeft && (
          <ScrollArrow direction="left" noun={noun} onClick={() => scrollRow(-1)} />
        )}
        <div
          ref={rowRef}
          className={cn(
            'flex min-w-0 flex-1 snap-x snap-mandatory gap-s overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            single && 'justify-center',
          )}
          role="radiogroup"
          aria-label={noun.charAt(0).toUpperCase() + noun.slice(1)}
        >
          {cards.map((item) => {
            const isSelected = item.code === selectedCode;
            return (
              <label
                key={item.code}
                className={cn(
                  cardClassName,
                  single
                    ? 'moving-colour-border'
                    : isSelected
                      ? 'border border-action-primary'
                      : 'border border-border-default hover:border-border-strong-hover',
                )}
              >
                <input
                  className={choiceInputClassName}
                  type="radio"
                  name={`${noun}-choice`}
                  value={item.code}
                  checked={isSelected}
                  onChange={() => onChoose(item.code)}
                />
                <span className={cn(cardKickerClassName, 'flex justify-between gap-xs')}>
                  <span>{item.label}</span>
                  {item.recommended && <span className="moving-colour-text">Recommended</span>}
                </span>
                <strong className="mt-s block text-lead leading-tight tracking-[-0.025em] text-text-secondary">
                  {item.name}
                </strong>

                <span className={cn(cardKickerClassName, 'mt-l')}>{item.priceLabel}</span>
                <span className="mt-2xs block text-title leading-none font-heavy tracking-[-0.05em] text-text-primary">
                  {item.price}
                </span>
                <span className="mt-xs block text-body-sm text-text-muted">{item.priceNote}</span>

                <ul className="m-0 mt-l mb-xl grid list-none gap-xs border-t border-border-subtle p-0 pt-l">
                  {item.includes.map((line) => (
                    <li
                      key={line}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug text-text-muted"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-4xs size-[14px] text-action-primary"
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <span
                  className={cn(
                    cardFootClassName,
                    isSelected
                      ? 'border-action-primary bg-action-primary text-text-on-dark'
                      : 'border-border-strong text-text-action group-hover:border-action-primary',
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check aria-hidden="true" /> Selected
                    </>
                  ) : (
                    'Choose'
                  )}
                </span>
              </label>
            );
          })}
        </div>
        {canScrollRight && (
          <ScrollArrow direction="right" noun={noun} onClick={() => scrollRow(1)} />
        )}
      </div>
    </>
  );
}
