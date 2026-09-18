/**
 * Shared Tailwind classes for the "selection form" shape (a chooser aside +
 * a form, used by the licensing/SEO signup panels and the project-enquiry
 * panel) - kept in one place since three separate page components render
 * identical structure.
 *
 * This used to end by saying the choice-card cluster could never move here,
 * because "recommended" and "selected" combined through CSS specificity and
 * utilities would flatten that. The premise was right and the conclusion was
 * wrong: what the two states actually disagreed about was the flat colour
 * inside the animated border, and once `.moving-colour-border` takes that as a
 * custom property the combination is a variable swap rather than two copies of
 * a treatment fighting each other. The cluster is `choiceCardVariants` below.
 */
import { cva } from 'class-variance-authority';

/**
 * The animated outer border of a selection panel. `--selection-panel-min-height`
 * is a caller-set floor so the chooser and the form stay the same height while
 * the form's own content changes.
 */
export const selectionPanelClassName =
  'moving-colour-border grid min-h-[var(--selection-panel-min-height,590px)] grid-cols-[minmax(0,1fr)]';

export const choiceGridClassName = 'grid gap-xs';

/**
 * The radio itself. Visually gone but still in the accessibility tree and
 * still focusable, which is what drives the card's focus ring through
 * `has-[:focus-visible]`.
 */
export const choiceInputClassName = 'pointer-events-none absolute h-0 w-0 opacity-0';

/**
 * A choice card. Four states from two booleans, and the two that involve
 * `recommended` deliberately do not emit a `border` utility - the animated
 * border owns that property, and a utility would win over it.
 *
 * One behaviour change falls out of the rewrite. In the stylesheet,
 * `.choiceGrid label:hover` was more specific than `.choiceGrid
 * .choiceRecommended`, and it set the `background` shorthand, so hovering a
 * recommended card wiped out the gradient it was recommended with. Recommended
 * cards no longer take a hover background, so the border survives the pointer.
 */
export const choiceCardVariants = cva(
  [
    'relative flex min-h-[var(--selection-choice-min-height,56px)] cursor-pointer flex-col items-center justify-center p-xs text-center text-label font-control',
    'transition-[background-color,border-color,color] duration-200 ease-[ease]',
    'has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color-mix(in_srgb,var(--action-primary)_25%,transparent)]',
    // The sub-label is a miniature inside a card, below every step of the
    // type scale on purpose.
    '[&>small]:mt-3xs [&>small]:text-caption-xs [&>small]:font-strong [&>small]:tracking-label [&>small]:uppercase',
  ],
  {
    variants: {
      selected: {
        true: 'text-text-on-dark [&>small]:text-accent-on-dark-soft',
        false: 'text-text-control [&>small]:text-text-muted',
      },
      recommended: {
        true: 'moving-colour-border',
        false: 'border',
      },
    },
    compoundVariants: [
      {
        recommended: false,
        selected: false,
        class:
          'border-border-default bg-surface-tint hover:border-action-primary hover:bg-surface-page',
      },
      {
        recommended: false,
        selected: true,
        class:
          'border-surface-dark bg-surface-dark hover:border-surface-dark-hover hover:bg-surface-dark-hover',
      },
      { recommended: true, selected: false, class: '[--moving-colour-inset:var(--surface-tint)]' },
      { recommended: true, selected: true, class: '[--moving-colour-inset:var(--surface-dark)]' },
    ],
    defaultVariants: { selected: false, recommended: false },
  },
);

export const chooserClassName = 'flex flex-col px-ml py-xl text-text-secondary sm:p-2xl';

export const choiceGroupHeadingClassName =
  'm-0 mb-s border-b border-border-subtle pb-xs text-caption-sm font-strong tracking-label text-action-primary uppercase';

export const totalClassName =
  'mt-auto grid grid-cols-[minmax(0,1fr)] items-center gap-s border-t border-dashed border-border-default pt-l sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-ml';
export const totalFigureClassName = 'grid gap-4xs';
export const totalPriceClassName =
  // Optical kerning after the final glyph, and a size read from the panel's own
  // --selection-total-size - em-relative and token-derived, not literals.
  // eslint-disable-next-line no-restricted-syntax -- see above
  'pr-[0.06em] text-[length:var(--selection-total-size,2.8rem)] leading-none tracking-[-0.06em]';
export const totalCadenceClassName = 'text-caption-sm text-text-muted';
export const totalSummaryClassName = 'text-body-sm leading-[1.45] font-strong text-text-control';

export const formClassName =
  'flex flex-col justify-center border-t border-border-subtle bg-surface-tint p-xl [--selection-input-font-size:0.9rem]';
export const formTitleClassName =
  'mb-l flex flex-wrap items-baseline justify-between gap-s gap-x-m border-b border-border-subtle pb-ml';
export const formTitleHeadingClassName = 'm-0 text-title-sm tracking-[-0.04em]';
export const pillClassName =
  'flex-none bg-surface-tint-strong px-xs py-2xs text-caption-sm font-strong tracking-label-tight text-text-action uppercase whitespace-nowrap';
export const fieldRowClassName = 'grid grid-cols-[minmax(0,1fr)] gap-m sm:grid-cols-2';
export const fieldLabelClassName = 'mb-m block text-caption font-control text-text-control';
export const fieldLabelSpanClassName = 'mb-xs block';
export const fieldInputClassName =
  'min-h-[50px] w-full rounded-none border border-border-default bg-surface-page px-s text-[length:var(--selection-input-font-size)] text-text-primary outline-none [font:inherit] placeholder:text-body-sm placeholder:font-normal placeholder:text-[var(--text-on-dark-subtle)] focus:border-action-primary focus:shadow-focus';
export const fieldTextareaClassName =
  'min-h-[82px] w-full resize-y rounded-none border border-border-default bg-surface-page p-s text-[length:var(--selection-input-font-size)] text-text-primary outline-none [font:inherit] placeholder:text-body-sm placeholder:font-normal placeholder:text-[var(--text-on-dark-subtle)] focus:border-action-primary focus:shadow-focus';
export const fieldHintClassName = 'mt-2xs block text-caption font-normal text-text-subtle';
export const submitClassName = 'mt-xs min-h-[58px] text-left [&>span]:text-body-lg';
export const formErrorClassName =
  'm-0 mb-s border-l-[3px] border-border-danger bg-surface-danger p-s text-caption leading-[1.5] text-text-danger';
