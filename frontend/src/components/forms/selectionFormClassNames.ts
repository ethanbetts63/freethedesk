/**
 * Shared Tailwind classes for the "selection form" shape (a chooser aside +
 * a form, used by the licensing/SEO signup panels and the project-enquiry
 * panel) - kept in one place since three separate page components render
 * identical structure. The animated moving-colour panel border and the
 * choice-card hover/selected/focus-visible/recommended cluster stay in
 * SelectionForm.module.css: they're a single tightly-coupled interactive +
 * animated unit whose "recommended" and "selected" states combine via plain
 * CSS specificity, which would break if split across Tailwind's unlayered
 * utilities (those always beat the legacy-layer module regardless of state).
 */

export const chooserClassName =
  'flex flex-col px-ml py-xl text-text-secondary sm:p-[clamp(34px,4.5vw,64px)]';

export const chooserHeadingClassName =
  'm-0 text-display-1 leading-[1.02] tracking-[-0.058em] text-text-secondary';

export const choiceGroupHeadingClassName =
  'm-0 mb-s border-b border-border-subtle pb-xs text-micro font-strong tracking-label text-[var(--page-accent,var(--action-primary))] uppercase';

export const totalClassName =
  'mt-auto grid grid-cols-[minmax(0,1fr)] items-center gap-s border-t border-dashed border-border-default pt-l sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-ml';
export const totalFigureClassName = 'grid gap-4xs';
export const totalPriceClassName =
  'pr-[0.06em] text-[length:var(--selection-total-size,2.8rem)] leading-none tracking-[-0.06em]';
export const totalCadenceClassName = 'text-meta text-text-muted';
export const totalSummaryClassName = 'text-small leading-[1.45] font-strong text-text-control';

export const formClassName =
  'flex flex-col justify-center border-t border-border-subtle bg-surface-tint p-[clamp(30px,3.5vw,48px)] [--selection-input-font-size:0.9rem]';
export const formTitleClassName =
  'mb-l flex flex-wrap items-baseline justify-between gap-s gap-x-m border-b border-border-subtle pb-ml';
export const formTitleHeadingClassName = 'm-0 text-step-2 tracking-[-0.04em]';
export const pillClassName =
  'flex-none bg-surface-tint-strong px-xs py-2xs text-label font-strong tracking-label-tight text-text-action uppercase whitespace-nowrap';
export const fieldRowClassName = 'grid grid-cols-[minmax(0,1fr)] gap-m sm:grid-cols-2';
export const fieldLabelClassName = 'mb-m block text-caption font-control text-text-control';
export const fieldLabelSpanClassName = 'mb-xs block';
export const fieldInputClassName =
  'min-h-[50px] w-full rounded-none border border-border-default bg-surface-page px-s text-[length:var(--selection-input-font-size)] text-text-primary outline-none [font:inherit] placeholder:text-small placeholder:font-normal placeholder:text-[var(--text-on-dark-subtle)] focus:border-[var(--page-accent,var(--action-primary))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--page-accent,var(--action-primary))_12%,transparent)]';
export const fieldTextareaClassName =
  'min-h-[82px] w-full resize-y rounded-none border border-border-default bg-surface-page p-s text-[length:var(--selection-input-font-size)] text-text-primary outline-none [font:inherit] placeholder:text-small placeholder:font-normal placeholder:text-[var(--text-on-dark-subtle)] focus:border-[var(--page-accent,var(--action-primary))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--page-accent,var(--action-primary))_12%,transparent)]';
export const fieldHintClassName = 'mt-2xs block text-caption font-normal text-text-subtle';
export const submitClassName = 'mt-xs min-h-[58px] text-left [&>span]:text-step-0';
export const formErrorClassName =
  'm-0 mb-s border-l-[3px] border-border-danger bg-surface-danger p-s text-caption leading-[1.5] text-text-danger';
