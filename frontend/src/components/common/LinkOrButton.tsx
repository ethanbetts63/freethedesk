/* Component registry: freetheplatform/frontend/registry/src/components/common/LinkOrButton.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';

/**
 * A control's own props when it renders a `<button>` — `href` is forbidden, so
 * the union below discriminates on its presence.
 */
export type AsButton<Own> = Own &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: never };

/** The same control's props when it renders a `Link`. */
export type AsLink<Own> = Own &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

export type LinkOrButtonProps<Own> = AsButton<Own> | AsLink<Own>;

type OwnProps = { children: ReactNode; classes: string };

/**
 * Chooses the element a control renders as. Nine button and CTA families
 * across the three sites each used to make this choice separately, and they
 * disagreed about two of the three cases.
 *
 * The three cases, in order:
 *
 *  1. **Disabled always wins.** A disabled link is not a thing the DOM has:
 *     `disabled` on an anchor is ignored and the destination stays one click
 *     away. So a disabled control renders as a `<button>` whether or not it was
 *     given an href — which is what makes a greyed-out action actually inert.
 *     Only allbikes' `PrimaryCta` used to implement this.
 *  2. **A bare `#fragment` is a scroll, not a navigation**, so it gets a button
 *     that drives the scroll itself. `/path#fragment` is a real route and still
 *     goes through `Link`.
 *  3. Otherwise: `href` renders a `Link`, its absence a `<button>`.
 *
 * `className` is deliberately absent from both halves of the union: callers
 * resolve their variants first and pass the result as `classes`, so there is no
 * second class list arriving late and winning by accident. Each family still
 * owns its own variants — a dashboard button, a pay bar and a marketing CTA are
 * different design decisions. What they share is only how the element is
 * chosen, which is what lives here.
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
          className={classes}
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
