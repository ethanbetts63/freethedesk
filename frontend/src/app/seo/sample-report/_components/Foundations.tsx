import { cn } from '@/lib/utils';

import { FOUNDATIONS, type Check, type CheckState } from '../_lib/report';
import { cardClass, display } from './ReportPrimitives';

/** Passes get a quiet pill and no box; a failure is solid, so passes never shout as loudly. */
const pillClass: Record<CheckState, string> = {
  pass: 'bg-surface-success text-text-success',
  warn: 'bg-surface-warning text-text-warning',
  fail: 'bg-fill-danger text-text-on-dark',
};

const boxClass: Record<CheckState, string> = {
  pass: '',
  warn: 'bg-surface-warning text-text-warning',
  fail: 'bg-surface-danger text-text-danger',
};

function CheckRow({ check }: { check: Check }) {
  return (
    <li className="grid grid-cols-[1.9rem_3.6rem_minmax(0,1fr)] items-baseline gap-x-s border-t border-border-subtle py-xs first:border-t-0">
      <span className="text-body-sm text-text-subtle tabular-nums">{check.id}</span>
      <span
        className={cn(
          'justify-self-start rounded-2xs px-xs py-4xs text-caption font-semibold tracking-label-tight uppercase',
          pillClass[check.state],
        )}
      >
        {check.state}
      </span>
      <span
        className={cn(
          'text-body leading-snug text-text-secondary',
          check.state === 'fail' && 'font-semibold',
        )}
      >
        {check.name}
      </span>
      {check.what && (
        <span
          className={cn(
            'col-start-3 mt-xs block rounded-xs px-s py-xs text-body-sm leading-normal',
            boxClass[check.state],
          )}
        >
          <strong className="font-strong">What.</strong> {check.what}
          <br />
          <strong className="font-strong">Why.</strong> {check.why}
        </span>
      )}
    </li>
  );
}

export function FoundationGroups() {
  return (
    <div className={cn(display, 'flex flex-col gap-s')}>
      {FOUNDATIONS.map((group) => (
        <div key={group.id} className={cardClass}>
          <h3 className="m-0 text-body leading-snug font-strong text-text-primary">
            {group.id} — {group.question}
          </h3>
          <p className="m-0 mt-4xs mb-s text-body-sm text-text-subtle">{group.meaning}</p>
          <ul className="m-0 list-none p-0">
            {group.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
