'use client';

import { type FormEvent, useActionState, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { getCallSettings, WEEKDAYS, type CallSettings } from '@/lib/callsApi';
import { cn } from '@/lib/utils';

import { submitCallSettings, type CallSettingsState } from './CallSettings.actions';

const initialState: CallSettingsState = { status: 'idle' };

/** "09:00:00" from the API as "09:00" for a time input. */
const hhmm = (value: string) => value.slice(0, 5);

/**
 * When the free SEO review call can be booked. The form offers every half hour from the start
 * time to the end time, on the ticked days, never sooner than the notice. These hours are the
 * calls' own, not the business's opening hours.
 */
export default function CallSettingsPage() {
  const [loaded, setLoaded] = useState<CallSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [state, dispatch, saving] = useActionState(submitCallSettings, initialState);

  useEffect(() => {
    getCallSettings()
      .then(setLoaded)
      .catch((reason) =>
        setLoadError(
          reason instanceof Error ? reason.message : 'Call settings could not be loaded.',
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const settings = state.status === 'success' && state.settings ? state.settings : loaded;
  const error = state.status === 'error' ? state.error : loadError;
  const notice = state.status === 'success' && !saving ? 'Call settings have been saved.' : '';

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(new FormData(event.currentTarget));
  };

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading call settings…</p>
      </div>
    );
  if (!settings)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error || 'Call settings could not be loaded.'}</Notice>
      </div>
    );

  return (
    <div className={pageClassName}>
      <PageHeader kicker="Free SEO review" title="Call settings">
        <Button variant="secondary" href="/dashboard/admin/calls">
          Calls
        </Button>
      </PageHeader>

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      {/* Keyed on the saved settings so the fields reset to what was saved. */}
      <form key={JSON.stringify(settings)} className={detailGridClassName} onSubmit={onSubmit}>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Notice</h2>
          <p className="text-label text-text-subtle">
            How many days ahead you&apos;re always booked: the soonest anyone can book a call. It
            gives you time to write their prospect report first.
          </p>
          <div className={adminFormClassName}>
            <label className={adminFormLabelClassName}>
              Days booked out ahead
              <input
                className={adminFormControlClassName}
                name="booking_advance_notice"
                type="number"
                min="0"
                max="60"
                step="1"
                defaultValue={settings.booking_advance_notice}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              Weeks the booking form shows
              <input
                className={adminFormControlClassName}
                name="weeks_shown"
                type="number"
                min="1"
                max="12"
                step="1"
                defaultValue={settings.weeks_shown}
                required
              />
            </label>
          </div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Hours</h2>
          <p className="text-label text-text-subtle">
            Calls are offered every half hour from the first time, with the last one ending by the
            second, in Perth time.
          </p>
          <div className={adminFormClassName}>
            <label className={adminFormLabelClassName}>
              From
              <input
                className={adminFormControlClassName}
                name="start_time"
                type="time"
                step="1800"
                defaultValue={hhmm(settings.start_time)}
                required
              />
            </label>
            <label className={adminFormLabelClassName}>
              To
              <input
                className={adminFormControlClassName}
                name="end_time"
                type="time"
                step="1800"
                defaultValue={hhmm(settings.end_time)}
                required
              />
            </label>
          </div>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Days</h2>
          <p className="text-label text-text-subtle">The days calls can be booked on.</p>
          <div className="flex flex-wrap gap-l">
            {WEEKDAYS.map((day) => (
              <label key={day} className="flex items-center gap-xs text-body">
                <input name={day} type="checkbox" defaultChecked={settings[day]} />
                {day[0].toUpperCase() + day.slice(1)}
              </label>
            ))}
          </div>
        </section>

        <div className={cardWideClassName}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save call settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
