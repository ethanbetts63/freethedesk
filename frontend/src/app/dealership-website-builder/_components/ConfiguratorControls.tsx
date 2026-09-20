'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { fieldHintClassName } from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { cn } from '@/lib/utils';

import { CapabilityOption, CapabilityRow } from './CapabilityOption';
import {
  submitConfiguratorEnquiry,
  type ConfiguratorEnquiryState,
} from './ConfiguratorControls.actions';
import { INVENTORY_OPTIONS, MODULES, summariseSelection } from '../_lib/configuratorData';
import type {
  InventoryAddonSelection,
  InventoryOption,
  ModuleKey,
  ModuleSelection,
} from '../_lib/types';

const initialState: ConfiguratorEnquiryState = { status: 'idle' };

/* The panel is denser than a marketing page: the site's form controls are
   re-set here at interface size rather than the generous size a landing form
   wants.

   styles/forms.css held these two as `.form-label` and `.form-control`. This
   was its last consumer, and it was already overriding six of the seven things
   the label class set, so Phase 6 deleted the file and the real values are
   written out here. */
const sectionClassName = 'p-l';

const labelClassName =
  'mb-xs block text-label font-control tracking-normal text-text-control normal-case';
const controlClassName =
  'min-h-[50px] w-full border border-border-default bg-surface-page px-m py-0 text-lead font-normal text-text-primary outline-0 transition-[border-color,box-shadow] duration-150 placeholder:text-body-sm placeholder:text-text-on-dark-subtle focus:border-action-primary focus:shadow-focus';

/** The numbered "01 / 02 / 03" heading that opens each step of the panel. */
function GroupTitle({ number, title, hint }: { number: string; title: string; hint: string }) {
  return (
    <div className="mb-ml flex items-start gap-s">
      <span className="pt-4xs text-body-sm font-black text-action-primary">{number}</span>
      <div>
        <strong className="block text-lead">{title}</strong>
        <small className="mt-2xs block text-lead leading-[1.45] text-text-subtle">{hint}</small>
      </div>
    </div>
  );
}

function SubmitButton({ hasSucceeded }: { hasSucceeded: boolean }) {
  const { pending } = useFormStatus();
  return (
    <MovingColourButton
      className="mt-3xs"
      type="submit"
      disabled={pending}
      direction="right"
      size="large"
      fullWidth
    >
      {pending ? 'Sending…' : hasSucceeded ? 'Send updated configuration' : 'Send my configuration'}
    </MovingColourButton>
  );
}

type ConfiguratorControlsProps = {
  brandName: string;
  currentUrl: string;
  customRequest: string;
  selected: ModuleSelection;
  inventoryAddons: InventoryAddonSelection;
  onBrandNameChange: (name: string) => void;
  onCurrentUrlChange: (url: string) => void;
  onCustomRequestChange: (request: string) => void;
  onModuleToggle: (key: ModuleKey) => void;
  onInventoryAddonToggle: (key: InventoryOption) => void;
};

