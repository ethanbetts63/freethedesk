import 'server-only';

import { sanitizeHtml } from '@freetheplatform/web-security';
import { marked } from 'marked';

export async function renderMarkdown(source: string): Promise<string> {
  return sanitizeHtml(await marked(source, { gfm: true }));
}
