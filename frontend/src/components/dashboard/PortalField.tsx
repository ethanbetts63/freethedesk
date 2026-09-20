import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName, formControlPaddingClassName } from '@/components/ui/formControl';

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
      <legend className="bg-surface-page px-xs py-0 text-lead font-control">{legend}</legend>
      {description && (
        <p className="m-0 mb-l text-label leading-[1.55] text-text-muted">{description}</p>
      )}
      {children}
    </fieldset>
  );
}

/**
 * `error` is the field's own validation message, rendered under the control.
 * Separate from `hint` on purpose: a hint explains what to type and is muted,
 * an error says what went wrong and is not. Track A forms pass
 * `errors.field?.message` straight into it.
 */
type FieldBase = { label: ReactNode; hint?: ReactNode; error?: ReactNode };

/**
 * `ComponentPropsWithRef` rather than `InputHTMLAttributes`, because a Track A
 * form registers its controls by spreading `register('name')`, and that object
 * carries a `ref`. In React 19 a function component takes `ref` as an ordinary
 * prop, so it reaches the `<input>` through the same spread as everything else
 * — only the type had to be told.
 */
type InputField = FieldBase &
  Omit<ComponentPropsWithRef<'input'>, 'className'> & {
    multiline?: false;
  };

type TextareaField = FieldBase &
  Omit<ComponentPropsWithRef<'textarea'>, 'className'> & {
    multiline: true;
  };

type SelectField = FieldBase &
  Omit<ComponentPropsWithRef<'select'>, 'className' | 'children'> & {
    options: readonly { value: string; label: string }[];
  };

export function PortalField(props: InputField | TextareaField) {
  const { label, hint, error } = props;
  return (
    <label className="text-label font-heavy">
      <span className="mb-2xs block">{label}</span>
      {props.multiline ? <PortalTextarea {...props} /> : <PortalInput {...props} />}
      <FieldFootnote hint={hint} error={error} />
    </label>
  );
}

export function PortalSelect({ label, hint, error, options, ...rest }: SelectField) {
  return (
    <label className="text-label font-heavy">
      <span className="mb-2xs block">{label}</span>
      <select
        {...rest}
        className={cn(formControlClassName, 'min-h-[42px]', formControlPaddingClassName)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldFootnote hint={hint} error={error} />
    </label>
  );
}

/** A checkbox reads left-to-right, so it does not share the stacked layout. */
export function PortalCheckbox({
  label,
  hint,
  error,
  ...rest
}: FieldBase & Omit<ComponentPropsWithRef<'input'>, 'className' | 'type'>) {
  return (
    <label className="flex items-start gap-xs text-label font-heavy">
      <input {...rest} type="checkbox" className="mt-3xs h-[18px] w-[18px]" />
      <span className="font-normal">
        <span className="block font-heavy">{label}</span>
        <FieldFootnote hint={hint} error={error} />
      </span>
    </label>
  );
}

function FieldFootnote({ hint, error }: Pick<FieldBase, 'hint' | 'error'>) {
  if (error)
    return (
      <Notice tone="danger" size="field" className="mt-2xs font-normal">
        {error}
      </Notice>
    );
  if (!hint) return null;
  return (
    <small className="mt-2xs block text-label leading-[1.4] font-normal text-text-subtle">
      {hint}
    </small>
  );
}

// A textarea in this grid used to match nothing - portal.css styled `input`
// only - so it rendered as an unbordered, unpadded box. It now shares the
// control styling, and keeps the drag handle as its one sizing affordance.
function PortalTextarea({ label, hint, error, multiline, ...rest }: TextareaField) {
  void label;
  void hint;
  void error;
  void multiline;
  return (
    <textarea
      {...rest}
      className={cn(formControlClassName, 'resize-y', formControlPaddingClassName)}
    />
  );
}

function PortalInput({ label, hint, error, multiline, ...rest }: InputField) {
  void label;
  void hint;
  void error;
  void multiline;
  return (
    <input
      {...rest}
      className={cn(
        formControlClassName,
        'min-h-[42px]',
        // The file control brings its own chrome from the browser, so it sits
        // on the tinted surface at a smaller size with even padding.
        rest.type === 'file' ? 'bg-surface-tint p-xs text-caption' : formControlPaddingClassName,
      )}
    />
  );
}
