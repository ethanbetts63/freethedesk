'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

/** A last card for anyone who would rather start from a budget than buy a package. */
export interface BudgetCard {
  name: string;
  summary: string;
  /** The enquiry form further down the page. */
  href: string;
  ctaLabel: string;
}

/** Every card is the same width, so the row scrolls in whole cards. */
const cardClassName =
  'flex w-[248px] shrink-0 snap-start flex-col border p-m text-left transition-[border-color,background-color] duration-200';

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
          'flex size-[40px] items-center justify-center rounded-full border border-border-default bg-surface-page text-text-primary shadow-l transition-colors group-hover:border-surface-dark group-hover:bg-surface-dark group-hover:text-text-on-dark [&>svg]:size-[20px]',
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
 * (arrows, swipe or trackpad; no scrollbar); right, exactly what the free enquiry asks and the Buy
 * now button, which carries the chosen package's price. Packages arrive
 * priced from the server, so nothing here computes money.
 */
export function PackageOrderPanel({
  packages,
  budgetCard,
}: {
  packages: readonly PurchasePackage[];
  budgetCard?: BudgetCard;
}) {
  const [selectedCode, setSelectedCode] = useState<PackageCode>(
    (packages.find((item) => item.recommended) ?? packages[0]).code,
  );
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
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
    rowRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });

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
            Choose your <span className="moving-colour-text">package.</span>
          </h3>

          <div className="relative mt-xl flex flex-1">
            {canScrollLeft && <ScrollArrow direction="left" onClick={() => scrollRow(-1)} />}
            <div
              ref={rowRef}
              className="flex min-w-0 flex-1 snap-x snap-mandatory gap-s overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                      'relative cursor-pointer has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color-mix(in_srgb,var(--action-primary)_25%,transparent)]',
                      isSelected
                        ? 'border-action-primary bg-surface-page'
                        : 'border-border-default bg-surface-tint hover:border-action-primary',
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
                    <span className="flex items-center justify-between gap-xs text-caption font-heavy tracking-label text-text-subtle uppercase">
                      <span>{item.label}</span>
                      {isSelected ? (
                        <span className="rounded-pill bg-action-primary px-xs py-4xs text-text-on-dark">
                          Selected
                        </span>
                      ) : (
                        item.recommended && <span className="moving-colour-text">Recommended</span>
                      )}
                    </span>
                    <strong className="mt-s block text-lead tracking-[-0.025em] text-text-secondary">
                      {item.name}
                    </strong>
                    <span className="mt-xs block text-title font-heavy tracking-[-0.05em] text-text-primary">
                      {money(item.price)}
                    </span>
                    <span className="block text-caption text-text-muted">{item.priceNote}</span>
                    <ul className="m-0 mt-m grid list-none gap-2xs p-0">
                      {item.includes.map((line) => (
                        <li
                          key={line}
                          className="grid grid-cols-[auto_minmax(0,1fr)] gap-xs text-body-sm leading-snug text-text-muted"
                        >
                          <span aria-hidden="true" className="font-heavy text-action-primary">
                            ✓
                          </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}

              {budgetCard && (
                <Link
                  href={budgetCard.href}
                  className={cn(
                    cardClassName,
                    'border-border-default bg-surface-tint hover:border-action-primary',
                    focusRingClassName,
                  )}
                >
                  <span className="text-caption font-heavy tracking-label text-text-subtle uppercase">
                    Or
                  </span>
                  <strong className="mt-s block text-lead tracking-[-0.025em] text-text-secondary">
                    {budgetCard.name}
                  </strong>
                  <span className="mt-xs block text-body-sm leading-snug text-text-muted">
                    {budgetCard.summary}
                  </span>
                  <span className="mt-auto pt-m text-body-sm font-strong text-text-action">
                    {budgetCard.ctaLabel} <span aria-hidden="true">↓</span>
                  </span>
                </Link>
              )}
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
            {isPending ? 'Sending…' : `Buy now · ${money(selected.price)}`}
          </MovingColourButton>
        </>
      )}
    </SelectionFormPanel>
  );
}
