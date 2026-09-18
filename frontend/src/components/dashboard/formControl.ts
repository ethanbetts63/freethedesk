/**
 * The one text-control shape used by every authenticated surface: the portal
 * forms, the dashboard filter bar, the message composer, the staff notes
 * textarea and the status-card select.
 *
 * Four stylesheets had grown their own copy of these seven declarations
 * (`portal.css`'s `.portal-field-grid input`, `admin.css`'s
 * `.admin-filters select, .admin-filters input, …`, `.admin-notes` and
 * `.admin-status-card select`), and they had already drifted: only some of
 * them set `width`, and the focus border was a raw `var(--blue-600)` rather
 * than a named role. This is the single definition they converge on.
 *
 * The focus ring is `--ring-field` via `shadow-focus`, the same ring the public
 * forms draw. It used to be a hand-written `0 0 0 2px var(--focus-ring)`,
 * which was a second focus vocabulary nobody had chosen.
 *
 * Padding is deliberately NOT included. Tailwind emits `padding` before
 * `padding-inline`, so a `p-s` on a caller would lose to a `px-s` in this
 * base whatever order the classes merge in — the flat padding a file input or
 * a notes textarea needs has to be the only padding rule it gets. Every caller
 * states its own.
 */
export const formControlClassName =
  'w-full rounded-xs border border-border-strong bg-surface-page text-text-primary outline-none ' +
  'focus:border-border-focus focus:shadow-focus';

/** The padding the majority of controls take: a dense single-line box. */
export const formControlPaddingClassName = 'px-s py-xs';

/**
 * The stacked label/control form used by the message composer, both account
 * screens and the site-settings prices. `admin.css` called it
 * `.admin-compose-form`, but it had long since outgrown the composer.
 *
 * The label wraps its control, so the control carries the gap rather than the
 * label carrying a margin — the same rendering the deleted rules produced, and
 * the reason the control is `block`.
 */
export const adminFormClassName = 'flex flex-col gap-m';

export const adminFormLabelClassName = 'text-ui font-heavy';

export const adminFormControlClassName = `${formControlClassName} ${formControlPaddingClassName} mt-2xs block`;

/**
 * The composer's body field. Monospace because the operator is writing an
 * email whose whitespace matters, and the only reason this needs its own name.
 */
export const adminFormTextareaClassName =
  `${adminFormControlClassName} resize-y leading-[1.55] ` +
  '[font-family:ui-monospace,SFMono-Regular,Consolas,monospace]';
