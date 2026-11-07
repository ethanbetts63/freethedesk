import Image from 'next/image';

import { AUTHOR_NAME } from '@/lib/author';

import mark from '../_images/freethedesk-mark.png';

/**
 * Who wrote the report, beside whose software analysed it, at the foot of the cover and of the last page, as
 * render.credits writes them: the author as the site's guides carry theirs (the initial on a disc, the name, the
 * role), then freethedesk's mark and wordmark.
 */
export function Credits({ where }: { where: 'cover' | 'closing' }) {
  return (
    <footer className={where === 'cover' ? 'credits credits--cover' : 'credits credits--closing'}>
      <span className="credit credit--author">
        <span className="credit__avatar" aria-hidden="true">
          {AUTHOR_NAME[0]}
        </span>
        <span className="credit__text">
          <span className="credit__role">Written by</span>
          <span className="credit__name">{AUTHOR_NAME}</span>
          <span className="credit__sub">Lead Analyst, freethedesk</span>
        </span>
      </span>
      <span className="credit">
        <Image className="credit__mark" src={mark} alt="freethedesk" width={34} height={34} />
        <span className="credit__text">
          <span className="credit__role">Analytics by</span>
          <span className="credit__name credit__name--freethedesk">
            free<span className="wordmark__the">the</span>desk
            <span className="wordmark__dot">.</span>
          </span>
        </span>
      </span>
    </footer>
  );
}
