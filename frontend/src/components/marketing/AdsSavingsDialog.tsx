'use client';

import { useId, useState } from 'react';

import { MovingColourButton } from '@/components/MovingColourButton';
import { formatMoney } from '@/lib/formatting';
import { scrollToId } from '@/lib/scrollToId';

import { onDarkFieldClassName } from './AiReadinessForm';
import { PromptDialog } from './PromptDialog';

/** The lift the result is quoted at: a believable target, not a promise. */
const LIFT = 0.25;

const TITLE_ID = 'ads-savings-title';

function positive(value: string): number | null {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/**
 * What a visitor's organic clicks would cost bought as Google Ads clicks, and
 * what a 25% lift would add. Worked out in the browser from two numbers the
 * visitor types: nothing is sent anywhere, so this is not a form and has no submit.
 */
export function AdsSavingsDialog({ onClose }: { onClose: () => void }) {
  const clicksId = useId();
  const costId = useId();
  const [clicks, setClicks] = useState('');
  const [cost, setCost] = useState('');

  const monthlyClicks = positive(clicks);
  const costPerClick = positive(cost);
  const currentValue =
    monthlyClicks !== null && costPerClick !== null ? monthlyClicks * costPerClick : null;

  const chooseReport = () => {
    onClose();
    // After the dialog unmounts and gives the page its scroll back.
    window.requestAnimationFrame(() => scrollToId('signup'));
  };

  const fields = [
    {
      id: clicksId,
      label: 'Organic clicks a month',
      hint: 'In Search Console',
      value: clicks,
      set: setClicks,
      inputMode: 'numeric' as const,
      step: '1',
      placeholder: '800',
    },
    {
      id: costId,
      label: 'Cost per click (A$)',
      hint: 'In Google Ads',
      value: cost,
      set: setCost,
      inputMode: 'decimal' as const,
      step: '0.01',
      placeholder: '4.50',
    },
  ];

  const results = [
    { label: 'Your clicks as ads', amount: currentValue },
    { label: '25% more adds', amount: currentValue === null ? null : currentValue * LIFT },
  ];

  return (
    <PromptDialog onClose={onClose} labelledBy={TITLE_ID}>
      <section className="relative overflow-hidden bg-surface-navy px-l pt-2xl pb-xl text-text-on-dark">
        <h2 id={TITLE_ID} className="m-0 text-title leading-[1.1] tracking-[-0.035em]">
          Ads savings <span className="moving-colour-text">calculator</span>
        </h2>
        <p className="mt-s mb-l text-body-sm text-text-on-dark-muted">
          What your search clicks would cost as Google Ads.
        </p>

        <div className="grid gap-m sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="mb-2xs block text-label font-heavy" htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={onDarkFieldClassName}
                type="number"
                inputMode={field.inputMode}
                min="0"
                step={field.step}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
              <p className="m-0 mt-2xs text-caption text-text-on-dark-muted">{field.hint}</p>
            </div>
          ))}
        </div>

        <dl
          className="m-0 mt-l grid grid-cols-2 gap-m border-t border-[color-mix(in_srgb,var(--accent-on-dark-soft)_32%,transparent)] pt-l"
          role="status"
        >
          {results.map((result) => (
            <div key={result.label}>
              <dt className="text-label font-heavy tracking-label-tight text-accent-on-dark uppercase">
                {result.label}
              </dt>
              <dd className="m-0 mt-2xs text-title-sm leading-none tracking-[-0.035em] sm:text-title">
                {result.amount === null ? (
                  '—'
                ) : (
                  <>
                    {formatMoney(result.amount, { cents: false })}
                    <span className="text-body-sm tracking-normal text-text-on-dark-muted">
                      /mo
                    </span>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>

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
