/**
 * Marketing pages label their sections "01 / What you're buying". Numbering
 * those by hand drifts the moment a section is moved or inserted - licensing
 * shipped with 04 sitting after 07 - so each page declares its sections once,
 * in document order, and the numbers are derived from that order.
 */
export function numberSections<const T extends readonly string[]>(labels: T): Record<T[number], string> {
  const entries = labels.map((label, index) => [label, `${String(index + 1).padStart(2, "0")} / ${label}`]);
  return Object.fromEntries(entries) as Record<T[number], string>;
}
