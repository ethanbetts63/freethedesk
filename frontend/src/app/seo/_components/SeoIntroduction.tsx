import { Introduction } from '@/components/marketing/Introduction';

import type { SeoPageCopy } from '../_lib/pageCopy';

export function SeoIntroduction({ copy }: { copy: SeoPageCopy['introduction'] }) {
  return (
    <Introduction
      id="seo-overview"
      eyebrow="How it works"
      // The gaps above and below are halved (owner, 2026-11-16): the nudge above and the Analyse
      // section below each already leave half a section.
      spacing="tight"
      flushBottom
      title={copy.title}
      accentTitle={copy.accentTitle}
    >
      {copy.body}
    </Introduction>
  );
}
