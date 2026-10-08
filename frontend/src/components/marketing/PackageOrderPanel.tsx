'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type FormEvent,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  choiceInputClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { CURRENCY, trackEvent } from '@/lib/analytics';
import { focusRingClassName } from '@/lib/controlState';
import { money, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';
import { cn } from '@/lib/utils';

import { submitPackageOrder, type PackageOrderState } from './PackageOrderPanel.actions';

const initialState: PackageOrderState = { status: 'idle' };

/** Every card is the same width, so the row scrolls in whole cards. */
const cardClassName =
  'group flex w-[256px] shrink-0 cursor-pointer snap-start flex-col bg-surface-page p-l text-left transition-colors duration-200 has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[-3px] has-[:focus-visible]:outline-[color-mix(in_srgb,var(--action-primary)_25%,transparent)]';

/** Small capitals: the package's position, and what its price buys. */
const cardKickerClassName =
  'block text-caption font-heavy tracking-label text-text-subtle uppercase';

/**
 * The foot of every card, pushed to the bottom: where a card is chosen, and what fills
 * the height the form beside the row gives it.
 */
const cardFootClassName =
  'mt-auto flex items-center justify-center gap-2xs border py-s text-label font-heavy tracking-label uppercase transition-colors duration-200 [&>svg]:size-[16px]';

/** How far the row fades out under an arrow, so a cut-off card reads as more to scroll to. */
const ROW_FADE: Record<'left' | 'right' | 'both', string> = {
  left: '[mask-image:linear-gradient(to_left,#000_calc(100%-64px),transparent)]',
  right: '[mask-image:linear-gradient(to_right,#000_calc(100%-64px),transparent)]',
  both: '[mask-image:linear-gradient(to_right,transparent,#000_64px,#000_calc(100%-64px),transparent)]',
};

/** A round button over one edge of the row, as scootershop's card carousels draw it. */
function ScrollArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Scroll the packages ${direction}`}
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
 * The order form. Left, the packages as a row of cards that fills the column and scrolls sideways
 * (arrows, swipe or trackpad; no scrollbar); right, exactly what the free enquiry asks and the
 * button, which carries the chosen package's price and reads Book discovery when discovery is all
 * the price buys. Packages arrive priced from the server, so nothing here computes money.
 *
 * A single package is not a choice: the heading drops "Choose" and the card sits centred in the
 * moving border a recommended choice wears elsewhere.
 */
export function PackageOrderPanel({ packages }: { packages: readonly PurchasePackage[] }) {
  const [selectedCode, setSelectedCode] = useState<PackageCode>(
    (packages.find((item) => item.recommended) ?? packages[0]).code,
  );
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
  const single = packages.length === 1;
  const [state, dispatch, isPending] = useActionState(submitPackageOrder, initialState);
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

  // A new state object per submission, so one event per order sent.
  useEffect(() => {
    if (state.status !== 'success') return;
    trackEvent('generate_lead', {
      lead_source: 'package_order',
      package: selected.code,
      value: selected.price,
      currency: CURRENCY,
    });
    // Only the submission should fire this, not a later change of package.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const choose = (code: PackageCode) => {
    setSelectedCode(code);
    trackEvent('select_plan', {
      item_category: code === 'automation_discovery' ? 'automation' : 'website',
      plan: code,
    });
  };

  /** One card width and its gap, so an arrow press lands on the next card's edge. */
  const scrollRow = (direction: -1 | 1) =>
    rowRef.current?.scrollBy({ left: direction * 268, behavior: 'smooth' });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('package', selected.code);
    startTransition(() => dispatch(formData));
  };

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <>
          <h3 className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary">
            {single ? 'Your' : 'Choose your'} <span className="moving-colour-text">package.</span>
          </h3>

          <div className="relative mt-xl flex flex-1">
            {canScrollLeft && <ScrollArrow direction="left" onClick={() => scrollRow(-1)} />}
            <div
              ref={rowRef}
              className={cn(
                'flex min-w-0 flex-1 snap-x snap-mandatory gap-s overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                single && 'justify-center',
                canScrollLeft && canScrollRight
                  ? ROW_FADE.both
                  : canScrollLeft
                    ? ROW_FADE.left
                    : canScrollRight && ROW_FADE.right,
              )}
              role="radiogroup"
              aria-label="Package"
            >
              {packages.map((item) => {
                const isSelected = item.code === selected.code;
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
                      name="package-choice"
                      value={item.code}
                      checked={isSelected}
                      onChange={() => choose(item.code)}
                    />
                    <span className={cn(cardKickerClassName, 'flex justify-between gap-xs')}>
                      <span>{item.label}</span>
                      {item.recommended && <span className="moving-colour-text">Recommended</span>}
                    </span>
                    <strong className="mt-s block text-lead leading-tight tracking-[-0.025em] text-text-secondary">
                      {item.name}
                    </strong>

                    <span className={cn(cardKickerClassName, 'mt-l')}>
                      {item.discovery ? 'Discovery, paid upfront' : 'Fixed price'}
                    </span>
                    <span className="mt-2xs block text-title leading-none font-heavy tracking-[-0.05em] text-text-primary">
                      {money(item.price)}
                    </span>
                    <span className="mt-xs block text-body-sm text-text-muted">
                      {item.priceNote}
                    </span>

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
            {canScrollRight && <ScrollArrow direction="right" onClick={() => scrollRow(1)} />}
          </div>
        </>
      }
    >
      <div className={formTitleClassName}>
        <h3 className={formTitleHeadingClassName}>
          Your <span className="moving-colour-text">details.</span>
        </h3>
      </div>

      {state.status === 'success' ? (
        <div role="status">
          <span
            aria-hidden="true"
            className="mb-m flex h-[34px] w-[34px] items-center justify-center rounded-full bg-action-primary text-text-on-dark"
          >
            ✓
          </span>
          <strong className="block text-lead tracking-[-0.03em]">Thanks, your order is in.</strong>
          <p className="mt-xs text-body leading-relaxed text-text-muted">
            We&apos;ll email you the invoice for the {selected.name} package and the next steps.
          </p>
        </div>
      ) : (
        <>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Email</span>
            <input
              className={fieldInputClassName}
              name="email"
              type="email"
              placeholder="e.g. email@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Phone</span>
            <input
              className={fieldInputClassName}
              name="phone"
              type="tel"
              placeholder="e.g. 0400 000 000"
              autoComplete="tel"
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Website (optional)</span>
            <input
              className={fieldInputClassName}
              name="website"
              type="text"
              inputMode="url"
              placeholder="Leave blank if you don't have one yet"
              autoComplete="url"
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Notes (optional)</span>
            <textarea
              className={fieldTextareaClassName}
              name="notes"
              rows={3}
              maxLength={2000}
              placeholder="e.g. We sell outdoor furniture and want our range online."
            />
          </label>
          {state.status === 'error' && (
            <p className={formErrorClassName} role="alert">
              {state.error}
            </p>
          )}
          <MovingColourButton
            type="submit"
            className={submitClassName}
            direction="right"
            size="large"
            fullWidth
            disabled={isPending}
          >
            {isPending
              ? 'Sending…'
              : `${selected.discovery ? 'Book discovery' : 'Buy now'} · ${money(selected.price)}`}
          </MovingColourButton>
        </>
      )}
    </SelectionFormPanel>
  );
}
