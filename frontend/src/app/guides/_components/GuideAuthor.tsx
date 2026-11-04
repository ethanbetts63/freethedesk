import { AUTHOR } from '@/lib/author';
import { cn } from '@/lib/utils';

/** Under the byline, as the email signature signs it. */
const ROLE = 'Lead Analyst, freethedesk';

/** Until there is a photo (owner, 2026-11-04): the initial on a disc, as a Google profile without a picture shows. */
function Avatar({ size }: { size: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-circle bg-action-primary font-heavy text-text-on-dark',
        size === 'sm' ? 'size-[44px] text-lead' : 'size-[64px] text-title-sm',
      )}
    >
      {AUTHOR.givenName.charAt(0)}
    </span>
  );
}

/** The byline in the guide's hero. */
export function GuideByline() {
  return (
    <div className="mt-xl">
      <p className="m-0 text-label font-heavy tracking-label text-text-subtle uppercase">
        Written by
      </p>
      <div className="mt-s flex items-center gap-s">
        <Avatar size="sm" />
        <div>
          <p className="m-0 text-body font-strong text-text-primary">{AUTHOR.name}</p>
          <p className="m-0 text-body-sm text-text-muted">{ROLE}</p>
        </div>
      </div>
    </div>
  );
}

/** Who wrote it, at the end of the guide. */
export function GuideAuthorBio() {
  return (
    <aside
      aria-label="About the author"
      className="mt-2xl flex flex-col gap-l rounded-md bg-surface-tint p-l sm:flex-row sm:p-xl"
    >
      <Avatar size="md" />
      <div>
        <p className="m-0 text-label font-heavy tracking-label text-text-subtle uppercase">
          Written by
        </p>
        <p className="m-0 mt-2xs text-lead font-strong text-text-primary">{AUTHOR.name}</p>
        <p className="m-0 text-body-sm text-text-action">{ROLE}</p>
        <p className="m-0 mt-s text-body leading-relaxed text-text-secondary">
          {AUTHOR.givenName} writes freethedesk&apos;s SEO audits and builds its websites in Perth,
          including Scooter Shop&apos;s, the dealership site in the case study. He writes these
          guides from what the audits find on real Perth businesses&apos; sites.
        </p>
      </div>
    </aside>
  );
}
