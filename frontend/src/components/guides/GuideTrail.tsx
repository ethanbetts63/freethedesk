/* Component registry: freetheplatform/frontend/registry/src/components/guides/GuideTrail.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';

export interface GuideTrailStep {
  /** Absent on the page itself, the last step. */
  href?: string;
  label: string;
}

/** The trail in a guide's hero, Home to the page, as plain links. */
export function GuideTrail({ trail }: { trail: readonly GuideTrailStep[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-xl text-body-sm text-text-muted">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-xs gap-y-3xs p-0">
        {trail.map((step, index) => (
          <li key={step.label} className="flex items-center gap-xs">
            {index > 0 && <span aria-hidden="true">/</span>}
            {step.href ? (
              <Link href={step.href} className="transition-colors hover:text-text-action">
                {step.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-text-primary">
                {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
