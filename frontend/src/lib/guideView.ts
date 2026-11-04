/* Component registry: freetheplatform/frontend/registry/src/lib/guideView.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  readMinutes,
  sectionId,
  type GuideCard,
  type GuidePage,
  type GuideSection,
} from '@/lib/guide';
import { GUIDE_IMAGES_DIR } from '@/lib/guideSite';
import { ARTICLES_DIR } from '@/lib/articleSlugs';
import { getAllArticleMeta, type Article, type ArticleMeta } from '@/lib/articles';

/**
 * What the guide layout reads from a markdown guide beyond `lib/articles`: the heading for the hero, the sections for
 * the contents list, the summary box, the picture and the reading time. A guide is served at `/<slug>`.
 *
 * Per-site: the picture directory (`GUIDE_IMAGES_DIR` in `lib/guideSite`, under `public/`). A guide's picture is
 * `<dir>/<slug>.webp`; a guide without one shows the plain card.
 */

export interface GuideView extends GuidePage {
  html: string;
}

export function guideImage(slug: string): string | null {
  return fs.existsSync(path.join(process.cwd(), 'public', GUIDE_IMAGES_DIR, `${slug}.webp`))
    ? `/${GUIDE_IMAGES_DIR}/${slug}.webp`
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

const bodyMinutes = (markdown: string) => readMinutes(markdown.replace(/^---[\s\S]*?---/, ''));

const decode = (text: string) =>
  text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

export function guideCard(meta: ArticleMeta): GuideCard {
  return {
    href: `/${meta.slug}`,
    title: meta.title,
    excerpt: meta.excerpt,
    lastModified: meta.lastModified,
    readMinutes: bodyMinutes(source(meta.slug)),
    image: guideImage(meta.slug),
  };
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
    const id = sectionId(text, used);
    sections.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  return {
    heading,
    excerpt: article.excerpt,
    publishedDate: article.publishedDate,
    lastModified: article.lastModified,
    readMinutes: bodyMinutes(markdown),
    image: guideImage(article.slug),
    html,
    sections,
    takeaways: takeaways(markdown),
  };
}
