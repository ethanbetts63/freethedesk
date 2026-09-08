import "server-only";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

/**
 * Markdown → HTML for everything rendered through `dangerouslySetInnerHTML`:
 * the guides and the legal documents.
 *
 * The source is repo-controlled today, so the sanitiser is defence in depth
 * rather than the primary control — but it is what keeps this safe the day the
 * content starts coming from anywhere else.
 */
export async function renderMarkdown(source: string): Promise<string> {
  const html = await marked(source, { gfm: true });
  return DOMPurify.sanitize(markExternalLinks(html), {
    ADD_ATTR: ["target", "rel"],
    // Anchors are the only place a scheme can hide; DOMPurify's default
    // allowlist (http, https, mailto, tel, …) rejects javascript: for us.
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
  });
}

/** Outbound links open in a new tab and never pass authority on. */
function markExternalLinks(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="nofollow noopener noreferrer"',
  );
}
