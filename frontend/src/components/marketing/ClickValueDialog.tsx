'use client';

import { useId, useState } from 'react';

import { MovingColourButton } from '@/components/MovingColourButton';
import { formatMoney } from '@/lib/formatting';
import { scrollToId } from '@/lib/scrollToId';

import { onDarkFieldClassName } from './AiReadinessForm';
import { PromptDialog } from './PromptDialog';

/** The lift the result is quoted at: a believable target, not a promise. */
const LIFT = 0.25;

const TITLE_ID = 'click-value-title';

function positive(value: string): number | null {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/**
 * What a visitor's organic clicks would cost if they bought them as Google Ads
 * clicks, and what a 25% lift would be worth. Worked out in the browser from
 * two numbers the visitor types: nothing is sent anywhere, so this is not a
 * form and has no submit.
 */
export function ClickValueDialog({ onClose }: { onClose: () => void }) {
  const clicksId = useId();
  const costId = useId();
  const [clicks, setClicks] = useState('');
  const [cost, setCost] = useState('');

  const monthlyClicks = positive(clicks);
  const costPerClick = positive(cost);
  const currentValue =
    monthlyClicks !== null && costPerClick !== null ? monthlyClicks * costPerClick : null;
  const liftValue = currentValue === null ? null : currentValue * LIFT;

  const chooseReport = () => {
    onClose();
    // After the dialog unmounts and gives the page its scroll back.
    window.requestAnimationFrame(() => scrollToId('signup'));
  };

  return (
    <PromptDialog onClose={onClose} labelledBy={TITLE_ID}>
      <section className="relative overflow-hidden bg-surface-navy px-l pt-2xl pb-xl text-text-on-dark">
        <p className="m-0 mb-s text-label font-black tracking-label-tight text-accent-on-dark uppercase">
          Organic vs Google Ads
        </p>
        <h2 id={TITLE_ID} className="m-0 text-title leading-[1.1] tracking-[-0.035em]">
          What are your clicks <span className="moving-colour-text">worth?</span>
        </h2>
        <p className="mt-s mb-l text-body-sm leading-relaxed text-text-on-dark-muted">
          Every click you earn in search is one you don&apos;t pay Google for. Enter two numbers to
          see what 25% more search traffic is worth to your business.
        </p>

        <div className="grid gap-m">
          <div>
            <label className="mb-2xs block text-label font-heavy" htmlFor={clicksId}>
              Organic clicks a month
            </label>
            <input
              id={clicksId}
              className={onDarkFieldClassName}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="e.g. 800"
              value={clicks}
              onChange={(event) => setClicks(event.target.value)}
            />
            <p className="m-0 mt-2xs text-caption text-text-on-dark-muted">
              Search Console → Performance → Total clicks.
            </p>
          </div>
          <div>
            <label className="mb-2xs block text-label font-heavy" htmlFor={costId}>
              Average cost per click (A$)
            </label>
            <input
              id={costId}
              className={onDarkFieldClassName}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="e.g. 4.50"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
            <p className="m-0 mt-2xs text-caption text-text-on-dark-muted">
              From your Google Ads account, or Keyword Planner for your main search.
            </p>
          </div>
        </div>

        <div
          className="mt-l border-t border-[color-mix(in_srgb,var(--accent-on-dark-soft)_32%,transparent)] pt-l"
          role="status"
        >
          {liftValue === null || currentValue === null ? (
            <p className="m-0 text-body-sm text-text-on-dark-muted">
              Enter both numbers to see the value.
            </p>
          ) : (
            <>
              <p className="m-0 text-label font-heavy tracking-label-tight text-accent-on-dark uppercase">
                A 25% lift is worth
              </p>
              <p className="m-0 mt-2xs text-title leading-none tracking-[-0.035em]">
                {formatMoney(liftValue, { cents: false })}
                <span className="text-body-sm tracking-normal text-text-on-dark-muted">
                  {' '}
                  a month
                </span>
              </p>
              <p className="m-0 mt-s text-body-sm leading-relaxed text-text-on-dark-muted">
                That&apos;s {formatMoney(liftValue * 12, { cents: false })} a year in ad spend you
                wouldn&apos;t need. Your current organic clicks would already cost{' '}
                {formatMoney(currentValue, { cents: false })} a month as ads.
              </p>
            </>
          )}
        </div>

        <MovingColourButton
          className="mt-l justify-center"
          fullWidth
          direction="down"
          size="compact"
          onClick={chooseReport}
        >
          Find my missing clicks
        </MovingColourButton>
      </section>
    </PromptDialog>
  );
}
