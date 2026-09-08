export const DEALER_STATES = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "ACT", "NT"] as const;

export type DealerState = (typeof DEALER_STATES)[number];
