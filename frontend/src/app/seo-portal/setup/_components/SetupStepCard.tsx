'use client';

import { StatusPill } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { cardClassName, cardLabelClassName } from '@/components/ui/Card';
import type { SeoSetupCheckResult, SeoSetupStep } from '@/lib/seoApi';
import { cn } from '@/lib/utils';
import { SETUP_GUIDE } from '../_lib/guide';
import { CopyAddress } from './CopyAddress';

const CHECK_MESSAGES: Record<SeoSetupCheckResult, string> = {
  confirmed: 'Connected.',
  not_found:
    "We can't see it yet. Check the address and role above, then try again — Google can take a minute to pass it on.",
  unavailable:
    "We couldn't check automatically just now. Mark it as done and we'll confirm it for you.",
};

/**
 * One tool on the setup page: what it gives the report, how to grant access,
 * and where it stands. The customer can only ever mark a step done; confirmed
 * comes from an access check or from us.
 */
export function SetupStepCard({
  step,
  busy,
  checkResult,
  onMark,
  onCheck,
}: {
  step: SeoSetupStep;
  busy: boolean;
  checkResult?: SeoSetupCheckResult;
  onMark: (done: boolean) => void;
  onCheck: () => void;
}) {
  const guide = SETUP_GUIDE[step.key];
  const confirmed = step.state === 'confirmed';

  return (
    <section
      className={cn(cardClassName, 'flex flex-col gap-m')}
      aria-labelledby={`step-${step.key}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-s">
        <h3 id={`step-${step.key}`} className="m-0 text-lead">
          {step.label}
        </h3>
        <div className="flex items-center gap-s">
          <span className={cn(cardLabelClassName, 'text-text-subtle')}>
            {step.required ? 'Required' : 'Optional'}
          </span>
          <StatusPill status={step.state} />
        </div>
      </div>

      <p className="m-0 text-body-sm text-text-muted">{guide.why}</p>

      {confirmed ? (
        <p className="m-0 text-body-sm">
          {step.detail ? (
            <>
              Connected to <strong>{step.detail}</strong>.
            </>
          ) : (
            "Confirmed. There's nothing more to do here."
          )}
        </p>
      ) : (
        <details className="group" open={step.required && step.state === 'not_started'}>
          <summary className="cursor-pointer text-body-sm font-heavy">How to set it up</summary>
          <div className="mt-s flex flex-col gap-s text-body-sm leading-relaxed">
            <p className="m-0">{guide.steps}</p>
            {guide.address && <CopyAddress address={guide.address} />}
            {guide.notSetUp && <p className="m-0 text-text-muted">{guide.notSetUp}</p>}
          </div>
        </details>
      )}

      {step.state === 'marked_done' && (
        <p className="m-0 text-body-sm text-text-muted">
          Thanks — we&apos;ll confirm the access has come through.
        </p>
      )}

      {checkResult && checkResult !== 'confirmed' && !confirmed && (
        <p className="m-0 text-body-sm" role="status">
          {CHECK_MESSAGES[checkResult]}
        </p>
      )}

      {!confirmed && (
        <div className="flex flex-wrap gap-s">
          {step.checkable && (
            <Button type="button" disabled={busy} onClick={onCheck}>
              {busy ? 'Checking…' : 'Check connection'}
            </Button>
          )}
          {step.state === 'marked_done' ? (
            <Button variant="quiet" type="button" disabled={busy} onClick={() => onMark(false)}>
              Undo
            </Button>
          ) : (
            <Button
              variant={step.checkable ? 'quiet' : 'secondary'}
              type="button"
              disabled={busy}
              onClick={() => onMark(true)}
            >
              Mark as done
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
