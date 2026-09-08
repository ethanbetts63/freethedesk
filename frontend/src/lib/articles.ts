import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "./markdown";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const EXCLUDED_FILES = new Set(["overview.md"]);
const AUTHOR_NAME = "Ethan Betts-Ingram";

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

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "");
}

function extractTitle(markdown: string): string {
  return markdown.match(/^#\s+(.+)$/m)?.[1].trim() ?? "Untitled guide";
}

function extractExcerpt(markdown: string): string {
  const line = markdown
    .split("\n")
    .map((entry) => entry.trim())
    .find((entry) => entry && !entry.startsWith("#") && !entry.startsWith("---") && !entry.startsWith("|"));

  return (line ?? "")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .slice(0, 180);
}

function articleFilenames(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];

  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((filename) => filename.endsWith(".md") && !EXCLUDED_FILES.has(filename))
    .sort();
}

function buildArticleMeta(filename: string): ArticleMeta {
  const slug = slugFromFilename(filename);
  const filepath = path.join(ARTICLES_DIR, filename);
  const markdown = fs.readFileSync(filepath, "utf8");
  const stat = fs.statSync(filepath);

  return {
    slug,
    title: extractTitle(markdown),
    excerpt: extractExcerpt(markdown),
    authorName: AUTHOR_NAME,
    publishedDate: stat.birthtime.toISOString().split("T")[0],
    lastModified: stat.mtime.toISOString().split("T")[0],
  };
}

export function getAllArticleMeta(): ArticleMeta[] {
  return articleFilenames()
    .map(buildArticleMeta)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function getAllArticleSlugs(): string[] {
  return articleFilenames().map(slugFromFilename);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const filename = `${slug}.md`;
  if (EXCLUDED_FILES.has(filename)) return null;

  const filepath = path.join(ARTICLES_DIR, filename);
  if (!fs.existsSync(filepath)) return null;

  const markdown = fs.readFileSync(filepath, "utf8");
  const articleBody = markdown.replace(/^#\s+.+(?:\r?\n)+/, "");
  const html = await renderMarkdown(articleBody);

  return {
    ...buildArticleMeta(filename),
    html,
  };
}
