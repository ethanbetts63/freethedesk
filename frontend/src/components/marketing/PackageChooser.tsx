'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  choiceInputClassName,
  selectionHeadingClassName,
} from '@/components/forms/selectionFormClassNames';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

/** One card in the row, already priced and worded: a package, or a plan. Only what tells cards apart. */
export interface PackageCard<Code extends string> {
  code: Code;
  name: string;
  /** What the price buys, in small capitals over it, where that tells the cards apart. */
  priceLabel?: string;
  price: string;
  /** Small capitals over the ticks, saying what they are: "Recommendations based on". */
  includesLabel?: string;
  includes: readonly string[];
}

/** Stacked full-width below `lg`; from `lg` every card is one width, so the row scrolls in whole cards. */
const cardClassName =
  'group flex cursor-pointer flex-col p-l text-left transition-colors duration-200 has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[-3px] has-[:focus-visible]:outline-[color-mix(in_srgb,var(--action-primary)_25%,transparent)] lg:w-[256px] lg:shrink-0 lg:snap-start';

/** Small capitals: what a card's price buys, and what its ticks are. */
const cardKickerClassName = 'block text-label font-heavy tracking-label uppercase';

/**
 * The foot of every card, pushed to the bottom: where a card is chosen, and what fills
 * the height the form beside the row gives it.
 */
const cardFootClassName =
  'mt-auto flex items-center justify-center gap-2xs border py-s text-label font-heavy tracking-label uppercase transition-colors duration-200 [&>svg]:size-[16px]';

/** One card width and its gap, so an arrow press lands on the next card's edge. */
const CARD_STEP = 268;

/**
 * A round button over one edge of the row, as scootershop's card carousels draw it. On every
 * width: a phone's swipe row gave no cue that the cheapest card sat three swipes away.
 */
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
        'group absolute top-0 bottom-0 z-10 flex w-[48px] cursor-pointer items-center justify-center border-0 bg-transparent p-0',
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
 * The left half of an order form: "Choose your {noun}." over the cards. Below `lg` they stack,
 * one under the other, the way a phone reads a list; from `lg` they are a row that fills the
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

  // The row opens on the card already chosen, so a recommended card past the first is not left
  // out of sight on a phone. Only the row scrolls, never the page.
  useEffect(() => {
    const row = rowRef.current;
    const card = row?.querySelector('input:checked')?.closest('label');
    if (!row || !card) return;
    const rowBox = row.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    if (cardBox.left < rowBox.left || cardBox.right > rowBox.right) {
      row.scrollLeft += cardBox.left - rowBox.left;
    }
    // Only where the row opens; a later choice is made with the card in view.
  }, []);

  const scrollRow = (direction: -1 | 1) =>
    rowRef.current?.scrollBy({ left: direction * CARD_STEP, behavior: 'smooth' });

  return (
    <>
      <h3 className={selectionHeadingClassName}>
        {single ? 'Your' : 'Choose your'} {noun}.
      </h3>

      <div className="relative mt-xl flex flex-1">
        {canScrollLeft && (
          <ScrollArrow direction="left" noun={noun} onClick={() => scrollRow(-1)} />
        )}
        <div
          ref={rowRef}
          className={cn(
            'grid min-w-0 flex-1 gap-s lg:flex lg:snap-x lg:snap-mandatory lg:overflow-x-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden',
            single && 'lg:justify-center',
          )}
          role="radiogroup"
          aria-label={noun.charAt(0).toUpperCase() + noun.slice(1)}
        >
          {cards.map((item) => {
            const isSelected = item.code === selectedCode;
            return (
              <label
                key={item.code}
                // The chosen card turns dark, as a chosen card does across the site's forms.
                className={cn(
                  cardClassName,
                  single
                    ? 'moving-colour-border'
                    : isSelected
                      ? 'border border-surface-dark bg-surface-dark'
                      : 'border border-border-default bg-surface-page hover:border-action-primary',
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
                <strong
                  className={cn(
                    'block text-lead leading-tight tracking-[-0.025em]',
                    isSelected ? 'text-text-on-dark' : 'text-text-secondary',
                  )}
                >
                  {item.name}
                </strong>

                {item.priceLabel && (
                  <span
                    className={cn(
                      cardKickerClassName,
                      'mt-l',
                      isSelected ? 'text-text-on-dark-muted' : 'text-text-subtle',
                    )}
                  >
                    {item.priceLabel}
                  </span>
                )}
                <span
                  className={cn(
                    'block text-title leading-none font-heavy tracking-[-0.05em]',
                    item.priceLabel ? 'mt-2xs' : 'mt-s',
                    isSelected ? 'text-text-on-dark' : 'text-text-primary',
                  )}
                >
                  {item.price}
                </span>

                <div
                  className={cn(
                    'mt-l mb-xl border-t pt-l',
                    isSelected ? 'border-border-on-dark' : 'border-border-subtle',
                  )}
                >
                  {item.includesLabel && (
                    <span
                      className={cn(
                        cardKickerClassName,
                        'mb-s',
                        isSelected ? 'text-accent-on-dark' : 'text-text-action',
                      )}
                    >
                      {item.includesLabel}
                    </span>
                  )}
                  <ul className="m-0 grid list-none gap-xs p-0">
                    {item.includes.map((line) => (
                      <li
                        key={line}
                        className={cn(
                          'grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug',
                          isSelected ? 'text-text-on-dark-muted' : 'text-text-muted',
                        )}
                      >
                        <Check
                          aria-hidden="true"
                          className={cn(
                            'mt-4xs size-[14px]',
                            isSelected ? 'text-accent-on-dark' : 'text-action-primary',
                          )}
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                <span
                  className={cn(
                    cardFootClassName,
                    isSelected
                      ? 'border-border-on-dark-strong text-text-on-dark'
                      : 'border-border-strong text-text-action group-hover:border-action-primary group-hover:bg-action-primary group-hover:text-text-on-dark',
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
