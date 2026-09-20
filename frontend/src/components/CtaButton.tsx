import { cva, type VariantProps } from 'class-variance-authority';

import { disabledBusyClassName, focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

import { LinkOrButton } from '@/components/common/LinkOrButton';
import { ScrollCtaButton } from '@/components/common/ScrollCtaButton';

/**
 * Which glyph the CTA shows. In-page anchors use the scroll direction (`down` /
 * `up`); `page` links elsewhere, `right` advances a form, `none` omits it.
 */
export type CtaDirection = 'down' | 'up' | 'page' | 'right' | 'none';

const ARROWS: Record<Exclude<CtaDirection, 'none'>, string> = {
  down: '↓',
  up: '↑',
  page: '↗',
  right: '→',
};

const ctaButtonVariants = cva(
  [
    'inline-flex items-center justify-between border-0 font-[inherit] font-strong',
    'cursor-pointer uppercase tracking-label-tight',
    'transition-[background,color,transform] duration-200 ease-out',
    focusRingClassName,
    disabledBusyClassName,
    '[&>span]:inline-block [&>span]:transition-transform [&>span]:duration-200',
    'hover:[&>span]:translate-x-1',
  ],
  {
    variants: {
      appearance: {
        brand: 'bg-action-primary text-text-on-dark hover:bg-surface-dark-hover',
        dark: 'bg-surface-dark text-text-on-dark hover:bg-surface-dark-hover',
        light: 'bg-surface-page text-text-secondary hover:bg-surface-tint-strong',
        ghost:
          'border-b border-current bg-transparent text-action-primary hover:bg-transparent hover:text-text-secondary',
        // Deliberately no background/text classes: MovingColourButton supplies
        // them via `.moving-colour-button` in styles/motion.css instead (an
        // animated gradient - a legitimate complex-animation exception per
        // tailwind-migration.md, not translatable to arbitrary utilities).
        // Emitting Tailwind bg-*/text-* here would sit in the `utilities`
        // layer and beat that `components`-layer class outright.
        moving: '',
      },
      size: {
        compact: 'gap-ml p-m text-label',
        // `large` renders identically to `default` - preserved from the CSS
        // this replaces (src/styles/buttons.css) rather than redesigned.
        default: 'gap-xl px-ml py-m text-body-sm',
        large: 'gap-xl px-ml py-m text-body-sm',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      // A ghost button is a rule, not a box: this overrides every size's
      // padding. Order matters - it must come after `size` above so cn()'s
      // tailwind-merge keeps this padding, not the size variant's.
      { appearance: 'ghost', size: ['compact', 'default', 'large'], class: 'px-0 py-xs' },
    ],
    defaultVariants: { appearance: 'brand', size: 'default', fullWidth: false },
  },
);

export type CtaAppearance = NonNullable<VariantProps<typeof ctaButtonVariants>['appearance']>;
export type CtaSize = NonNullable<VariantProps<typeof ctaButtonVariants>['size']>;

export type CtaButtonProps = {
  children: React.ReactNode;
  /** Renders a Link when set, a <button> otherwise. */
  href?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  target?: '_blank' | '_self';
  rel?: string;
  /** Defaults to `page`; submit buttons should pass `none`. */
  direction?: CtaDirection;
  appearance?: CtaAppearance;
  size?: CtaSize;
  fullWidth?: boolean;
};

/**
 * The marketing call to action. `MovingColourButton` is the same component with
 * the animated appearance preset applied.
 */
export function CtaButton({
  children,
  href,
  type = 'button',
  disabled = false,
  className,
  target,
  rel,
  direction = 'page',
  appearance,
  size,
  fullWidth,
  baseClassName,
}: CtaButtonProps & { baseClassName?: string }) {
  const content = (
    <>
      {children}
      {direction !== 'none' && <span aria-hidden="true">{ARROWS[direction]}</span>}
    </>
  );
  const classes = cn(ctaButtonVariants({ appearance, size, fullWidth }), baseClassName, className);

  // A bare "#fragment" is an in-page scroll, not navigation: render a button
  // that drives the scroll itself so it works on every click and leaves the URL
  // alone. Real routes (including "/path#fragment") still go through Link.
  if (href?.startsWith('#')) {
    return (
      <ScrollCtaButton targetId={href.slice(1)} className={classes}>
        {content}
      </ScrollCtaButton>
    );
  }
  if (href) {
    return (
      <LinkOrButton classes={classes} href={href} target={target} rel={rel}>
        {content}
      </LinkOrButton>
    );
  }
  return (
    <LinkOrButton classes={classes} type={type} disabled={disabled}>
      {content}
    </LinkOrButton>
  );
}
