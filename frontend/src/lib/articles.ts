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

interface FrontMatter {
  published?: string;
  updated?: string;
  title?: string;
  description?: string;
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseFrontMatter(source: string): { data: FrontMatter; body: string } {
  const match = FRONT_MATTER.exec(source);
  if (!match) return { data: {}, body: source };

  const data: FrontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key === "published" || key === "updated" || key === "title" || key === "description") {
      data[key] = value;
    }
  }
  return { data, body: source.slice(match[0].length) };
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

function readArticle(filename: string): { meta: ArticleMeta; body: string } {
  const filepath = path.join(ARTICLES_DIR, filename);
  const { data, body } = parseFrontMatter(fs.readFileSync(filepath, "utf8"));

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

export function getAllArticleMeta(): ArticleMeta[] {
  return articleFilenames()
    .map((filename) => readArticle(filename).meta)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function getAllArticleSlugs(): string[] {
  return articleFilenames().map(slugFromFilename);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const filename = `${slug}.md`;
  if (EXCLUDED_FILES.has(filename)) return null;
  if (!fs.existsSync(path.join(ARTICLES_DIR, filename))) return null;

  const { meta, body } = readArticle(filename);
  const articleBody = body.replace(/^#\s+.+(?:\r?\n)+/, "");

  return { ...meta, html: await renderMarkdown(articleBody) };
}
