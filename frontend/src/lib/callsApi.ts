import { apiFetch, handleResponse } from '@freetheplatform/web-security';

import { authedFetch, queryString, type Paginated } from './api';

/** Content type for a booked call, for the messages it sent. */
export const CALL_BOOKING_TYPE = 'seo.seocallbooking';

/** A booked free SEO review call, as the dashboard's diary and table show it. */
export interface CallBooking {
  id: number;
  /** UTC ISO; shown in Perth time. */
  starts_at: string;
  /** For example "Thursday 20 November, 10:30am (Perth time)". */
  when: string;
  name: string;
  website: string;
  /** The website's host, which names the business. */
  site: string;
  phone: string;
  email: string;
  notes: string;
  source: string;
  status: CallStatus;
  status_label: string;
  prospect: number | null;
  call_notes: string;
  created_at: string;
  updated_at: string;
}

export type CallStatus = 'booked' | 'done' | 'no_show' | 'cancelled';

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** When calls can be booked. Times are "HH:MM:SS" from the API. */
export type CallSettings = {
  booking_advance_notice: number;
  start_time: string;
  end_time: string;
  weeks_shown: number;
} & Record<Weekday, boolean>;

/** The open times for the free SEO review call: UTC ISO strings, soonest first. */
export interface CallSlots {
  timezone: string;
  minutes: number;
  slots: string[];
}

/** Unauthenticated; the booking form's times. */
export async function getCallSlots(): Promise<CallSlots> {
  return handleResponse(await apiFetch('/api/seo/calls/slots/'));
}

export async function getCalls(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<CallBooking>> {
  return handleResponse(await authedFetch(`/api/admin/seo/calls/${queryString(params)}`));
}

export async function getCall(id: number): Promise<CallBooking> {
  return handleResponse(await authedFetch(`/api/admin/seo/calls/${id}/`));
}

export async function updateCall(
  id: number,
  changes: Partial<Pick<CallBooking, 'status' | 'call_notes'>>,
): Promise<CallBooking> {
  return handleResponse(
    await authedFetch(`/api/admin/seo/calls/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}

export async function getCallSettings(): Promise<CallSettings> {
  return handleResponse(await authedFetch('/api/admin/seo/calls/settings/'));
}

/** Perth has no daylight saving: a fixed +08:00 turns a UTC instant into its Perth wall clock. */
const PERTH_OFFSET_MS = 8 * 60 * 60 * 1000;

/** The Perth calendar date of an instant, as YYYY-MM-DD. */
export function perthDate(iso: string): string {
  return new Date(new Date(iso).getTime() + PERTH_OFFSET_MS).toISOString().slice(0, 10);
}

/** The Perth time of day of an instant, as "10:30am". */
export function perthTime(iso: string): string {
  const local = new Date(new Date(iso).getTime() + PERTH_OFFSET_MS);
  const hours = local.getUTCHours();
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes}${hours < 12 ? 'am' : 'pm'}`;
}

/** Adds days to a YYYY-MM-DD date. */
export function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** The Monday on or before a YYYY-MM-DD date. */
export function mondayOf(date: string): string {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}

/** "Thu 20 Nov" for a YYYY-MM-DD date. */
export function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
