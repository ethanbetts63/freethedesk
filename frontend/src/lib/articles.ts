/* Component registry: freetheplatform/frontend/registry/src/lib/articles.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import fs from 'node:fs';
import path from 'node:path';

import { AUTHOR_NAME } from '@/lib/author';
import { ARTICLES_DIR, articleFilenames, isExcludedArticle } from '@/lib/articleSlugs';
import { renderMarkdown } from '@/lib/markdown';

/**
 * Markdown articles, read from disk with their metadata in front matter.
 *
 * Front matter rather than the file's own timestamps, and this is the whole
 * reason the module is shared. A CI checkout gives every file the same
 * creation and modification time, so a loader that reads `stat.birthtime` or
 * `stat.mtime` dates every article to the deploy — which then goes out as
 * `datePublished` and `dateModified` in Article schema and as `lastModified`
 * in the sitemap, telling a crawler that every guide on the site was rewritten
 * this morning. One of the two apps was doing exactly that.
 *
 * A missing or malformed `published` throws rather than falling back, for the
 * same reason: a wrong date published into structured data is worse than a
 * failed build, because only one of the two is visible.
 *
 * Per-site: the directory and exclusions (`lib/articleSlugs`, deliberately
 * free of path aliases so a Next config can load it) and the markdown
 * renderer (`lib/markdown`).
 */

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedDate: string;
  lastModified: string;
}

export interface Article extends ArticleMeta {
  html: string;
}

interface FrontMatter {
  published?: string;
  updated?: string;
  title?: string;
  description?: string;
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseFrontMatter(source: string): { data: FrontMatter; body: string } {
  const match = FRONT_MATTER.exec(source);
  if (!match) return { data: {}, body: source };

  const data: FrontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (key === 'published' || key === 'updated' || key === 'title' || key === 'description') {
      data[key] = value;
    }
  }
  return { data, body: source.slice(match[0].length) };
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

/** The `#` heading, used when the front matter names no title. */
function extractTitle(markdown: string): string {
  return markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? 'Untitled';
}

/** The first real paragraph, used when the front matter names no description. */
function extractExcerpt(markdown: string): string {
  const line = markdown
    .split('\n')
    .map((entry) => entry.trim())
    .find(
      (entry) =>
        entry && !entry.startsWith('#') && !entry.startsWith('---') && !entry.startsWith('|'),
    );

  return (line ?? '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .slice(0, 180);
}

function readArticle(filename: string): { meta: ArticleMeta; body: string } {
  const filepath = path.join(ARTICLES_DIR, filename);
  const { data, body } = parseFrontMatter(fs.readFileSync(filepath, 'utf8'));

  if (!data.published || !ISO_DATE.test(data.published)) {
    throw new Error(`${filename}: front matter needs a "published: YYYY-MM-DD" date.`);
  }
  if (data.updated && !ISO_DATE.test(data.updated)) {
    throw new Error(`${filename}: "updated" must be a YYYY-MM-DD date.`);
  }

  return {
    meta: {
      slug: slugFromFilename(filename),
      title: data.title ?? extractTitle(body),
      excerpt: data.description ?? extractExcerpt(body),
      authorName: AUTHOR_NAME,
      publishedDate: data.published,
      lastModified: data.updated ?? data.published,
    },
    body,
  };
}

/** Newest first, which is the order every index that renders them wants. */
export function getAllArticleMeta(): ArticleMeta[] {
  return articleFilenames()
    .map((filename) => readArticle(filename).meta)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // A route param reaches this unvalidated, and it becomes a filename below.
  if (!SLUG.test(slug)) return null;

  const filename = `${slug}.md`;
  if (isExcludedArticle(filename)) return null;
  if (!fs.existsSync(path.join(ARTICLES_DIR, filename))) return null;

  const { meta, body } = readArticle(filename);
  // The title is the page's H1 already; rendering it again would repeat it.
  const articleBody = body.replace(/^#\s+.+(?:\r?\n)+/, '');

  return { ...meta, html: await renderMarkdown(articleBody) };
}

export { getAllArticleSlugs } from '@/lib/articleSlugs';
