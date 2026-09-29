/* Component registry: freetheplatform/frontend/registry/src/components/common/LinkOrButton.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';

/** Props when rendering a `<button>`; `href` is forbidden so the union discriminates on it. */
export type AsButton<Own> = Own &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: never };

/** Props when rendering a `Link`. */
export type AsLink<Own> = Own &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

export type LinkOrButtonProps<Own> = AsButton<Own> | AsLink<Own>;

type OwnProps = { children: ReactNode; classes: string };

/**
 * Chooses the element a control renders as, in order:
 *
 *  1. **Disabled always wins**: `disabled` on an anchor is ignored, so a disabled control is a `<button>` even with an href.
 *  2. **A bare `#fragment` is a scroll**, via `ScrollCtaButton`; `/path#fragment` is a real route and stays a `Link`.
 *  3. Otherwise `href` renders a `Link`, its absence a `<button>`.
 *
 * `className` is absent from the union: callers resolve their variants and pass `classes`, so no second class list wins late.
 */
export function LinkOrButton({ children, classes, ...rest }: LinkOrButtonProps<OwnProps>) {
  const href = 'href' in rest ? rest.href : undefined;
  const disabled = 'disabled' in rest ? rest.disabled : undefined;

  if (href !== undefined && !disabled) {
    const anchorProps = { ...rest } as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href?: string;
    };
    delete anchorProps.href;

    if (typeof href === 'string' && href.startsWith('#')) {
      return (
        <ScrollCtaButton
          targetId={href.slice(1)}
          classes={classes}
          ariaLabel={anchorProps['aria-label']}
        >
          {children}
        </ScrollCtaButton>
      );
    }

    return (
      <Link className={classes} href={href} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = { ...rest } as ButtonHTMLAttributes<HTMLButtonElement> & { href?: string };
  delete buttonProps.href;
  const { type = 'button' } = buttonProps;

  return (
    <button className={classes} {...buttonProps} type={type}>
      {children}
    </button>
  );
}

export default LinkOrButton;
