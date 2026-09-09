/** Numbered eyebrow opening a marketing section; `onDark` for dark surfaces. */
export function SectionNumber({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return <p className={`section-number${onDark ? " section-number-light" : ""}`}>{children}</p>;
}
