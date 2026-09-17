import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import type { InventoryOptionDefinition, ModuleDefinition } from '../_lib/types';
import { CapabilityIcon } from './CapabilityIcon';

/**
 * A capability row: icon, name, description, and a +/✓ on the right, with a
 * chevron beside it that opens the explanation. The inventory add-ons are the
 * same row one size down, so `compact` is a size rather than a second design -
 * everything it changes is listed here, not spread across nested selectors.
 */
const SIZES = {
  full: {
    toggle: 'py-ml',
    icon: 'flex-[0_0_44px] bg-surface-tint [&_svg]:h-[21px] [&_svg]:w-[21px]',
    name: 'text-step-0',
    description: 'text-lead',
    mark: 'h-[24px] w-[24px] flex-[0_0_24px]',
    explanation: 'bg-surface-tint mb-m',
  },
  compact: {
    toggle: 'bg-transparent py-m',
    icon: 'flex-[0_0_29px] bg-surface-page [&_svg]:h-[16px] [&_svg]:w-[16px]',
    name: 'text-lead',
    description: 'text-small',
    mark: 'h-[21px] w-[21px] flex-[0_0_21px] bg-surface-page',
    explanation: 'bg-surface-page mb-s',
  },
} as const;

/** Every capability row is separated by a hairline, at either size. */
export const capabilityRowClassName = 'border-t border-border-subtle';

export const capabilityToggleClassName =
  'flex min-w-0 flex-1 cursor-pointer items-center justify-between bg-surface-page px-4xs text-left';

/** The square icon tile. Inverts onto the accent once its row is selected. */
export const capabilityIconClassName =
  'flex items-center justify-center border border-border-subtle text-[var(--page-accent)] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.45]';

export const capabilitySelectedIconClassName =
  'border-[var(--page-accent)] bg-[var(--page-accent)] text-text-on-dark';

/** The round +/✓ at the end of the row. */
export const capabilityMarkClassName =
  'flex items-center justify-center rounded-circle border border-border-default text-[var(--page-accent)] text-lead not-italic';

export const capabilitySelectedMarkClassName =
  'border-[var(--page-accent)] bg-[var(--page-accent)] text-text-on-dark';

export const capabilityChevronClassName =
  'flex flex-[0_0_34px] cursor-pointer items-center justify-center bg-surface-page p-0 text-text-subtle hover:text-[var(--page-accent)] [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.6] [&_svg]:transition-transform [&_svg]:duration-200';

export const capabilityChevronOpenClassName = 'text-[var(--page-accent)] [&_svg]:rotate-180';

/** The panel that unfolds under a row. Also used by the custom-request panel. */
export const capabilityPanelClassName = 'border-l-2 border-[var(--page-accent)] px-m py-m';

type CapabilityOptionProps = {
  option: ModuleDefinition | InventoryOptionDefinition;
  selected: boolean;
  expanded: boolean;
  compact?: boolean;
  onToggle: () => void;
  onExpandedChange: () => void;
  children?: ReactNode;
};

export function CapabilityOption({
  option,
  selected,
  expanded,
  compact = false,
  onToggle,
  onExpandedChange,
  children,
}: CapabilityOptionProps) {
  const explanationId = `${compact ? 'inventory' : 'module'}-${option.key}`;
  const size = SIZES[compact ? 'compact' : 'full'];

  return (
    <div className={capabilityRowClassName}>
      <div className="flex items-stretch">
        <button
          type="button"
          className={cn(capabilityToggleClassName, size.toggle)}
          onClick={onToggle}
          aria-pressed={selected}
        >
          <span className="flex min-w-0 items-center gap-s">
            <span
              className={cn(
                capabilityIconClassName,
                size.icon,
                selected && capabilitySelectedIconClassName,
              )}
            >
              <CapabilityIcon type={option.key} />
            </span>
            <span>
              <strong
                className={cn(
                  'block leading-[1.25]',
                  size.name,
                  selected && 'text-[var(--page-accent)]',
                )}
              >
                {option.name}
              </strong>
              <small
                className={cn('mt-2xs block leading-[1.45] text-text-subtle', size.description)}
              >
                {option.description}
              </small>
            </span>
          </span>
          <i
            className={cn(
              capabilityMarkClassName,
              size.mark,
              selected && capabilitySelectedMarkClassName,
            )}
          >
            {selected ? '✓' : '+'}
          </i>
        </button>
        <button
          type="button"
          className={cn(
            capabilityChevronClassName,
            compact && 'bg-transparent',
            expanded && capabilityChevronOpenClassName,
          )}
          onClick={onExpandedChange}
          aria-expanded={expanded}
          aria-controls={`${explanationId}-details`}
          aria-label={`${expanded ? 'Hide' : 'Learn more about'} ${option.name}`}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div
          className={cn(capabilityPanelClassName, size.explanation)}
          id={`${explanationId}-details`}
        >
          <p className="mb-s text-lead leading-[1.65] text-text-muted">{option.detail}</p>
          <ul className="m-0 grid list-none gap-2xs p-0">
            {option.includes.map((item) => (
              <li
                className="relative pl-s text-small leading-[1.5] text-text-muted before:absolute before:top-[0.4em] before:left-0 before:h-[4px] before:w-[4px] before:rounded-circle before:bg-[var(--page-accent)] before:content-['']"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </div>
  );
}
