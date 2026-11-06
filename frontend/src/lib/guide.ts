/* Component registry: freetheplatform/frontend/registry/src/lib/guide.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ImageProps } from 'next/image';

/**
 * The guide layout's data (`components/guides`), wherever a site's guides come from: `lib/guideView` reads it from
 * markdown on disk; a site whose guides are components builds it beside them.
 */

/** A guide's picture: a path under `public/` or an imported asset. `null` shows the plain card. */
export type GuideImage = ImageProps['src'] | null;

/** One `h2` of a guide, for the contents list: its anchor and its text. */
export interface GuideSection {
  id: string;
  text: string;
}

/** What a card shows for a guide, on the index and in the related block. */
export interface GuideCard {
  href: string;
  title: string;
  excerpt: string;
  lastModified: string;
  readMinutes: number;
  image: GuideImage;
}

/** What the guide page shows beyond its body. Dates are `YYYY-MM-DD`. */
export interface GuidePage {
  /** The page's h1, in the hero. */
  heading: string;
  /** The standfirst under the hero. */
  excerpt: string;
  publishedDate: string;
  lastModified: string;
  readMinutes: number;
  image: GuideImage;
  sections: readonly GuideSection[];
  /** "The short answer"; none, and the box does not render. */
  takeaways: readonly string[];
}

/** A link in the related block. A guide among them is drawn as that guide's card. */
export interface GuideLink {
  href: string;
  label: string;
  /** One line on what the reader finds there. */
  line: string;
  /** Opens in a new tab: a page the reader looks at and comes back from. */
  newTab?: boolean;
  /** The card's picture for a page that is not a guide; none, and the card shows the site's icon. */
  image?: GuideImage;
}

export interface GuideRelated {
  title: string;
  links: readonly GuideLink[];
}

const WORDS_A_MINUTE = 220;

/** Reading time in whole minutes, never under one. */
export function readMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_A_MINUTE));
}

const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** A section's anchor: its text as letters and dashes, numbered when the guide already has it. Records it in `used`. */
export function sectionId(text: string, used: Set<string>): string {
  const base = anchor(text);
  let id = base || 'section';
  for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
  used.add(id);
  return id;
}
