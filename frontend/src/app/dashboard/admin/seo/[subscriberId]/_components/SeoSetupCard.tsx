'use client';

import { useState } from 'react';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { cardClassName, cardTitleClassName, cardWideClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { updateSeoSetupStep } from '@/lib/adminApi';
import { formatDateTime } from '@/lib/formatting';
import type { SeoSetup, SeoSetupKey } from '@/lib/seoApi';
import { cn } from '@/lib/utils';

/**
 * The subscriber's setup checklist, for staff. A step the customer has marked
 * done needs someone to check the invite arrived and confirm it; confirming
 * Search Console is what starts reporting.
 */
export function SeoSetupCard({
  subscriberId,
  initial,
}: {
  subscriberId: number;
  initial: SeoSetup;
}) {
  const [setup, setSetup] = useState(initial);
  const [busyKey, setBusyKey] = useState<SeoSetupKey | null>(null);
  const [error, setError] = useState('');

  const update = async (key: SeoSetupKey, action: 'confirm' | 'reset') => {
    setBusyKey(key);
    setError('');
    try {
      setSetup(await updateSeoSetupStep(subscriberId, key, action));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The step could not be updated.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section className={cn(cardClassName, cardWideClassName)}>
      <h2 className={cardTitleClassName}>Setup</h2>
      <p className="m-0 mb-m text-body-sm text-text-muted">
        {setup.complete
          ? 'Search Console is confirmed, so reporting can start.'
          : 'Reporting starts once Search Console is confirmed.'}
      </p>
      {error && <Notice tone="danger">{error}</Notice>}
      <ul className="m-0 grid list-none gap-s p-0">
        {setup.steps.map((step) => (
          <li
            key={step.key}
            className="flex flex-wrap items-center justify-between gap-s border-t border-border-default pt-s"
          >
            <div className="grid gap-3xs">
              <strong className="text-body-sm">
                {step.label}
                {step.required && <span className="font-normal text-text-subtle"> · required</span>}
              </strong>
              <span className="text-label text-text-subtle">
                {step.state === 'confirmed'
                  ? `${step.detail || 'Confirmed by staff'} · ${formatDateTime(step.confirmed_at)}`
                  : step.state === 'marked_done'
                    ? `Customer marked done ${formatDateTime(step.marked_done_at)}`
                    : 'Not started'}
              </span>
            </div>
            <div className="flex items-center gap-s">
              <StatusPill status={step.state} />
              {step.state === 'confirmed' ? (
                <Button
                  variant="quiet"
                  type="button"
                  disabled={busyKey === step.key}
                  onClick={() => update(step.key, 'reset')}
                >
                  Reset
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  type="button"
                  disabled={busyKey === step.key}
                  onClick={() => update(step.key, 'confirm')}
                >
                  Confirm
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
