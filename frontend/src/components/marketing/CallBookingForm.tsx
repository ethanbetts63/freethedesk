'use client';

import { type FormEvent, startTransition, useActionState, useEffect, useState } from 'react';

import {
  choiceCardVariants,
  choiceInputClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { trackEvent } from '@/lib/analytics';
import { dayLabel, getCallSlots, perthDate, perthTime } from '@/lib/callsApi';
import { cn } from '@/lib/utils';

import { submitCallBooking, type CallBookingState } from './CallBookingForm.actions';

const initialState: CallBookingState = { status: 'idle' };

const groupLabelClassName = 'mb-xs block text-body font-control text-text-control';

/** The open times, grouped by Perth day. */
function byDay(slots: string[]): [string, string[]][] {
  const days = new Map<string, string[]>();
  for (const slot of slots) {
    const day = perthDate(slot);
    days.set(day, [...(days.get(day) ?? []), slot]);
  }
  return [...days.entries()];
}

/**
 * Book the free 30-minute SEO review: a day, a time, then name, website, phone, email and
 * optional notes. The times come from the API, so the settings and other people's bookings
 * decide what's offered. Dispatched from `onSubmit`, so a failed submit keeps what was typed.
 */
export function CallBookingForm({ source }: { source: string }) {
  const [state, dispatch, isPending] = useActionState(submitCallBooking, initialState);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [day, setDay] = useState('');
  const [slot, setSlot] = useState('');

  // The open times, on load and again when someone else took the picked time first. A time
  // that has gone is unpicked, so the button asks for another.
  useEffect(() => {
    if (state.status === 'success') {
      trackEvent('generate_lead', { lead_source: 'seo_call' });
      return;
    }
    if (state.status === 'error' && !state.slotTaken) return;
    let live = true;
    getCallSlots()
      .then((result) => {
        if (!live) return;
        setSlots(result.slots);
        setSlot((current) => (result.slots.includes(current) ? current : ''));
        setLoadFailed(false);
      })
      .catch(() => live && setLoadFailed(true));
    return () => {
      live = false;
    };
  }, [state]);

  const days = slots ? byDay(slots) : [];
  const shownDay = day || days[0]?.[0] || '';
  const dayTimes = days.find(([date]) => date === shownDay)?.[1] ?? [];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  if (state.status === 'success') {
    return (
      <div role="status" className="grid gap-s">
        <p className="m-0 text-title-sm tracking-[-0.04em] text-text-secondary">
          You&apos;re booked in.
        </p>
        <p className="m-0 text-body leading-relaxed text-text-muted">
          We&apos;ll ring you {state.label}. A confirmation is on its way to your email, with the
          call attached for your calendar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="starts_at" value={slot} />

      <fieldset className="m-0 mb-m border-0 p-0">
        <legend className={groupLabelClassName}>Pick a day</legend>
        {slots === null && !loadFailed && (
          <p className="m-0 text-body-sm text-text-muted">Loading the open times…</p>
        )}
        {loadFailed && (
          <p className="m-0 text-body-sm text-text-muted">
            The open times didn&apos;t load. Refresh the page, or ring us to book.
          </p>
        )}
        {slots !== null && days.length === 0 && (
          <p className="m-0 text-body-sm text-text-muted">
            No times are open right now. Ring us and we&apos;ll find one.
          </p>
        )}
        <div className="grid grid-cols-3 gap-xs sm:grid-cols-5">
          {days.map(([date]) => (
            <label key={date} className={choiceCardVariants({ selected: date === shownDay })}>
              <input
                className={choiceInputClassName}
                type="radio"
                name="call_day"
                value={date}
                checked={date === shownDay}
                onChange={() => {
                  setDay(date);
                  setSlot('');
                }}
              />
              {dayLabel(date)}
            </label>
          ))}
        </div>
      </fieldset>

      {dayTimes.length > 0 && (
        <fieldset className="m-0 mb-l border-0 p-0">
          <legend className={groupLabelClassName}>Pick a time (Perth time)</legend>
          <div className="grid grid-cols-3 gap-xs sm:grid-cols-4">
            {dayTimes.map((time) => (
              <label key={time} className={choiceCardVariants({ selected: time === slot })}>
                <input
                  className={choiceInputClassName}
                  type="radio"
                  name="call_time"
                  value={time}
                  checked={time === slot}
                  onChange={() => setSlot(time)}
                />
                {perthTime(time)}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Your name</span>
        <input
          className={fieldInputClassName}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sam Taylor"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Website</span>
        {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
        <input
          className={fieldInputClassName}
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="e.g. yoursite.com.au"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Phone (we&apos;ll ring you on this)</span>
        <input
          className={fieldInputClassName}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 0400 000 000"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Email (for the confirmation)</span>
        <input
          className={fieldInputClassName}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. email@example.com"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>
          Anything you&apos;d like us to look at? (optional)
        </span>
        <textarea className={fieldTextareaClassName} name="notes" rows={3} maxLength={2000} />
      </label>

      {state.status === 'error' && (
        <p className={formErrorClassName} role="alert">
          {state.error}
        </p>
      )}
      <MovingColourButton
        type="submit"
        className={cn(submitClassName)}
        direction="right"
        size="large"
        fullWidth
        disabled={isPending || !slot}
      >
        {isPending
          ? 'Booking…'
          : slot
            ? `Book ${dayLabel(perthDate(slot))}, ${perthTime(slot)}`
            : 'Pick a time to book'}
      </MovingColourButton>
    </form>
  );
}
