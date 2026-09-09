/**
 * Derives section eyebrow numbers ("01 / What you're buying") from document
 * order, so inserting or moving a section can't leave the numbering stale.
 */
export function numberSections<const T extends readonly string[]>(labels: T): Record<T[number], string> {
  const entries = labels.map((label, index) => [label, `${String(index + 1).padStart(2, "0")} / ${label}`]);
  return Object.fromEntries(entries) as Record<T[number], string>;
}
