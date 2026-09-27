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
    name: 'text-lead',
    description: 'text-lead',
    mark: 'h-[24px] w-[24px] flex-[0_0_24px]',
    explanation: 'bg-surface-tint mb-m',
  },
  compact: {
    toggle: 'bg-transparent py-m',
    icon: 'flex-[0_0_29px] bg-surface-page [&_svg]:h-[16px] [&_svg]:w-[16px]',
    name: 'text-lead',
    description: 'text-body-sm',
    mark: 'h-[21px] w-[21px] flex-[0_0_21px] bg-surface-page',
    explanation: 'bg-surface-page mb-s',
  },
} as const;

/** Every capability row is separated by a hairline, at either size. */
const rowClassName = 'border-t border-border-subtle';

const toggleClassName =
  'flex min-w-0 flex-1 cursor-pointer items-center justify-between bg-surface-page px-4xs text-left';

/** The square icon tile. Inverts onto the accent once its row is selected. */
const iconClassName =
  'flex items-center justify-center border border-border-subtle text-action-primary [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.45]';

const selectedIconClassName = 'border-action-primary bg-action-primary text-text-on-dark';

/** The round +/✓ at the end of the row. */
const markClassName =
  'flex items-center justify-center rounded-circle border border-border-default text-lead text-action-primary not-italic';

const selectedMarkClassName = 'border-action-primary bg-action-primary text-text-on-dark';

const chevronClassName =
  'flex flex-[0_0_34px] items-center justify-center bg-surface-page p-0 text-text-subtle [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:stroke-[1.6] [&_svg]:transition-transform [&_svg]:duration-200';

const chevronOpenClassName = 'text-action-primary [&_svg]:rotate-180';

/** The panel that unfolds under a row. */
const panelClassName = 'border-l-2 border-action-primary px-m py-m';

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

type CapabilityRowProps = {
  name: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  expanded: boolean;
  compact?: boolean;
  /** The `id` of the panel, which the chevron's `aria-controls` points at. */
  detailsId: string;
  /**
   * Omit when the row has nothing separate to select - the custom-request row,
   * whose "selected" is whether its textarea has anything in it. The row is
   * then a single button that opens the panel, instead of two buttons that
   * both did the same thing.
   */
  onToggle?: () => void;
  onExpandedChange: () => void;
  /** What unfolds under the row when it is expanded. */
  panel: ReactNode;
  /** Rendered after the panel, still inside the row: the inventory add-ons. */
  children?: ReactNode;
};

/**
 * The row itself, with everything that varies passed in. `CapabilityOption`
 * below is the data-driven case; the custom-request row in
 * `ConfiguratorControls` is the other one, and used to be eighty lines of
 * copied JSX that restated this component's size map by hand.
 */
export function CapabilityRow({
  name,
  description,
  icon,
  selected,
  expanded,
  compact = false,
  detailsId,
  onToggle,
  onExpandedChange,
  panel,
  children,
}: CapabilityRowProps) {
  const size = SIZES[compact ? 'compact' : 'full'];
  const body = (
    <>
      <span className="flex min-w-0 items-center gap-s">
        <span className={cn(iconClassName, size.icon, selected && selectedIconClassName)}>
          {icon}
        </span>
        <span>
          <strong
            className={cn('block leading-[1.25]', size.name, selected && 'text-action-primary')}
          >
            {name}
          </strong>
          <small className={cn('mt-2xs block leading-normal text-text-subtle', size.description)}>
            {description}
          </small>
        </span>
      </span>
      <i className={cn(markClassName, size.mark, selected && selectedMarkClassName)}>
        {selected ? '✓' : '+'}
      </i>
    </>
  );

  return (
    <div className={rowClassName}>
      <div className="flex items-stretch">
        {onToggle ? (
          <>
            <button
              type="button"
              className={cn(toggleClassName, size.toggle)}
              onClick={onToggle}
              aria-pressed={selected}
            >
              {body}
            </button>
            <button
              type="button"
              className={cn(
                chevronClassName,
                'cursor-pointer hover:text-action-primary',
                compact && 'bg-transparent',
                expanded && chevronOpenClassName,
              )}
              onClick={onExpandedChange}
              aria-expanded={expanded}
              aria-controls={detailsId}
              aria-label={`${expanded ? 'Hide' : 'Learn more about'} ${name}`}
            >
              <Chevron />
            </button>
          </>
        ) : (
          // One control, because there is only one thing to do. The chevron is
          // drawn inside it rather than beside it: a second button announcing
          // the same action is a second stop for anyone tabbing through.
          <button
            type="button"
            className={cn(toggleClassName, size.toggle)}
            onClick={onExpandedChange}
            aria-expanded={expanded}
            aria-controls={detailsId}
          >
            {body}
            <span
              className={cn(chevronClassName, expanded && chevronOpenClassName)}
              aria-hidden="true"
            >
              <Chevron />
            </span>
          </button>
        )}
      </div>
      {expanded && (
        <div className={cn(panelClassName, size.explanation)} id={detailsId}>
          {panel}
        </div>
      )}
      {children}
    </div>
  );
}

type CapabilityOptionProps = {
  option: ModuleDefinition | InventoryOptionDefinition;
  selected: boolean;
  expanded: boolean;
  compact?: boolean;
  onToggle: () => void;
  onExpandedChange: () => void;
  children?: ReactNode;
};

/** A module or an inventory add-on, drawn from its definition. */
export function CapabilityOption({ option, compact = false, ...rest }: CapabilityOptionProps) {
  return (
    <CapabilityRow
      name={option.name}
      description={option.description}
      icon={<CapabilityIcon type={option.key} />}
      compact={compact}
      detailsId={`${compact ? 'inventory' : 'module'}-${option.key}-details`}
      panel={
        <>
          <p className="mb-s text-lead leading-relaxed text-text-muted">{option.detail}</p>
          <ul className="m-0 grid list-none gap-2xs p-0">
            {option.includes.map((item) => (
              <li
                className="relative pl-s text-body-sm leading-normal text-text-muted before:absolute before:top-[0.4em] before:left-0 before:h-[4px] before:w-[4px] before:rounded-circle before:bg-action-primary before:content-['']"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      }
      {...rest}
    />
  );
}
