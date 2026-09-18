import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import {
  disabledBusyClassName,
  disabledUnavailableClassName,
  focusRingClassName,
} from '@/lib/controlState';
import { cn } from '@/lib/utils';

/**
 * The button family shared by the dashboard, both portals and the login page.
 *
 * Replaces the `.admin-primary-button` / `.admin-secondary-button` /
 * `.admin-inline-button` classes that lived in `admin.css`. Callers pick a
 * typed variant rather than restyling a control: there is no palette in the
 * prop names, and the disabled treatment travels with the variant that owns it
 * (primary reads as "working", secondary as "unavailable" - the two states the
 * original CSS distinguished with `cursor: wait` and `cursor: default`). Both
 * are now the shared treatments in `lib/controlState.ts`; the unavailable one
 * says `cursor: not-allowed` rather than `default`, which is the same meaning
 * stated rather than implied.
 */
const adminButtonVariants = cva(focusRingClassName, {
  variants: {
    variant: {
      primary: [
        'inline-flex cursor-pointer items-center justify-center rounded-xs border-0',
        'bg-surface-dark px-m py-s text-body-sm font-heavy text-text-on-dark',
        'hover:bg-surface-dark-soft',
        disabledBusyClassName,
      ],
      secondary: [
        'inline-flex cursor-pointer items-center justify-center rounded-xs',
        'border border-border-strong bg-surface-page px-m py-s text-body-sm font-heavy text-text-primary',
        'hover:border-border-strong-hover',
        disabledUnavailableClassName,
      ],
      /**
       * The chrome button: pagination, search, attachment lists. Quieter and
       * smaller than `secondary` — it marks its hover by filling rather than by
       * darkening its border, because it sits inside a tinted panel where a
       * border change reads as noise.
       */
      quiet: [
        'inline-flex cursor-pointer items-center justify-center rounded-xs',
        // No colour of its own: the original inherited from whatever panel it sat
        // in (the pagination footer's muted grey, the filter bar's body text),
        // and that is the behaviour worth keeping.
        'border border-border-strong bg-surface-page px-s py-xs text-label font-heavy',
        'hover:bg-surface-tint',
        disabledUnavailableClassName,
      ],
      // A word in a sentence, not a box: no padding, no box, inherits its type.
      inline: 'cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-inherit underline',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export type AdminButtonVariant = NonNullable<VariantProps<typeof adminButtonVariants>['variant']>;

type SharedProps = {
  children: ReactNode;
  variant?: AdminButtonVariant;
  className?: string;
};

type AsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: never };

type AsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & { href: string };

/** Renders a Link when `href` is set, a <button> otherwise. */
export function AdminButton(props: AsButton | AsLink) {
  const { children, variant, className, ...rest } = props;
  const classes = cn(adminButtonVariants({ variant }), className);

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <Link className={classes} href={href} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
