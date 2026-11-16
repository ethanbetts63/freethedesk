import Link from 'next/link';

import { secondaryLinkClassName } from '@/components/marketing/Hero';

/** Under "Why not WordPress": the guide that sets out when staying on WordPress is the better call. */
export function WordPressCostLink() {
  return (
    <Link className={secondaryLinkClassName} href="/wordpress-website-cost-perth">
      What WordPress really costs <span>→</span>
    </Link>
  );
}
