import type { ReactNode } from 'react';

/**
 * The numbered "what happens next" list on the portal and SEO-portal overview
 * screens.
 *
 * The last of `styles/portal.css`, which is deleted with this component. The
 * numbering stays a CSS counter rather than becoming an index in JSX: the
 * markup is an `<ol>` because the order is the meaning, and a counter keeps the
 * number out of the accessibility tree where a screen reader already announces
 * the list position.
 */
export function PortalSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="m-0 mb-m grid list-none gap-m p-0 [counter-reset:portal-step]">{children}</ol>
  );
}

export function PortalStep({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <li className="relative border-l-2 border-border-default pl-m [counter-increment:portal-step] before:absolute before:top-[-1px] before:left-[16px] before:text-label before:font-heavy before:tracking-label-tight before:text-text-subtle before:content-['0'_counter(portal-step)]">
      <strong className="block pt-m text-body">{title}</strong>
      <span className="mt-3xs block text-body-sm leading-[1.55] text-text-muted">{children}</span>
    </li>
  );
}
