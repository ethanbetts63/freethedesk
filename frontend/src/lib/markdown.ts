import "server-only";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

export async function renderMarkdown(source: string): Promise<string> {
  const html = await marked(source, { gfm: true });
  return DOMPurify.sanitize(markExternalLinks(html), {
    ADD_ATTR: ["target", "rel"],

    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
  });
}

function markExternalLinks(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="nofollow noopener noreferrer"',
  );
}
