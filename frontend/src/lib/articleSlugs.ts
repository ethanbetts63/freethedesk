import fs from 'node:fs';
import path from 'node:path';

export const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

/** Not a guide in its own right — it documents how to publish one. */
const EXCLUDED = new Set(['overview.md']);

export function isExcludedArticle(filename: string): boolean {
  return EXCLUDED.has(filename);
}

export function articleFilenames(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((file) => file.endsWith('.md') && !EXCLUDED.has(file))
    .sort();
}

/**
 * Deliberately free of path-alias imports and of anything but `fs`/`path`, so
 * a Next config can read it at config-load time — before the alias resolution
 * the rest of the app relies on. `lib/articles` is the shared loader above it.
 */
export function getAllArticleSlugs(): string[] {
  return articleFilenames().map((filename) => filename.replace(/\.md$/, ''));
}
