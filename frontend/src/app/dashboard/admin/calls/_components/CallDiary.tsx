'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { statusTone } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/Button';
import { panelClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import {
  addDays,
  dayLabel,
  getCalls,
  mondayOf,
  perthDate,
  perthTime,
  type CallBooking,
} from '@/lib/callsApi';
import { cn } from '@/lib/utils';

function thisMonday(): string {
  return mondayOf(perthDate(new Date().toISOString()));
}

/**
 * Two weeks of booked calls, Monday to Sunday in Perth time: calls are booked days ahead, so
 * this week alone is often empty. Each call is a tile in its day's column, coloured by its
 * status, and links to the call. Cancelled calls stay, faded, so a freed slot still
 * shows why it's free.
 */
export function CallDiary() {
  const [monday, setMonday] = useState(thisMonday);
  // The week the calls below belong to: while it differs from `monday`, the new week is loading.
  const [loaded, setLoaded] = useState<{ monday: string; calls: CallBooking[]; error: string }>({
    monday: '',
    calls: [],
    error: '',
  });

  useEffect(() => {
    let live = true;
    getCalls({ from: monday, to: addDays(monday, 14), ordering: 'starts_at', page_size: 200 })
      .then((page) => live && setLoaded({ monday, calls: page.results, error: '' }))
      .catch(
        (reason) =>
          live &&
          setLoaded({
            monday,
            calls: [],
            error: reason instanceof Error ? reason.message : 'The diary could not be loaded.',
          }),
      );
    return () => {
      live = false;
    };
  }, [monday]);

  const loading = loaded.monday !== monday;
  const { calls, error } = loaded;
  const weeks = [monday, addDays(monday, 7)].map((start) =>
    Array.from({ length: 7 }, (_, index) => addDays(start, index)),
  );
  const today = perthDate(new Date().toISOString());

  return (
    <section className={panelClassName} aria-label="Call diary">
      <div className="flex flex-wrap items-center justify-between gap-s">
        <h2 className="m-0 text-lead font-heavy text-text-primary">
          {dayLabel(monday)} to {dayLabel(addDays(monday, 13))}
          {loading && <span className="ml-s text-label text-text-subtle">Loading…</span>}
        </h2>
        <div className="flex gap-xs">
          <Button variant="quiet" onClick={() => setMonday(addDays(monday, -7))}>
            ← Previous
          </Button>
          <Button variant="quiet" onClick={() => setMonday(thisMonday())}>
            This week
          </Button>
          <Button variant="quiet" onClick={() => setMonday(addDays(monday, 7))}>
            Next →
          </Button>
        </div>
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
      {weeks.map((days) => (
        <ol key={days[0]} className="m-0 mt-m grid list-none grid-cols-1 gap-xs p-0 md:grid-cols-7">
          {days.map((day) => {
            const dayCalls = calls.filter((call) => perthDate(call.starts_at) === day);
            return (
              <li
                key={day}
                className={cn(
                  'min-h-[7.5rem] border border-border-subtle p-xs',
                  day === today && 'border-action-primary',
                )}
              >
                <p className="m-0 mb-xs text-label font-heavy text-text-muted">{dayLabel(day)}</p>
                <ul className="m-0 grid list-none gap-2xs p-0">
                  {dayCalls.map((call) => (
                    <li key={call.id} style={statusTone(call.status)}>
                      <Link
                        href={`/dashboard/admin/calls/${call.id}`}
                        className={cn(
                          'block border-l-4 border-l-[var(--status-tone)] bg-surface-tint p-2xs text-label no-underline',
                          call.status === 'cancelled' && 'opacity-50',
                        )}
                      >
                        <span className="block font-heavy text-text-primary">
                          {perthTime(call.starts_at)}
                        </span>
                        <span className="block truncate text-text-secondary">{call.site}</span>
                        <span className="block truncate text-text-subtle">{call.name}</span>
                      </Link>
                    </li>
                  ))}
                  {!loading && dayCalls.length === 0 && (
                    <li className="text-label text-text-subtle">—</li>
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      ))}
    </section>
  );
}
