import { EXPERIMENTS, QUESTIONS, RECOMMENDATIONS, printOrder } from './report';

export type ContentsTopic = { anchor: string; label: string };
export type ContentsSection = {
  anchor: string;
  label: string;
  /** The section's two-digit number; the loop and the provenance have none. */
  num?: string;
  topics?: readonly ContentsTopic[];
};

/** A contents line longer than this, with no colon to cut at, is cut at its first comma (compose.SHORT_TITLE_CHARS). */
const SHORT_TITLE_CHARS = 56;

/**
 * A card's title as a contents line (compose.short_title): what comes before its colon; a long one with no colon,
 * what comes before its first comma; the whole otherwise. A contents line is a pointer, and the menu beside the
 * report has room for a few words each.
 */
export function shortTitle(title: string): string {
  const colon = title.indexOf(': ');
  if (colon >= 0) return title.slice(0, colon);
  if (title.length > SHORT_TITLE_CHARS) {
    const comma = title.indexOf(', ');
    if (comma >= 20) return title.slice(0, comma);
  }
  return title;
}

/**
 * The contents page, as compose builds it for an owner report: the loop (unnumbered), each section with what it
 * holds under it (the recommendations and the experiments by their short titles, the analysis questions by their
 * short labels), then where the data came from.
 */
export const CONTENTS: readonly ContentsSection[] = [
  { anchor: 'how-it-works', label: 'How this report works' },
  {
    anchor: 'section-01',
    num: '01',
    label: 'Recommendations',
    topics: printOrder(RECOMMENDATIONS).map((rec) => ({
      anchor: rec.id,
      label: shortTitle(rec.title),
    })),
  },
  {
    anchor: 'section-02',
    num: '02',
    label: 'What changed, and what it did',
    topics: EXPERIMENTS.map((exp) => ({ anchor: exp.id, label: shortTitle(exp.title) })),
  },
  {
    anchor: 'section-03',
    num: '03',
    label: 'What the data shows',
    topics: QUESTIONS.map((question) => ({ anchor: question.id, label: question.contents })),
  },
  { anchor: 'provenance', label: 'Where the data came from' },
];
