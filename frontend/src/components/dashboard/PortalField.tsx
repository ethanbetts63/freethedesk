import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/**
 * The portal form primitives: the fieldset card, the field grid, a
 * label/control/hint field, and the action row. They replace the element
 * selectors `styles/portal.css` used to hang on `.portal-setup-form` and
 * `.portal-field-grid` (dealership setup and the SEO reporting brief render
 * the identical shape).
 *
 * `portal.css` is imported straight from the portal layouts rather than
 * through `globals.css`, so it is unlayered and beats every Tailwind utility.
 * The rules these replace had to be deleted in the same change, not left to
 * compete - a surviving `.portal-field-grid input` would silently win over
 * everything below.
 */

/** 1fr until `sm`, two equal columns above it. */
export const portalFieldGridClassName = 'grid grid-cols-[minmax(0,1fr)] gap-ml sm:grid-cols-2';

export const portalFormClassName = 'grid gap-ml';

/** Stacked and full-width on phones, right-aligned in a row from `sm`. */
export const portalFormActionsClassName =
  'flex flex-col items-stretch justify-end gap-s py-xs sm:flex-row sm:items-center';

/* Padding is deliberately NOT in this shared base. Tailwind emits `padding`
   before `padding-inline`, so a `p-xs` on the file variant would lose to a
   base `px-s` whatever order the classes are merged in - the flat padding the
   file control needs has to be the only padding rule it gets. */
const controlClassName = [
  'w-full rounded-[var(--radius-xs)] border border-border-strong bg-surface-page',
  'text-text-primary outline-none',
  'focus:border-border-focus focus:shadow-[0_0_0_2px_var(--focus-ring)]',
];

export function PortalFieldset({
  legend,
  description,
  disabled,
  children,
}: {
  legend: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="m-0 rounded-lg border border-border-default bg-surface-page px-m py-ml sm:p-xl"
    >
      <legend className="bg-surface-page px-xs py-0 text-step-0 font-control">{legend}</legend>
      {description && (
        <p className="m-0 mb-l text-ui leading-[1.55] text-text-muted">{description}</p>
      )}
      {children}
    </fieldset>
  );
}

type FieldBase = { label: ReactNode; hint?: ReactNode };

type InputField = FieldBase &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & { multiline?: false };

type TextareaField = FieldBase &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & { multiline: true };

export function PortalField(props: InputField | TextareaField) {
  const { label, hint } = props;
  return (
    <label className="text-ui font-heavy">
      <span className="mb-2xs block">{label}</span>
      {props.multiline ? <PortalTextarea {...props} /> : <PortalInput {...props} />}
      {hint && (
        <small className="mt-2xs block text-meta leading-[1.4] font-normal text-text-subtle">
          {hint}
        </small>
      )}
    </label>
  );
}

// A textarea in this grid used to match nothing - portal.css styled `input`
// only - so it rendered as an unbordered, unpadded box. It now shares the
// control styling, and keeps the drag handle as its one sizing affordance.
function PortalTextarea({ label, hint, multiline, ...rest }: TextareaField) {
  void label;
  void hint;
  void multiline;
  return <textarea {...rest} className={cn(controlClassName, 'resize-y px-s py-xs')} />;
}

function PortalInput({ label, hint, multiline, ...rest }: InputField) {
  void label;
  void hint;
  void multiline;
  return (
    <input
      {...rest}
      className={cn(
        controlClassName,
        'min-h-[42px]',
        // The file control brings its own chrome from the browser, so it sits
        // on the tinted surface at a smaller size with even padding.
        rest.type === 'file' ? 'bg-surface-tint p-xs text-caption' : 'px-s py-xs',
      )}
    />
  );
}
