import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { renderMarkdown } from '@/lib/markdown';
import { gridPaperClassName } from '@/lib/gridSurface';
import { cn } from '@/lib/utils';

// Uncontrolled rich content: the markup comes from the legal source document,
// not from this component.
// eslint-disable-next-line no-restricted-imports -- approved exception
import styles from './legal.module.css';

export async function LegalDocument({ filename }: { filename: string }) {
  const source = await readFile(path.join(process.cwd(), 'content', 'legal', filename), 'utf8');
  const html = await renderMarkdown(source);

  return (
    <main className="relative min-h-screen bg-surface-tint px-s py-2xl text-surface-inverse sm:px-l sm:py-section-tall">
      <div className={gridPaperClassName} aria-hidden="true" />
      {/* The card's padding is one fluid value rather than a step: it has to
          hold a 900px measure comfortably from a phone to a desktop, which no
          single step on the space scale does. */}
      <article
        className={cn(
          'relative mx-auto max-w-[900px] border border-border-default bg-surface-page px-ml py-xl shadow-l sm:p-3xl',
          'prose-article',
          styles.legal,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
