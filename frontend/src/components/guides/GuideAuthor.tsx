/* Component registry: freetheplatform/frontend/registry/src/components/guides/GuideAuthor.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { AUTHOR } from '@/lib/author';
import { GUIDE_AUTHOR } from '@/lib/guideSite';
import { cn } from '@/lib/utils';

/**
 * Who wrote a guide: the byline in its hero and the box at its end. The name is `lib/author`'s, so it matches the
 * Article schema's `author`. Per-site: the role under the name and the bio (`GUIDE_AUTHOR` in `lib/guideSite`); a
 * site with neither yet shows the name alone.
 */

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
          {GUIDE_AUTHOR.role && (
            <p className="m-0 text-body-sm text-text-muted">{GUIDE_AUTHOR.role}</p>
          )}
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
        {GUIDE_AUTHOR.role && (
          <p className="m-0 text-body-sm text-text-action">{GUIDE_AUTHOR.role}</p>
        )}
        {GUIDE_AUTHOR.bio && (
          <p className="m-0 mt-s text-body leading-relaxed text-text-secondary">
            {GUIDE_AUTHOR.bio}
          </p>
        )}
      </div>
    </aside>
  );
}
