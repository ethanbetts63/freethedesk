import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/** An unticked checkbox sends nothing; a ticked one sends "on". */
const day = z
  .literal('on')
  .optional()
  .transform((value) => value === 'on');

/**
 * Track B under the forms standard. Numbers and times arrive as strings; the API checks the
 * ranges, that the end comes at least 30 minutes after the start, and that a day is ticked.
 */
export const callSettingsSchema = z.object({
  booking_advance_notice: requiredString('token', 'Enter how many days ahead you are booked.'),
  weeks_shown: requiredString('token', 'Enter how many weeks the booking form shows.'),
  start_time: requiredString('token', 'Enter the time the first call starts.'),
  end_time: requiredString('token', 'Enter the time the last call ends by.'),
  monday: day,
  tuesday: day,
  wednesday: day,
  thursday: day,
  friday: day,
  saturday: day,
  sunday: day,
});

export type CallSettingsValues = z.infer<typeof callSettingsSchema>;
