/* Component registry: freetheplatform/frontend/registry/src/components/marketing/renderFaqAnswer.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import React from 'react';
import Link from 'next/link';
import type { FaqItem } from '@/types/FaqItem';

/**
 * Renders an FAQ answer, linking the first case-insensitive occurrence of each `links` phrase. Missing phrases are skipped,
 * so copy edits degrade to plain text. The answer string is untouched; it feeds `FAQPage` schema.
 */
export function renderFaqAnswer(faq: FaqItem): React.ReactNode {
  const { answer, links } = faq;
  if (!links?.length) return answer;

  // Find each phrase's range, skipping phrases that miss or overlap.
  const ranges: { start: number; end: number; href: string }[] = [];
  const lower = answer.toLowerCase();
  for (const { phrase, href } of links) {
    const start = lower.indexOf(phrase.toLowerCase());
    if (start === -1) continue;
    const end = start + phrase.length;
    if (ranges.some((r) => start < r.end && end > r.start)) continue;
    ranges.push({ start, end, href });
  }
  if (!ranges.length) return answer;
  ranges.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const { start, end, href } of ranges) {
    if (start > cursor) parts.push(answer.slice(cursor, start));
    parts.push(
      <Link
        key={`${href}-${start}`}
        href={href}
        className="text-text-action underline underline-offset-[3px] hover:opacity-70"
      >
        {answer.slice(start, end)}
      </Link>,
    );
    cursor = end;
  }
  if (cursor < answer.length) parts.push(answer.slice(cursor));
  return parts;
}
