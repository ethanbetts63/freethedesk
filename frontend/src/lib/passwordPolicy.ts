/**
 * The minimum the API enforces. Stated here so a field rejects a short
 * password before a round trip; the server is still what decides, because a
 * browser check is a convenience and never a control.
 *
 * A plain module on purpose: a constant exported from a 'use client' file
 * reaches a server action as a client reference, and a schema message built
 * from it printed the reference's stub instead of the number.
 */
export const MINIMUM_PASSWORD_LENGTH = 12;
