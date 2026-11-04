import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { ARTICLES_DIR } from '@/lib/articleSlugs';
import { getAllArticleMeta, type Article, type ArticleMeta } from '@/lib/articles';

/**
 * What the guide layout reads beyond the shared article loader: the heading for the hero, the sections for the
 * contents list, the summary box, the picture and the reading time. Kept here, not in `lib/articles`, because that
 * file is the registry's and these are this site's layout.
 */

/** A guide's picture is `public/images/guides/<slug>.webp`; a guide without one shows the plain card. */
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'guides');
const WORDS_A_MINUTE = 220;

export interface GuideSection {
  id: string;
  text: string;
}

export interface GuideCard extends ArticleMeta {
  image: string | null;
  readMinutes: number;
}

export interface GuideView extends GuideCard {
  heading: string;
  html: string;
  sections: GuideSection[];
  takeaways: string[];
}

export function guideImage(slug: string): string | null {
  return fs.existsSync(path.join(IMAGES_DIR, `${slug}.webp`))
    ? `/images/guides/${slug}.webp`
    : null;
}

function source(slug: string): string {
  return fs.readFileSync(path.join(ARTICLES_DIR, `${slug}.md`), 'utf8');
}

/** The front matter's `takeaways:` list, its `  - ` lines; the shared loader skips keys it does not know. */
function takeaways(markdown: string): string[] {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? '';
  const lines = front.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === 'takeaways:');
  if (start === -1) return [];
  const points: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const point = /^\s+-\s+(.+)$/.exec(line);
    if (!point) break;
    points.push(point[1].trim().replace(/^["']|["']$/g, ''));
  }
  return points;
}

function readMinutes(markdown: string): number {
  const words = markdown
    .replace(/^---[\s\S]*?---/, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_A_MINUTE));
}

const decode = (text: string) =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function guideCard(meta: ArticleMeta): GuideCard {
  return { ...meta, image: guideImage(meta.slug), readMinutes: readMinutes(source(meta.slug)) };
}

/** Every guide as a card, newest first. */
export function guideCards(): GuideCard[] {
  return getAllArticleMeta().map(guideCard);
}

export function guideView(article: Article): GuideView {
  const markdown = source(article.slug);

  // The body's `#` heading is the page's h1: the hero shows it, so it leaves the body.
  let heading = article.title;
  let html = article.html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>\s*/, (_, inner: string) => {
    heading = decode(inner);
    return '';
  });

  // Each section an anchor for the contents list. The text is already sanitised; the id is letters and dashes.
  const sections: GuideSection[] = [];
  const used = new Set<string>();
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = decode(inner);
    let id = anchor(text) || 'section';
    for (let n = 2; used.has(id); n += 1) id = `${anchor(text)}-${n}`;
    used.add(id);
    sections.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return {
    ...article,
    image: guideImage(article.slug),
    readMinutes: readMinutes(markdown),
    heading,
    html,
    sections,
    takeaways: takeaways(markdown),
  };
}
