import Link from 'next/link';

import { secondaryLinkClassName } from '@/components/marketing/Hero';

/** Under "Found": the guide that lists each AI crawler and how to let it in. */
export function AiSearchGuideLink() {
  return (
    <Link className={secondaryLinkClassName} href="/how-to-show-up-in-ai-search">
      How to show up in AI search <span>→</span>
    </Link>
  );
}
