/**
 * The numbered eyebrow that opens a marketing section. One component so the
 * type, spacing and colour stay identical on every page; pass `onDark` for
 * sections sitting on a dark surface.
 */
export function SectionNumber({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return <p className={`section-number${onDark ? " section-number-light" : ""}`}>{children}</p>;
}