export function ConfiguratorControls(props: ConfiguratorControlsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [state, formAction] = useActionState(submitConfiguratorEnquiry, initialState);
  const {
    brandName,
    currentUrl,
    customRequest,
    selected,
    inventoryAddons,
    onBrandNameChange,
    onCurrentUrlChange,
    onCustomRequestChange,
    onModuleToggle,
    onInventoryAddonToggle,
  } = props;
  const {
    hasCustomRequest,
    additionCount,
    names: summaryItems,
  } = summariseSelection(selected, inventoryAddons, customRequest);
  const toggleExpanded = (key: string) =>
    setExpanded((current) => ({ ...current, [key]: !current[key] }));

  // The configurator's own selections aren't native form fields (they're
  // rendered — and changed — outside this <form>, via the props above), so
  // they're carried to the Server Action as hidden fields computed fresh on
  // every render rather than read from the DOM.
  const suppliedUrl = currentUrl.trim();
  const website =
    suppliedUrl && !/^https?:\/\//i.test(suppliedUrl) ? `https://${suppliedUrl}` : suppliedUrl;
  const configuration = {
    version: 1,
    appearance: {
      brand_name: brandName.trim(),
      current_url: suppliedUrl,
    },
    capabilities: MODULES.map((module) => ({
      key: module.key,
      name: module.name,
      selected: selected[module.key],
    })),
    inventory_options: INVENTORY_OPTIONS.map((option) => ({
      key: option.key,
      name: option.name,
      selected: selected.inventory && inventoryAddons[option.key],
    })),
    custom_capability: customRequest.trim(),
  };
  const message = hasCustomRequest
    ? `Website builder configuration. Custom request: ${customRequest.trim()}`
    : 'Interactive dealership website configuration submitted.';

  return (
    <aside
      className="border-t border-border-default bg-surface-page [scrollbar-color:var(--slate-400)_var(--slate-100)] [scrollbar-width:thin] lg:h-full lg:overflow-y-auto lg:border-t-0 lg:border-l"
      aria-label="Website configuration options"
    >
      <section className={cn(sectionClassName, 'border-b border-border-default bg-surface-tint')}>
        <div className="flex justify-between [&>*]:text-body-sm [&>*]:font-black [&>*]:tracking-label [&>*]:text-action-primary [&>*]:uppercase">
          <span>Base product</span>
          <b>Included</b>
        </div>
        <h2 className="mt-m mb-xs text-title-sm tracking-[-0.04em]">
          Build your dealership website.
        </h2>
        <p className="m-0 text-lead leading-[1.55] text-text-subtle">
          Add your brand and the capabilities you need, explore the live preview, then send the
          complete configuration to our team. No payment is required.
        </p>
      </section>

      <section className={cn(sectionClassName, 'border-b border-border-subtle')}>
        <GroupTitle
          number="01"
          title="Brand the website"
          hint="Make the foundation feel like yours."
        />
        <label className={cn(labelClassName, 'mt-ml')} htmlFor="brand-name">
          Brand name
        </label>
        <input
          id="brand-name"
          className={controlClassName}
          value={brandName}
          onChange={(event) => onBrandNameChange(event.target.value)}
          maxLength={28}
          placeholder="Your dealership"
        />
        <label className={cn(labelClassName, 'mt-ml')} htmlFor="current-url">
          Current website{' '}
          <span className="ml-2xs text-label font-strong text-[var(--slate-400)] normal-case">
            Optional
          </span>
        </label>
        <input
          id="current-url"
          className={controlClassName}
          type="text"
          inputMode="url"
          value={currentUrl}
          onChange={(event) => onCurrentUrlChange(event.target.value)}
          placeholder="e.g. www.example.com.au"
        />
        <small className={fieldHintClassName}>
          Helps us understand your current content and setup.
        </small>
        <p className="mt-m mb-0 max-w-[340px] text-label leading-[1.55] text-text-subtle">
          Demo palette — production design and colours are tailored to your brand.
        </p>
      </section>

      <section className={cn(sectionClassName, 'border-b border-border-subtle')}>
        <GroupTitle
          number="02"
          title="Add capabilities"
          hint="Every choice changes the live preview."
        />
        <div className="flex flex-col">
          {MODULES.map((module) => {
            const explanationId = `module-${module.key}`;

            return (
              <CapabilityOption
                key={module.key}
                option={module}
                selected={selected[module.key]}
                expanded={Boolean(expanded[explanationId])}
                onToggle={() => onModuleToggle(module.key)}
                onExpandedChange={() => toggleExpanded(explanationId)}
              >
                {module.key === 'inventory' && selected.inventory ? (
                  <div className="mb-s ml-s border-l-2 border-action-primary bg-surface-tint p-s pb-3xs">
                    <p className="mt-0 mb-2xs text-label font-black tracking-label text-text-subtle uppercase">
                      Optional online actions
                    </p>
                    {INVENTORY_OPTIONS.map((option) => {
                      const optionExplanationId = `inventory-${option.key}`;

                      return (
                        <CapabilityOption
                          key={option.key}
                          option={option}
                          compact
                          selected={inventoryAddons[option.key]}
                          expanded={Boolean(expanded[optionExplanationId])}
                          onToggle={() => onInventoryAddonToggle(option.key)}
                          onExpandedChange={() => toggleExpanded(optionExplanationId)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </CapabilityOption>
            );
          })}
          {/* The same row as a capability, but its "selected" state is whether
              the textarea has anything in it - there is nothing to toggle, so
              opening the row is the whole interaction. */}
          <CapabilityRow
            name="Custom capability"
            description="Tell us what would make this work for you."
            icon={
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
              </svg>
            }
            selected={hasCustomRequest}
            expanded={Boolean(expanded.custom)}
            detailsId="custom-capability-details"
            onExpandedChange={() => toggleExpanded('custom')}
            panel={
              <>
                <label className={cn(labelClassName, 'mb-s')} htmlFor="custom-request">
                  What would you like your website to do?
                </label>
                <textarea
                  id="custom-request"
                  className={cn(controlClassName, 'min-h-[112px] resize-y px-m py-s leading-[1.5]')}
                  value={customRequest}
                  onChange={(event) => onCustomRequestChange(event.target.value)}
                  placeholder="e.g. Connect stock, bookings or trade-ins to our existing systems."
                  rows={5}
                />
                <small className="mt-xs block text-body-sm leading-[1.5] text-text-subtle">
                  It can be rough—we’ll help turn the idea into a clear scope.
                </small>
              </>
            }
          />
        </div>
      </section>

      <section className={cn(sectionClassName, 'bg-surface-tint')}>
        <GroupTitle number="03" title="Your details" hint="Send this configuration to our team." />
        <form className="flex flex-col gap-m" action={formAction}>
          <input
            type="hidden"
            name="business"
            value={brandName.trim() || 'Dealership website enquiry'}
          />
          <input type="hidden" name="website" value={website} />
          <input type="hidden" name="message" value={message} />
          <input type="hidden" name="configuration" value={JSON.stringify(configuration)} />
          <label>
            <span className={labelClassName}>Name</span>
            <input
              className={controlClassName}
              name="name"
              autoComplete="name"
              placeholder="e.g. Alex Smith"
              required
            />
          </label>
          <label>
            <span className={labelClassName}>Email</span>
            <input
              className={controlClassName}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. email@example.com"
              required
            />
          </label>
          <label>
            <span className={labelClassName}>Phone number</span>
            <input
              className={controlClassName}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. 0400 000 000"
              required
            />
          </label>
          <div className="mt-2xs border-t border-border-default pt-m">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-text-subtle uppercase">Your configuration</span>
              <strong className="text-lead">
                {additionCount === 0 ? 'Base website' : `Base + ${additionCount}`}
              </strong>
            </div>
            {summaryItems.length > 0 && (
              <p className="mt-s mb-0 text-body-sm leading-[1.55] text-text-muted">
                {summaryItems.join(' · ')}
              </p>
            )}
          </div>
          <SubmitButton hasSucceeded={state.status === 'success'} />
          <small className="block text-label leading-[1.55] text-text-subtle">
            No payment today. We’ll confirm integrations, scope and timing with you first.
          </small>
          <div
            className="empty:hidden [&_p]:m-0 [&_p]:px-s [&_p]:py-s [&_p]:text-body-sm [&_p]:font-strong [&_p]:leading-[1.55]"
            aria-live="polite"
          >
            {state.status === 'success' && (
              <p className="bg-surface-success text-text-success">
                Thanks — your complete configuration is now with our team.
              </p>
            )}
            {state.status === 'error' && (
              <p className="bg-surface-danger text-text-danger">
                Something went wrong. Please try again or email hello@freethedesk.com.au.
              </p>
            )}
          </div>
        </form>
      </section>
    </aside>
  );
}
